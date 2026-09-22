const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'wedding-data.json');

// Initialize database file with both Admin & Usher credentials
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      admin_password: 'admin2026',  // Master Admin Password
      usher_password: 'usher2026',  // Usher / Gate Check-In Password
      guests: [],
      photos: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    
    // Ensure both passwords exist
    if (!data.admin_password) data.admin_password = 'admin2026';
    if (!data.usher_password) data.usher_password = 'usher2026';
    
    return data;
  } catch (e) {
    return { admin_password: 'admin2026', usher_password: 'usher2026', guests: [], photos: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const db = {
  // --- PASSWORD METHODS ---
  getAdminPassword() {
    return readData().admin_password || 'admin2026';
  },

  getUsherPassword() {
    return readData().usher_password || 'usher2026';
  },

  setAdminPassword(newPassword) {
    const data = readData();
    data.admin_password = newPassword.trim();
    writeData(data);
    return true;
  },

  setUsherPassword(newPassword) {
    const data = readData();
    data.usher_password = newPassword.trim();
    writeData(data);
    return true;
  },

  // --- GUEST METHODS ---
  getGuests() {
    return readData().guests;
  },

  findGuestByPhone(phone) {
    const data = readData();
    return data.guests.find(g => String(g.phone).trim() === String(phone).trim());
  },

  findGuestByCode(code) {
    const data = readData();
    return data.guests.find(g => String(g.unique_code).toUpperCase() === String(code).toUpperCase());
  },

  addGuest(guest) {
    const data = readData();
    const newGuest = {
      id: Date.now(),
      full_name: guest.full_name,
      phone: guest.phone,
      email: guest.email || null,
      unique_code: guest.unique_code,
      checked_in: false,
      registered_at: new Date().toISOString(),
      checked_in_at: null
    };
    data.guests.push(newGuest);
    writeData(data);
    return newGuest;
  },

  checkInGuest(code) {
    const data = readData();
    const guest = data.guests.find(g => String(g.unique_code).toUpperCase() === String(code).toUpperCase());
    if (guest) {
      guest.checked_in = true;
      guest.checked_in_at = new Date().toISOString();
      writeData(data);
      return guest;
    }
    return null;
  },

  deleteGuest(id) {
    const data = readData();
    data.guests = data.guests.filter(g => String(g.id) !== String(id));
    writeData(data);
  },

  // --- PHOTO METHODS ---
  getPhotos() {
    return readData().photos;
  },

  addPhoto(photo) {
    const data = readData();
    const newPhoto = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      filename: photo.filename,
      original_name: photo.original_name,
      uploaded_by: photo.uploaded_by || 'Anonymous',
      uploaded_at: new Date().toISOString()
    };
    data.photos.unshift(newPhoto);
    writeData(data);
    return newPhoto;
  },

  deletePhoto(id) {
    const data = readData();
    const photoToDelete = data.photos.find(p => String(p.id) === String(id));
    data.photos = data.photos.filter(p => String(p.id) !== String(id));
    writeData(data);
    return photoToDelete;
  }
};

initDB();
console.log('📦 Database initialized successfully with Role Access.');

module.exports = db;