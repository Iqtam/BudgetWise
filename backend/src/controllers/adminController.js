const admin = require('../config/firebase-admin');
const User = require('../models/User');

exports.setUserRole = async (req, res) => {
  try {
    const { uid, role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Look up user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: uid } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role });
    await admin.auth().setCustomUserClaims(uid, { role });

    res.json({ message: `Role updated to '${role}' for ${user.email}` });
  } catch (error) {
    console.error("[setUserRole] Error:", error);
    res.status(500).json({ error: 'Something went wrong while updating user role' });
  }
};
