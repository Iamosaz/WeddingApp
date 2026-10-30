import { connectDB, Guest } from '../_lib/database.js';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();
  const { full_name, phone, email } = req.body;

  if (!full_name || !phone) {
    return res.status(400).json({ error: 'Full name and phone number are required.' });
  }

  const cleanPhone = phone.trim();

  try {
    const totalCount = await Guest.countDocuments();
    if (totalCount >= 150) {
      return res.status(400).json({ error: 'Registration is closed. The maximum capacity of 150 guests has been reached.' });
    }

    const existing = await Guest.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(400).json({
        error: 'You are already registered!',
        unique_code: existing.unique_code,
        guest: existing,
      });
    }

    let unique_code = generateCode();
    while (await Guest.findOne({ unique_code })) {
      unique_code = generateCode();
    }

    const newGuest = await Guest.create({
      full_name: full_name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : null,
      unique_code,
    });

    res.json({
      success: true,
      message: 'RSVP confirmed! Please save your unique entrance code.',
      guest: newGuest,
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}