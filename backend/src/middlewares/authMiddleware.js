const User = require('../models/User');
const UserSession = require('../models/UserSession');
const { Op } = require('sequelize');

const protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Find valid session
    const session = await UserSession.findOne({
      where: {
        token,
        is_valid: true,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!session) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }

    // Get user
    const user = await User.findByPk(session.user_id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ 
        message: 'Account is not active',
        status: user.status 
      });
    }

    // Update session last activity
    await session.update({ last_activity: new Date() });

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Admin only middleware
const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { protect, adminOnly }; 