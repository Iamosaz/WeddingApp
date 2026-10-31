
import { connectDB, Photo } from '../_lib/database.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    // Connect to MongoDB safely
    await connectDB();

    const { photos, uploaded_by } = req.body || {};

    // Validate incoming photos
    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        error: 'Please select at least one photo.',
      });
    }

    if (photos.length > 10) {
      return res.status(400).json({
        error: 'You can upload a maximum of 10 photos at a time.',
      });
    }

    // Keep the complete Base64 payload below Vercel's request limit.
    const totalSize = photos.reduce(
      (total, photo) => total + (photo?.data?.length || 0),
      0
    );

    if (totalSize > 3500000) {
      return res.status(413).json({
        error: 'Your selected photos are too large. Please reduce their size or upload fewer photos.',
      });
    }

    // Validate image data
    for (const photo of photos) {
      if (
        typeof photo?.data !== 'string' ||
        !/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(photo.data)
      ) {
        return res.status(400).json({
          error: 'One or more selected files are not supported images.',
        });
      }
    }

    // Upload sequentially to avoid overwhelming Cloudinary
    const savedPhotos = [];

    for (const photo of photos) {
      const result = await cloudinary.uploader.upload(photo.data, {
        folder: 'wedding_gallery',
        resource_type: 'image',
      });

      const savedPhoto = await Photo.create({
        url: result.secure_url,
        public_id: result.public_id,
        original_name: photo.name || 'Guest photo',
        uploaded_by: uploaded_by?.trim() || 'A Loved Guest',
      });

      savedPhotos.push(savedPhoto);
    }

    return res.status(200).json({
      success: true,
      message: `${savedPhotos.length} photo(s) uploaded successfully to live gallery! 📸`,
      photos: savedPhotos,
    });

  } catch (err) {
    console.error('PHOTO UPLOAD ERROR:', err);

    return res.status(500).json({
      error: 'Photo upload failed. Please try again.',
    });
  }
}
