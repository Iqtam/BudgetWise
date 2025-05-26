const admin = require('../config/firebase-admin');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

exports.syncFirebaseUser = async (req, res) => {
  const { uid, email, name, picture } = req.user;
  let user = await User.findByPk(uid);

  if (!user) {
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
    user = await User.create({ id: uid, email, role });
    await UserProfile.create({ user_id: uid, full_name: name || '', profile_picture_url: picture || '' });
    await admin.auth().setCustomUserClaims(uid, { role });
    return res.status(201).json({ message: 'User created', role });
  }

  res.status(200).json({ message: 'User exists', role: user.role });
};

exports.getCurrentUser = async (req, res) => {
  const user = await User.findByPk(req.user.uid, {
    attributes: ['id', 'email', 'role'],
    include: [{ model: UserProfile, attributes: ['full_name', 'profile_picture_url'] }]
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};