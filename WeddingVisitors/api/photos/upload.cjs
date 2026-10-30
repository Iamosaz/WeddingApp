const { connectDB, Photo } = require('../_lib/database');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();
  const { photos, uploaded_by } = req.body;

  if (!photos || photos.length === 0) {
    return res.status(400).json({ error: 'No photos were selected for upload.' });
  }

  try {
    const uploadPromises = photos.map(async (photo) => {
      const result = await cloudinary.uploader.upload(photo.data, {
        folder: 'wedding_gallery',
        resource_type: 'image',
      });
      return Photo.create({
        url: result.secure_url,
        public_id: result.public_id,
        original_name: photo.name,
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
    res.status(500).json({ error: 'Failed to upload photo to cloud storage' });
  }
};