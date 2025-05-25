const User = require('../models/User');
const UserSession = require('../models/UserSession');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

// Generate random token
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      email_verified: false
    });

    // Generate verification token
    const verificationToken = await EmailVerificationToken.create({
      user_id: user.id,
      token: generateRandomToken(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // TODO: Send verification email
    
    res.status(201).json({
      id: user.id,
      email: user.email,
      message: 'Registration successful. Please check your email for verification.'
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      platform: req.headers['sec-ch-ua-platform']
    };
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (user && (await user.comparePassword(password))) {
      if (!user.email_verified) {
        return res.status(401).json({ 
          message: 'Please verify your email before logging in',
          needsVerification: true 
        });
      }

      if (user.status !== 'active') {
        return res.status(401).json({ 
          message: 'Your account is not active. Please contact support.',
          accountStatus: user.status
        });
      }

      // Create user session
      const session = await UserSession.create({
        user_id: user.id,
        token: generateRandomToken(),
        device_info: deviceInfo,
        ip_address: req.ip,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        is_valid: true
      });

      // Update last login
      await user.update({ last_login: new Date() });

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        token: session.token,
        status: user.status
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const verificationToken = await EmailVerificationToken.findOne({
      where: {
        token,
        used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!verificationToken) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user and token
    await User.update(
      { email_verified: true },
      { where: { id: verificationToken.user_id } }
    );

    await verificationToken.update({ used: true });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = await PasswordResetToken.create({
      user_id: user.id,
      token: generateRandomToken(),
      expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      ip_address: req.ip
    });

    // TODO: Send password reset email

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and token
    const user = await User.findByPk(resetToken.user_id);
    await user.update({ password: newPassword });
    await resetToken.update({ used: true });

    // Invalidate all sessions
    await UserSession.update(
      { is_valid: false },
      { where: { user_id: user.id } }
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    await UserSession.update(
      { is_valid: false },
      { where: { token } }
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: ['UserProfile']
    });
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 