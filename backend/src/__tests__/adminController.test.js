const adminController = require('../controllers/adminController');
const User = require('../models/User');

jest.mock('../models/User');

// Mock firebase-admin
jest.mock('../config/firebase-admin', () => {
  return {
    auth: jest.fn().mockReturnThis(),
    setCustomUserClaims: jest.fn(),
  };
});
const admin = require('../config/firebase-admin');


describe('adminController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    admin.auth.mockReturnValue({ setCustomUserClaims: jest.fn() });
  });

  describe('setUserRole', () => {
    it('should return 400 for invalid role', async () => {
      req.body = { uid: 'uid-1', role: 'superuser' };
      await adminController.setUserRole(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid role' });
    });

    it('should return 404 if user not found', async () => {
      req.body = { uid: 'uid-1', role: 'admin' };
      User.findOne.mockResolvedValue(null);
      await adminController.setUserRole(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should update user role and set custom claims', async () => {
      req.body = { uid: 'uid-1', role: 'admin' };
      const user = { email: 'test@example.com', update: jest.fn() };
      User.findOne.mockResolvedValue(user);
      user.update.mockResolvedValue();
      const setCustomUserClaims = jest.fn();
      admin.auth.mockReturnValue({ setCustomUserClaims });
      await adminController.setUserRole(req, res);
      expect(user.update).toHaveBeenCalledWith({ role: 'admin' });
      expect(setCustomUserClaims).toHaveBeenCalledWith('uid-1', { role: 'admin' });
      expect(res.json).toHaveBeenCalledWith({ message: `Role updated to 'admin' for test@example.com` });
    });

    it('should handle errors and return 500', async () => {
      req.body = { uid: 'uid-1', role: 'admin' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await adminController.setUserRole(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong while updating user role' });
    });
  });
}); 