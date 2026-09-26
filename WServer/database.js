const mongoose = require('mongoose');

// 1. Guest Schema
const guestSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: null },
  unique_code: { type: String, required: true, unique: true },
  checked_in: { type: Boolean, default: false },
  registered_at: { type: Date, default: Date.now },
  checked_in_at: { type: Date, default: null }
});

// 2. Photo Schema
const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, default: null },
  original_name: { type: String, default: 'wedding-moment.jpg' },
  uploaded_by: { type: String, default: 'A Loved Guest' },
  uploaded_at: { type: Date, default: Date.now }
});

// 3. Admin Settings Schema
const adminSchema = new mongoose.Schema({
  admin_password: { type: String, default: 'admin2026' },
  usher_password: { type: String, default: 'usher2026' }
});

const Guest = mongoose.model('Guest', guestSchema);
const Photo = mongoose.model('Photo', photoSchema);
const Settings = mongoose.model('Settings', adminSchema);

// Connect to MongoDB Atlas Cloud
async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is missing!');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('☁️ Connected to MongoDB Atlas permanently!');

    // Initialize default passwords if database is fresh
    const existing = await Settings.findOne();
    if (!existing) {
      await Settings.create({ admin_password: 'admin2026', usher_password: 'usher2026' });
      console.log('🔑 Initialized Admin and Usher credentials in MongoDB.');
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
  }
}

module.exports = {
  connectDB,
  Guest,
  Photo,
  Settings
};