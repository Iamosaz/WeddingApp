const { connectDB, Settings } = require('../_lib/database');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();
  const { currentAdminPassword, targetRole, newPassword } = req.body;

  try {
    const settings = await Settings.findOne();
    if (!settings || currentAdminPassword !== settings.admin_password) {
      return res.status(403).json({ error: 'Master Admin password incorrect. Action blocked.' });
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    }

    if (targetRole === 'usher') {
      settings.usher_password = newPassword.trim();
    } else {
      settings.admin_password = newPassword.trim();
    }
    await settings.save();
    res.json({ success: true, message: `${targetRole === 'usher' ? 'Gate Usher' : 'Master Admin'} password successfully updated!` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
};