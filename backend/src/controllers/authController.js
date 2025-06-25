const admin = require('../config/firebase-admin');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

exports.syncFirebaseUser = async (req, res) => {
  try {
    console.log("[syncFirebaseUser] Incoming user object:", req.user);

    const { uid, email, name, picture } = req.user || {};
    if (!uid || !email) {
      return res.status(400).json({ error: 'Invalid Firebase user object' });
    }

    // Check if user exists by firebase_uid
    let user = await User.findOne({ where: { firebase_uid: uid } });

    if (!user) {
      const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

      // Create user letting DB generate UUID
      user = await User.create({ firebase_uid: uid, email, role });

      await UserProfile.create({
        user_id: user.id,  // Use the actual generated UUID
        full_name: name || '',
        profile_picture_url: picture || ''
      });

      await admin.auth().setCustomUserClaims(uid, { role });

      console.log(`[syncFirebaseUser] New user created: ${email} (${role})`);
      return res.status(201).json({ message: 'User created', role });
    }

    console.log(`[syncFirebaseUser] User exists: ${email}`);
    res.status(200).json({ message: 'User exists', role: user.role });

  } catch (error) {
    console.error("[syncFirebaseUser] Error:", error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    console.log("[getCurrentUser] Request user:", req.user);

    const uid = req.user?.uid;
    if (!uid) return res.status(400).json({ error: 'Missing user ID' });

    const user = await User.findOne({
      where: { firebase_uid: uid },
      attributes: ['id', 'email', 'role', 'firebase_uid'],
      include: [{
        model: UserProfile,
        attributes: ['full_name', 'profile_picture_url']
      }]
    });

    if (!user) {
      console.warn("[getCurrentUser] No user found with UID:", uid);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("[getCurrentUser] Error:", error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

