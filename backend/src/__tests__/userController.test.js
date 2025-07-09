const userController = require('../controllers/userController');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');

jest.mock('../models/User');
jest.mock('../models/UserSession');
jest.mock('../models/EmailVerificationToken');
jest.mock('../models/PasswordResetToken');
jest.mock('jsonwebtoken');
jest.mock('crypto');

// Helper for random token
crypto.randomBytes.mockImplementation(() => Buffer.from('a'.repeat(32)));


describe('userController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, headers: {}, ip: '127.0.0.1' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should return 400 if user already exists', async () => {
      req.body = { email: 'test@example.com', password: 'pass' };
      User.findOne.mockResolvedValue({});
      await userController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    it('should create user and verification token', async () => {
      req.body = { email: 'new@example.com', password: 'pass' };
      User.findOne.mockResolvedValue(null);
      const user = { id: 'user-1', email: 'new@example.com' };
      User.create.mockResolvedValue(user);
      EmailVerificationToken.create.mockResolvedValue({});
      await userController.registerUser(req, res);
      expect(User.create).toHaveBeenCalledWith({ email: 'new@example.com', password: 'pass', email_verified: false });
      expect(EmailVerificationToken.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: user.id, email: user.email, message: expect.any(String) });
    });

    it('should handle SequelizeValidationError', async () => {
      req.body = { email: 'bad', password: 'pass' };
      const error = { name: 'SequelizeValidationError', errors: [{ message: 'Invalid email' }] };
      User.findOne.mockRejectedValue(error);
      await userController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email' });
    });

    it('should handle other errors', async () => {
      req.body = { email: 'err@example.com', password: 'pass' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await userController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });

  describe('loginUser', () => {
    it('should return 401 if user not found', async () => {
      req.body = { email: 'notfound@example.com', password: 'pass' };
      User.findOne.mockResolvedValue(null);
      await userController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should return 401 if password is wrong', async () => {
      req.body = { email: 'test@example.com', password: 'wrong' };
      const user = { comparePassword: jest.fn().mockResolvedValue(false) };
      User.findOne.mockResolvedValue(user);
      await userController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should return 401 if email not verified', async () => {
      req.body = { email: 'test@example.com', password: 'pass' };
      const user = { comparePassword: jest.fn().mockResolvedValue(true), email_verified: false };
      User.findOne.mockResolvedValue(user);
      await userController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Please verify your email before logging in', needsVerification: true });
    });

    it('should return 401 if account is not active', async () => {
      req.body = { email: 'test@example.com', password: 'pass' };
      const user = { comparePassword: jest.fn().mockResolvedValue(true), email_verified: true, status: 'suspended' };
      User.findOne.mockResolvedValue(user);
      await userController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Your account is not active. Please contact support.', accountStatus: 'suspended' });
    });

    it('should login and return user info and token', async () => {
      req.body = { email: 'test@example.com', password: 'pass' };
      req.headers = { 'user-agent': 'jest', 'sec-ch-ua-platform': 'Node' };
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
        email_verified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue()
      };
      User.findOne.mockResolvedValue(user);
      UserSession.create.mockResolvedValue({ token: 'session-token' });
      await userController.loginUser(req, res);
      expect(UserSession.create).toHaveBeenCalled();
      expect(user.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ id: user.id, email: user.email, role: user.role, token: 'session-token', status: user.status });
    });

    it('should handle errors', async () => {
      req.body = { email: 'err@example.com', password: 'pass' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await userController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });

  describe('verifyEmail', () => {
    it('should return 400 if token is invalid or expired', async () => {
      req.params = { token: 'badtoken' };
      EmailVerificationToken.findOne.mockResolvedValue(null);
      await userController.verifyEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired verification token' });
    });

    it('should verify email and update token', async () => {
      req.params = { token: 'goodtoken' };
      const verificationToken = { user_id: 'user-1', update: jest.fn() };
      EmailVerificationToken.findOne.mockResolvedValue(verificationToken);
      User.update.mockResolvedValue();
      verificationToken.update.mockResolvedValue();
      await userController.verifyEmail(req, res);
      expect(User.update).toHaveBeenCalledWith({ email_verified: true }, { where: { id: verificationToken.user_id } });
      expect(verificationToken.update).toHaveBeenCalledWith({ used: true });
      expect(res.json).toHaveBeenCalledWith({ message: 'Email verified successfully' });
    });

    it('should handle errors', async () => {
      req.params = { token: 'errtoken' };
      EmailVerificationToken.findOne.mockRejectedValue(new Error('DB error'));
      await userController.verifyEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });

  describe('requestPasswordReset', () => {
    it('should return 404 if user not found', async () => {
      req.body = { email: 'notfound@example.com' };
      User.findOne.mockResolvedValue(null);
      await userController.requestPasswordReset(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should create reset token and return success', async () => {
      req.body = { email: 'test@example.com' };
      const user = { id: 'user-1', email: 'test@example.com' };
      User.findOne.mockResolvedValue(user);
      PasswordResetToken.create.mockResolvedValue({});
      await userController.requestPasswordReset(req, res);
      expect(PasswordResetToken.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset instructions sent to your email' });
    });

    it('should handle errors', async () => {
      req.body = { email: 'err@example.com' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await userController.requestPasswordReset(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if reset token is invalid or expired', async () => {
      req.body = { token: 'badtoken', newPassword: 'newpass' };
      PasswordResetToken.findOne.mockResolvedValue(null);
      await userController.resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired reset token' });
    });

    it('should reset password, update token, and invalidate sessions', async () => {
      req.body = { token: 'goodtoken', newPassword: 'newpass' };
      const resetToken = { user_id: 'user-1', update: jest.fn() };
      PasswordResetToken.findOne.mockResolvedValue(resetToken);
      const user = { id: 'user-1', update: jest.fn() };
      User.findByPk.mockResolvedValue(user);
      resetToken.update.mockResolvedValue();
      UserSession.update.mockResolvedValue();
      await userController.resetPassword(req, res);
      expect(user.update).toHaveBeenCalledWith({ password: 'newpass' });
      expect(resetToken.update).toHaveBeenCalledWith({ used: true });
      expect(UserSession.update).toHaveBeenCalledWith({ is_valid: false }, { where: { user_id: user.id } });
    });

    it('should handle errors', async () => {
      req.body = { token: 'errtoken', newPassword: 'newpass' };
      PasswordResetToken.findOne.mockRejectedValue(new Error('DB error'));
      await userController.resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });
}); 