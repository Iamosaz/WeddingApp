require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const cloudinary = require('cloudinary').v2;
const { connectDB, Guest, Photo, Settings } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary for permanent image hosting
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Multer memory storage (upload directly to Cloudinary without temporary local disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB high-res phone camera support
});

// Helper to stream upload image buffer directly to Cloudinary
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'wedding_gallery', resource_type: 'image' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
}

// ✅ BULLETPROOF CORS SETTINGS (Resolves "cannot get API" blocked by browsers)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB Atlas
connectDB();

// Helper: Generates a 6-character clean alphanumeric entrance code
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ==========================================
// 1. HEALTH CHECK ROUTE
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Wedding Cloud API is running smoothly! 💍' });
});

// ==========================================
// 2. DUAL-ROLE AUTHENTICATION ROUTES
// ==========================================

// Login Route: Auto-detects whether user is Master Admin or Gate Usher
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ admin_password: 'admin2026', usher_password: 'usher2026' });
    }

    if (password === settings.admin_password) {
      return res.json({ success: true, role: 'admin', message: 'Logged in as Master Admin 👑' });
    } else if (password === settings.usher_password) {
      return res.json({ success: true, role: 'usher', message: 'Logged in as Gate Usher 🛡️' });
    } else {
      return res.status(401).json({ error: 'Incorrect password. Access denied.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Change Passwords (ONLY MASTER ADMIN CAN DO THIS)
app.post('/api/admin/change-password', async (req, res) => {
  const { currentAdminPassword, targetRole, newPassword } = req.body;

  try {
    const settings = await Settings.findOne();
    if (!settings || currentAdminPassword !== settings.admin_password) {
      return res.status(403).json({ error: 'Master Admin password incorrect. Action blocked.' });
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    }

    if (targetRole === 'usher') {
      settings.usher_password = newPassword.trim();
      await settings.save();
      res.json({ success: true, message: 'Gate Usher password successfully updated!' });
    } else {
      settings.admin_password = newPassword.trim();
      await settings.save();
      res.json({ success: true, message: 'Master Admin password successfully updated!' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// ==========================================
// 3. GUEST & RSVP ROUTES (STORED IN MONGODB PERMANENTLY)
// ==========================================

// Register a new guest
app.post('/api/guests/register', async (req, res) => {
  const { full_name, phone, email } = req.body;

  if (!full_name || !phone) {
    return res.status(400).json({ error: 'Full name and phone number are required.' });
  }

  const cleanPhone = phone.trim();

  try {
    const totalCount = await Guest.countDocuments();
    if (totalCount >= 150) {
      return res.status(400).json({
        error: 'Registration is closed. The maximum capacity of 150 guests has been reached.',
      });
    }

    const existing = await Guest.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(400).json({
        error: 'You are already registered!',
        unique_code: existing.unique_code,
        guest: existing,
      });
    }

    let unique_code = generateCode();
    while (await Guest.findOne({ unique_code })) {
      unique_code = generateCode();
    }

    const newGuest = await Guest.create({
      full_name: full_name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : null,
      unique_code,
    });

    res.json({
      success: true,
      message: 'RSVP confirmed! Please save your unique entrance code.',
      guest: newGuest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Get all guests
app.get('/api/guests/all', async (req, res) => {
  try {
    const guests = await Guest.find().sort({ registered_at: -1 });
    const total = guests.length;
    const checkedIn = guests.filter((g) => g.checked_in).length;
    res.json({ guests, total, checkedIn, maxLimit: 150 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve guest list' });
  }
});

// Gate check-in
app.post('/api/guests/checkin', async (req, res) => {
  const { unique_code } = req.body;
  if (!unique_code) {
    return res.status(400).json({ error: 'Unique code is required.' });
  }

  try {
    const guest = await Guest.findOne({ unique_code: unique_code.trim().toUpperCase() });
    if (!guest) {
      return res.status(404).json({ error: 'Invalid code. Guest not found on list.' });
    }

    if (guest.checked_in) {
      return res.status(400).json({
        error: `Guest "${guest.full_name}" is ALREADY checked in!`,
        guest,
      });
    }

    guest.checked_in = true;
    guest.checked_in_at = new Date();
    await guest.save();

    res.json({
      success: true,
      message: `Welcome, ${guest.full_name}! Check-in successful.`,
      guest,
    });
  } catch (err) {
    res.status(500).json({ error: 'Check-in failed' });
  }
});

// Delete a guest
app.delete('/api/guests/:id', async (req, res) => {
  try {
    await Guest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Guest removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove guest' });
  }
});

// Export to styled Excel sheet
app.get('/api/guests/export', async (req, res) => {
  try {
    const guests = await Guest.find().sort({ registered_at: 1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Wedding Attendance');

    sheet.columns = [
      { header: 'S/N', key: 'sn', width: 8 },
      { header: 'Full Name', key: 'full_name', width: 30 },
      { header: 'Phone Number', key: 'phone', width: 22 },
      { header: 'Email Address', key: 'email', width: 26 },
      { header: 'Entrance Code', key: 'unique_code', width: 18 },
      { header: 'Checked In', key: 'checked_in', width: 15 },
      { header: 'Registered On', key: 'registered_at', width: 24 },
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF722F37' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    guests.forEach((g, idx) => {
      const row = sheet.addRow({
        sn: idx + 1,
        full_name: g.full_name,
        phone: g.phone,
        email: g.email || 'N/A',
        unique_code: g.unique_code,
        checked_in: g.checked_in ? 'YES' : 'NO',
        registered_at: new Date(g.registered_at).toLocaleString(),
      });

      if (g.checked_in) {
        row.getCell('checked_in').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD4EDDA' },
        };
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=wedding_attendance_list.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

// ==========================================
// 4. PHOTO GALLERY ROUTES (PERMANENT CLOUDINARY CDN HOSTING)
// ==========================================

// Upload multiple photos to Cloudinary
app.post('/api/photos/upload', upload.array('photos', 10), async (req, res) => {
  const { uploaded_by } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No photos were selected for upload.' });
  }

  try {
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer);
      return Photo.create({
        url: result.secure_url,
        public_id: result.public_id,
        original_name: file.originalname,
        uploaded_by: uploaded_by ? uploaded_by.trim() : 'A Loved Guest',
      });
    });

    const savedPhotos = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: `${savedPhotos.length} photo(s) uploaded successfully to live gallery! 📸`,
      photos: savedPhotos,
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload photo to cloud storage' });
  }
});

// Get all uploaded photos
app.get('/api/photos/all', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ uploaded_at: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve photos' });
  }
});

// AUTO-SYNC CLOUDINARY → MONGODB
app.get('/api/photos/sync', async (req, res) => {
  try {
    let allResources = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'wedding_gallery/',
        max_results: 500,
        next_cursor: nextCursor,
      });
      allResources = allResources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    let restored = 0;
    let skipped = 0;

    for (const file of allResources) {
      const exists = await Photo.findOne({ 
        $or: [{ url: file.secure_url }, { public_id: file.public_id }] 
      });
      
      if (!exists) {
        await Photo.create({
          url: file.secure_url,
          public_id: file.public_id,
          original_name: file.public_id.split('/').pop(),
          uploaded_by: 'Wedding Guest',
          uploaded_at: new Date(file.created_at),
        });
        restored++;
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Sync complete! ${restored} photo(s) restored from Cloudinary.`,
      restored,
      skipped,
      total_in_cloudinary: allResources.length,
    });
  } catch (err) {
    console.error('Sync Error:', err);
    res.status(500).json({ error: 'Failed to sync photos from Cloudinary: ' + err.message });
  }
});

// Delete a photo permanently
app.delete('/api/photos/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (photo) {
      if (photo.public_id) {
        try {
          await cloudinary.uploader.destroy(photo.public_id);
        } catch (e) {
          console.error('Cloudinary delete error:', e);
        }
      }
      await Photo.findByIdAndDelete(req.params.id);
    }
    res.json({ success: true, message: 'Photo deleted permanently.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🎊 Cloud Server running on port ${PORT}`);
});