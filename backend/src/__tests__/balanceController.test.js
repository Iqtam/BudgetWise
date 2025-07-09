const balanceController = require('../controllers/balanceController');
const User = require('../models/User');
const Balance = require('../models/Balance');

jest.mock('../models/User');
jest.mock('../models/Balance');

describe('balanceController', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { uid: 'firebase-uid-1' }, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return 404 if user not found', async () => {
      User.findOne.mockResolvedValue(null);
      await balanceController.getBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should create and return new balance if not found', async () => {
      const user = { id: 'user-1' };
      User.findOne.mockResolvedValue(user);
      Balance.findOne.mockResolvedValue(null);
      const createdBalance = { id: 'bal-1', user_id: user.id, balance: 0 };
      Balance.create.mockResolvedValue(createdBalance);
      await balanceController.getBalance(req, res);
      expect(Balance.create).toHaveBeenCalledWith({ user_id: user.id, balance: 0.00 });
      expect(res.json).toHaveBeenCalledWith(createdBalance);
    });

    it('should return existing balance', async () => {
      const user = { id: 'user-1' };
      const balance = { id: 'bal-1', user_id: user.id, balance: 100 };
      User.findOne.mockResolvedValue(user);
      Balance.findOne.mockResolvedValue(balance);
      await balanceController.getBalance(req, res);
      expect(res.json).toHaveBeenCalledWith(balance);
    });

    it('should handle DB error', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));
      await balanceController.getBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });

  describe('updateBalance', () => {
    it('should return 400 if balance is missing', async () => {
      req.body = {};
      await balanceController.updateBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Balance amount is required' });
    });

    it('should return 404 if user not found', async () => {
      req.body = { balance: 50 };
      User.findOne.mockResolvedValue(null);
      await balanceController.updateBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should create new balance if not found', async () => {
      req.body = { balance: 200 };
      const user = { id: 'user-1' };
      User.findOne.mockResolvedValue(user);
      Balance.findOne.mockResolvedValue(null);
      const createdBalance = { id: 'bal-1', user_id: user.id, balance: 200 };
      Balance.create.mockResolvedValue(createdBalance);
      await balanceController.updateBalance(req, res);
      expect(Balance.create).toHaveBeenCalledWith({ user_id: user.id, balance: 200 });
      expect(res.json).toHaveBeenCalledWith({ message: 'Balance updated successfully', data: createdBalance });
    });

    it('should update existing balance', async () => {
      req.body = { balance: 300 };
      const user = { id: 'user-1' };
      const balance = { update: jest.fn(), id: 'bal-1', user_id: user.id, balance: 100 };
      User.findOne.mockResolvedValue(user);
      Balance.findOne.mockResolvedValue(balance);
      balance.update.mockResolvedValue();
      await balanceController.updateBalance(req, res);
      expect(balance.update).toHaveBeenCalledWith({ balance: 300 });
      expect(res.json).toHaveBeenCalledWith({ message: 'Balance updated successfully', data: balance });
    });

    it('should handle DB error', async () => {
      req.body = { balance: 100 };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await balanceController.updateBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });

  describe('adjustBalance', () => {
    it('should return 400 if amount or type missing', async () => {
      req.body = { type: 'add' };
      await balanceController.adjustBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Amount and type are required' });
    });

    it('should return 400 if type is invalid', async () => {
      req.body = { amount: 10, type: 'multiply' };
      await balanceController.adjustBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Type must be "add" or "subtract"' });
    });

    it('should return 404 if user not found', async () => {
      req.body = { amount: 10, type: 'add' };
      User.findOne.mockResolvedValue(null);
      await balanceController.adjustBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should create new balance if not found (add)', async () => {
      req.body = { amount: 50, type: 'add' };
      const user = { id: 'user-1' };
      User.findOne.mockResolvedValue(user);
      Balance.findOne.mockResolvedValue(null);
      const createdBalance = { id: 'bal-1', user_id: user.id, balance: 50 };
      Balance.create.mockResolvedValue(createdBalance);
      await balanceController.adjustBalance(req, res);
      expect(Balance.create).toHaveBeenCalledWith({ user_id: user.id, balance: 50 });
      expect(res.json).toHaveBeenCalledWith({ message: 'Balance increased successfully', data: createdBalance });
    });

    it('should create new balance if not found (subtract)', async () => {
      req.body = { amount: 20, type: 'subtract' };
      const user = { id: 'user-1' };
      User.findOne.mockResolvedValue(user);
      Balance.findOne.mockResolvedValue(null);
      const createdBalance = { id: 'bal-1', user_id: user.id, balance: -20 };
      Balance.create.mockResolvedValue(createdBalance);
      await balanceController.adjustBalance(req, res);
      expect(Balance.create).toHaveBeenCalledWith({ user_id: user.id, balance: -20 });
      expect(res.json).toHaveBeenCalledWith({ message: 'Balance decreased successfully', data: createdBalance });
    });

    it('should add to existing balance', async () => {
      req.body = { amount: 30, type: 'add' };
      const user = { id: 'user-1' };
      const balance = { balance: 100, update: jest.fn(), id: 'bal-1', user_id: user.id };
      User.findOne.mockResolvedValue(user);
      Balance.findOne.mockResolvedValue(balance);
      balance.update.mockResolvedValue();
      await balanceController.adjustBalance(req, res);
      expect(balance.update).toHaveBeenCalledWith({ balance: 130 });
      expect(res.json).toHaveBeenCalledWith({ message: 'Balance increased successfully', data: balance });
    });

    it('should subtract from existing balance', async () => {
      req.body = { amount: 40, type: 'subtract' };
      const user = { id: 'user-1' };
      const balance = { balance: 100, update: jest.fn(), id: 'bal-1', user_id: user.id };
      User.findOne.mockResolvedValue(user);
      Balance.findOne.mockResolvedValue(balance);
      balance.update.mockResolvedValue();
      await balanceController.adjustBalance(req, res);
      expect(balance.update).toHaveBeenCalledWith({ balance: 60 });
      expect(res.json).toHaveBeenCalledWith({ message: 'Balance decreased successfully', data: balance });
    });

    it('should handle DB error', async () => {
      req.body = { amount: 10, type: 'add' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await balanceController.adjustBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });
}); 