const { connectDB, Photo } = require('../_lib/database');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  await connectDB();

  try {
    const photo = await Photo.findById(req.query.id);
    if (photo && photo.public_id) {
      try { await cloudinary.uploader.destroy(photo.public_id); } catch (e) {}
    }
    await Photo.findByIdAndDelete(req.query.id);
    res.json({ success: true, message: 'Photo deleted permanently.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};