
import { connectDB, Photo } from '../_lib/database.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Retrieve all uploaded photos
    const photos = await Photo.find({})
      .sort({ uploaded_at: -1 })
      .lean();

    // Return photos to the gallery
    return res.status(200).json(photos);

  } catch (err) {
    console.error('PHOTO RETRIEVAL ERROR:', err);

    return res.status(500).json({
      error: 'Failed to retrieve photos',
      details: process.env.NODE_ENV === 'development'
        ? err.message
        : undefined,
    });
  }
}
