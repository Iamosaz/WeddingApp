import { connectDB, Guest } from '../_lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  await connectDB();

  try {
    await Guest.findByIdAndDelete(req.query.id);
    res.json({ success: true, message: 'Guest removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove guest' });
  }
}