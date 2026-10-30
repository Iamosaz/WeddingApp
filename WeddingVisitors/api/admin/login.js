import { connectDB, Settings } from '../_lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();
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
}