const { connectDB, Guest } = require('../_lib/database');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectDB();

  try {
    const guests = await Guest.find().sort({ registered_at: -1 });
    const total = guests.length;
    const checkedIn = guests.filter((g) => g.checked_in).length;
    res.json({ guests, total, checkedIn, maxLimit: 150 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve guest list' });
  }
};