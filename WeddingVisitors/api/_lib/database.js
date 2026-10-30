import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is missing!');
    return;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI);
  }
  cached.conn = await cached.promise;

  const Settings = mongoose.models.Settings;
  if (Settings) {
    const existing = await Settings.findOne();
    if (!existing) {
      await Settings.create({ admin_password: 'admin2026', usher_password: 'usher2026' });
    }
  }

  return cached.conn;
}

const guestSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: null },
  unique_code: { type: String, required: true, unique: true },
  checked_in: { type: Boolean, default: false },
  registered_at: { type: Date, default: Date.now },
  checked_in_at: { type: Date, default: null },
});
const Guest = mongoose.models.Guest || mongoose.model('Guest', guestSchema);

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, default: null },
  original_name: { type: String, default: 'wedding-moment.jpg' },
  uploaded_by: { type: String, default: 'A Loved Guest' },
  uploaded_at: { type: Date, default: Date.now },
});
const Photo = mongoose.models.Photo || mongoose.model('Photo', photoSchema);

const adminSchema = new mongoose.Schema({
  admin_password: { type: String, default: 'admin2026' },
  usher_password: { type: String, default: 'usher2026' },
});
const Settings = mongoose.models.Settings || mongoose.model('Settings', adminSchema);

export { connectDB, Guest, Photo, Settings };