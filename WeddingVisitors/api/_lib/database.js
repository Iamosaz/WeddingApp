import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: null },
  unique_code: { type: String, required: true, unique: true },
  checked_in: { type: Boolean, default: false },
  registered_at: { type: Date, default: Date.now },
  checked_in_at: { type: Date, default: null }
});

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, default: null },
  original_name: { type: String, default: 'wedding-moment.jpg' },
  uploaded_by: { type: String, default: 'A Loved Guest' },
  uploaded_at: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  admin_password: { type: String, default: 'admin2026' },
  usher_password: { type: String, default: 'usher2026' }
});

const Guest = mongoose.models.Guest || mongoose.model('Guest', guestSchema);
const Photo = mongoose.models.Photo || mongoose.model('Photo', photoSchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', adminSchema);

// Cache the connection across invocations so cold starts and parallel
// requests share one connection attempt instead of racing each other.
const cached =
  global._mongooseCache || (global._mongooseCache = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow a retry on the next request
    throw err;
  }

  return cached.conn;
}

export { connectDB, Guest, Photo, Settings };