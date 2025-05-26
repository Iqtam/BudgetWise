const admin = require('../config/firebase-admin');
const User = require('../models/User');

exports.setUserRole = async (req, res) => {
  const { uid, role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const user = await User.findByPk(uid);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await user.update({ role });
  await admin.auth().setCustomUserClaims(uid, { role });
  res.json({ message: `Role updated to '${role}' for ${user.email}` });
};