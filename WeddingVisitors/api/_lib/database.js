import { v2 as cloudinary } from 'cloudinary';
import { connectDB, Photo } from '../_lib/database.js';

// Reads CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
// (If you set a single CLOUDINARY_URL instead, Cloudinary picks it up by itself.)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { photos, uploaded_by } = req.body || {};

    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'No photos received' });
    }

    const uploader = (uploaded_by || 'A Loved Guest').toString().slice(0, 60);
    const saved = [];

    for (const item of photos.slice(0, 10)) {
      if (!item || typeof item.data !== 'string' || !item.data.startsWith('data:image/')) {
        continue;
      }

      const result = await cloudinary.uploader.upload(item.data, {
        folder: 'wedding_gallery',
        resource_type: 'image',
      });

      const doc = await Photo.create({
        url: result.secure_url,
        public_id: result.public_id,
        original_name: item.name || 'wedding-moment.jpg',
        uploaded_by: uploader,
      });

      saved.push(doc);
    }

    if (saved.length === 0) {
      return res.status(400).json({ error: 'No valid images found' });
    }

    return res.status(201).json({
      success: true,
      message: `${saved.length} photo(s) uploaded successfully! 🎉`,
      photos: saved,
    });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    // "detail" is for debugging; remove it once uploads work.
    return res.status(500).json({ error: 'Upload failed', detail: err.message });
  }
}