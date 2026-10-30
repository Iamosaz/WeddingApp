import mongoose from 'mongoose';
import { connectDB } from './_lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // 1 = connected, 2 = connecting, 0 = disconnected, 3 = disconnecting
    const dbState = mongoose.connection.readyState;

    return res.status(200).json({
      status: 'ok',
      database: dbState === 1 ? 'connected' : 'not connected',
      time: new Date().toISOString(),
    });
  } catch (err) {
    console.error('HEALTH ERROR:', err);
    return res.status(500).json({
      status: 'error',
      database: 'unreachable',
    });
  }
}