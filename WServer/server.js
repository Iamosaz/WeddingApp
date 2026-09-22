const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares with high payload limit for mobile phone images/data
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded photos publicly
app.use('/uploads', express.static(uploadsDir));

// Multer storage config: supports high-resolution photos up to 25MB each
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per photo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, etc.) are allowed!'), false);
    }
  },
});

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
  res.json({ status: 'ok', message: 'Wedding API is running smoothly! 💍' });
});

// ==========================================
// 2. DUAL-ROLE AUTHENTICATION ROUTES
// ==========================================

// Login Route: Auto-detects whether user is Master Admin or Gate Usher
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPass = db.getAdminPassword();
  const usherPass = db.getUsherPassword();

  if (password === adminPass) {
    return res.json({ 
      success: true, 
      role: 'admin', 
      message: 'Logged in as Master Admin 👑' 
    });
  } else if (password === usherPass) {
    return res.json({ 
      success: true, 
      role: 'usher', 
      message: 'Logged in as Gate Usher 🛡️' 
    });
  } else {
    return res.status(401).json({ error: 'Incorrect password. Access denied.' });
  }
});

// Change Passwords (ONLY MASTER ADMIN CAN DO THIS)
app.post('/api/admin/change-password', (req, res) => {
  const { currentAdminPassword, targetRole, newPassword } = req.body;
  const existingAdminPass = db.getAdminPassword();

  // Strict verification: only current valid Master Admin password authorizes changes
  if (currentAdminPassword !== existingAdminPass) {
    return res.status(403).json({ error: 'Master Admin password is incorrect. Action blocked.' });
  }

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
  }

  if (targetRole === 'usher') {
    db.setUsherPassword(newPassword.trim());
    res.json({ success: true, message: 'Gate Usher password successfully updated!' });
  } else {
    db.setAdminPassword(newPassword.trim());
    res.json({ success: true, message: 'Master Admin password successfully updated!' });
  }
});

// ==========================================
// 3. GUEST & RSVP ROUTES
// ==========================================

// Register a new guest
app.post('/api/guests/register', (req, res) => {
  const { full_name, phone, email } = req.body;

  if (!full_name || !phone) {
    return res.status(400).json({ error: 'Full name and phone number are required.' });
  }

  const cleanPhone = phone.trim();
  const allGuests = db.getGuests();

  // 1. Strict limit: Maximum 150 guests
  if (allGuests.length >= 150) {
    return res.status(400).json({
      error: 'Registration is closed. The maximum capacity of 150 guests has been reached.',
    });
  }

  // 2. Check if phone is already registered
  const existing = db.findGuestByPhone(cleanPhone);
  if (existing) {
    return res.status(400).json({
      error: 'You are already registered!',
      unique_code: existing.unique_code,
      guest: existing,
    });
  }

  // 3. Generate a guaranteed unique 6-character code
  let unique_code = generateCode();
  while (db.findGuestByCode(unique_code)) {
    unique_code = generateCode();
  }

  const newGuest = db.addGuest({
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
});

// Get all guests (For Dashboard & Counters)
app.get('/api/guests/all', (req, res) => {
  const guests = db.getGuests();
  const total = guests.length;
  const checkedIn = guests.filter((g) => g.checked_in).length;
  res.json({ guests, total, checkedIn, maxLimit: 150 });
});

// Check-in guest by code on wedding day
app.post('/api/guests/checkin', (req, res) => {
  const { unique_code } = req.body;
  if (!unique_code) {
    return res.status(400).json({ error: 'Unique code is required.' });
  }

  const guest = db.findGuestByCode(unique_code.trim());
  if (!guest) {
    return res.status(404).json({ error: 'Invalid code. Guest not found on list.' });
  }

  if (guest.checked_in) {
    return res.status(400).json({
      error: `Guest "${guest.full_name}" is ALREADY checked in!`,
      guest,
    });
  }

  const updated = db.checkInGuest(unique_code.trim());
  res.json({
    success: true,
    message: `Welcome, ${updated.full_name}! Check-in successful.`,
    guest: updated,
  });
});

// Delete a guest (Admin action)
app.delete('/api/guests/:id', (req, res) => {
  db.deleteGuest(req.params.id);
  res.json({ success: true, message: 'Guest removed successfully.' });
});

// Export all guests to styled Excel sheet (.xlsx)
app.get('/api/guests/export', async (req, res) => {
  try {
    const guests = db.getGuests();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Wedding Attendance');

    // Table columns
    sheet.columns = [
      { header: 'S/N', key: 'sn', width: 8 },
      { header: 'Full Name', key: 'full_name', width: 30 },
      { header: 'Phone Number', key: 'phone', width: 22 },
      { header: 'Email Address', key: 'email', width: 26 },
      { header: 'Entrance Code', key: 'unique_code', width: 18 },
      { header: 'Checked In', key: 'checked_in', width: 15 },
      { header: 'Registered On', key: 'registered_at', width: 24 },
    ];

    // Style Header Row (Deep Wine background with bold white text)
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF722F37' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Populate rows
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

      // Highlight checked-in guests in light green
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
// 4. PHOTO GALLERY ROUTES
// ==========================================

// Upload multiple photos (up to 10 at a time, 25MB each)
app.post('/api/photos/upload', upload.array('photos', 10), (req, res) => {
  const { uploaded_by } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No photos were selected for upload.' });
  }

  const uploadedPhotos = req.files.map((file) =>
    db.addPhoto({
      filename: file.filename,
      original_name: file.originalname,
      uploaded_by: uploaded_by ? uploaded_by.trim() : 'A Loved Guest',
    })
  );

  res.json({
    success: true,
    message: `${uploadedPhotos.length} photo(s) uploaded successfully!`,
    photos: uploadedPhotos,
  });
});

// Get all uploaded photos
app.get('/api/photos/all', (req, res) => {
  res.json(db.getPhotos());
});

// Delete a photo permanently (Admin action)
app.delete('/api/photos/:id', (req, res) => {
  const photoId = req.params.id;
  const deletedPhoto = db.deletePhoto(photoId);

  if (deletedPhoto && deletedPhoto.filename) {
    const filePath = path.join(uploadsDir, deletedPhoto.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('File unlink error:', err);
      }
    }
  }

  res.json({ success: true, message: 'Photo deleted permanently.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🎊 Server running on http://localhost:${PORT}`);
});