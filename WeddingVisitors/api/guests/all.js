import { connectDB, Photo } from '../_lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectDB();

  try {
    const photos = await Photo.find().sort({ uploaded_at: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve photos' });
  }
}