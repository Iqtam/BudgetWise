// Mock User and UserProfile before importing the controller to avoid Sequelize association errors
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn(),
}));
jest.mock('../models/UserProfile', () => ({
  create: jest.fn(),
}));

const authController = require('../controllers/authController');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

// Mock firebase-admin
jest.mock('../config/firebase-admin', () => {
  return {
    auth: jest.fn().mockReturnThis(),
    setCustomUserClaims: jest.fn(),
  };
});
const admin = require('../config/firebase-admin');

describe('authController', () => {
  let req, res;
  const OLD_ENV = process.env;

  beforeEach(() => {
    req = { user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    admin.auth.mockReturnValue({ setCustomUserClaims: jest.fn() });
    process.env = { ...OLD_ENV, ADMIN_EMAIL: 'admin@example.com' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('syncFirebaseUser', () => {
    it('should return 400 if user object is invalid', async () => {
      req.user = { email: 'test@example.com' };
      await authController.syncFirebaseUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid Firebase user object' });
    });

    it('should create a new user and profile, set admin role if email matches', async () => {
      req.user = { uid: 'uid-1', email: 'admin@example.com', name: 'Admin', picture: 'pic.png' };
      User.findOne.mockResolvedValue(null);
      const createdUser = { id: 'user-1', firebase_uid: 'uid-1', email: 'admin@example.com', role: 'admin' };
      User.create.mockResolvedValue(createdUser);
      UserProfile.create.mockResolvedValue({});
      const setCustomUserClaims = jest.fn();
      admin.auth.mockReturnValue({ setCustomUserClaims });
      await authController.syncFirebaseUser(req, res);
      expect(User.create).toHaveBeenCalledWith({ firebase_uid: 'uid-1', email: 'admin@example.com', role: 'admin' });
      expect(UserProfile.create).toHaveBeenCalledWith({ user_id: createdUser.id, full_name: 'Admin', profile_picture_url: 'pic.png' });
      expect(setCustomUserClaims).toHaveBeenCalledWith('uid-1', { role: 'admin' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User created', role: 'admin' });
    });

    it('should create a new user and profile, set user role if email does not match', async () => {
      req.user = { uid: 'uid-2', email: 'user@example.com', name: 'User', picture: 'pic2.png' };
      User.findOne.mockResolvedValue(null);
      const createdUser = { id: 'user-2', firebase_uid: 'uid-2', email: 'user@example.com', role: 'user' };
      User.create.mockResolvedValue(createdUser);
      UserProfile.create.mockResolvedValue({});
      const setCustomUserClaims = jest.fn();
      admin.auth.mockReturnValue({ setCustomUserClaims });
      await authController.syncFirebaseUser(req, res);
      expect(User.create).toHaveBeenCalledWith({ firebase_uid: 'uid-2', email: 'user@example.com', role: 'user' });
      expect(UserProfile.create).toHaveBeenCalledWith({ user_id: createdUser.id, full_name: 'User', profile_picture_url: 'pic2.png' });
      expect(setCustomUserClaims).toHaveBeenCalledWith('uid-2', { role: 'user' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User created', role: 'user' });
    });

    it('should return 200 if user already exists', async () => {
      req.user = { uid: 'uid-3', email: 'exists@example.com' };
      const existingUser = { role: 'user' };
      User.findOne.mockResolvedValue(existingUser);
      await authController.syncFirebaseUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User exists', role: 'user' });
    });

    it('should handle errors and return 500', async () => {
      req.user = { uid: 'uid-4', email: 'err@example.com' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await authController.syncFirebaseUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return 400 if user ID is missing', async () => {
      req.user = {};
      await authController.getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing user ID' });
    });

    it('should return 404 if user not found', async () => {
      req.user = { uid: 'uid-5' };
      User.findOne.mockResolvedValue(null);
      await authController.getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return user if found', async () => {
      req.user = { uid: 'uid-6' };
      const user = { id: 'user-6', email: 'user6@example.com', role: 'user', firebase_uid: 'uid-6', UserProfile: { full_name: 'User 6', profile_picture_url: 'pic6.png' } };
      User.findOne.mockResolvedValue(user);
      await authController.getCurrentUser(req, res);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should handle errors and return 500', async () => {
      req.user = { uid: 'uid-7' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await authController.getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
    });
  });
}); 