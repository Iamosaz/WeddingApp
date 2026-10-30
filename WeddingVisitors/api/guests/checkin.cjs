const { connectDB, Guest } = require('../_lib/database');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();
  const { unique_code } = req.body;

  if (!unique_code) {
    return res.status(400).json({ error: 'Unique code is required.' });
  }

  try {
    const guest = await Guest.findOne({ unique_code: unique_code.trim().toUpperCase() });
    if (!guest) {
      return res.status(404).json({ error: 'Invalid code. Guest not found on list.' });
    }

    if (guest.checked_in) {
      return res.status(400).json({ error: `Guest "${guest.full_name}" is ALREADY checked in!`, guest });
    }

    guest.checked_in = true;
    guest.checked_in_at = new Date();
    await guest.save();

    res.json({ success: true, message: `Welcome, ${guest.full_name}! Check-in successful.`, guest });
  } catch (err) {
    res.status(500).json({ error: 'Check-in failed' });
  }
};