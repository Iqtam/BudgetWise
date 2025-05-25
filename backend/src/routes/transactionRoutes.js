const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  logout
} = require('../controllers/transactionController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(protect);
router.get('/profile', getUserProfile);
router.post('/logout', logout);

module.exports = router; 