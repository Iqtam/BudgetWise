const request = require('supertest');
const express = require('express');

// Suppress console.error for cleaner test output
let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('Debt Controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('POST /debts', () => {
    it('should create debt successfully', async () => {
      jest.doMock('../models/Debt', () => ({
        create: jest.fn().mockResolvedValue({
          id: 'debt-1',
          user_id: 'user-1',
          description: 'Student Loan',
          type: 'bank',
          start_date: '2024-01-01',
          expiration_date: '2025-01-01',
          interest_rate: 5.5,
          amount: 1055.00, // 1000 * (1 + 5.5/100)
          original_amount: 1055.00,
          taken_from: 'Bank of America',
          is_fully_paid: false,
        }),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.post('/debts', debtController.createDebt);
      });
      const data = {
        user_id: 'user-1',
        description: 'Student Loan',
        type: 'bank',
        start_date: '2024-01-01',
        expiration_date: '2025-01-01',
        interest_rate: 5.5,
        amount: 1000,
        taken_from: 'Bank of America',
      };
      const response = await request(app)
        .post('/debts')
        .send(data)
        .expect(201);
      expect(response.body.message).toBe('Debt created successfully');
      expect(response.body.data.amount).toBe(1055.00); // With interest
    });

    it('should create debt with default start date', async () => {
      jest.doMock('../models/Debt', () => ({
        create: jest.fn().mockResolvedValue({
          id: 'debt-2',
          user_id: 'user-2',
          description: 'Credit Card',
          type: 'bank',
          start_date: new Date().toISOString().split('T')[0],
          expiration_date: '2024-12-31',
          interest_rate: 15.0,
          amount: 1150.00, // 1000 * (1 + 15/100)
          original_amount: 1150.00,
          taken_from: 'Chase',
          is_fully_paid: false,
        }),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.post('/debts', debtController.createDebt);
      });
      const data = {
        user_id: 'user-2',
        description: 'Credit Card',
        type: 'bank',
        expiration_date: '2024-12-31',
        interest_rate: 15.0,
        amount: 1000,
        taken_from: 'Chase',
      };
      const response = await request(app)
        .post('/debts')
        .send(data)
        .expect(201);
      expect(response.body.data.amount).toBe(1150.00);
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/Debt', () => ({
        create: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.post('/debts', debtController.createDebt);
      });
      const data = {
        user_id: 'user-1',
        description: 'Student Loan',
        type: 'bank',
        expiration_date: '2025-01-01',
        interest_rate: 5.5,
        amount: 1000,
      };
      const response = await request(app)
        .post('/debts')
        .send(data)
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });

    it('should handle validation errors', async () => {
      jest.doMock('../models/Debt', () => ({
        create: jest.fn().mockRejectedValue(new Error('Validation error: user_id cannot be null')),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.post('/debts', debtController.createDebt);
      });
      const data = {
        description: 'Student Loan',
        type: 'bank',
        expiration_date: '2025-01-01',
        interest_rate: 5.5,
        amount: 1000,
      };
      const response = await request(app)
        .post('/debts')
        .send(data)
        .expect(500);
      expect(response.body.message).toBe('Validation error: user_id cannot be null');
    });
  });

  describe('GET /debts', () => {
    it('should get all debts for a user', async () => {
      jest.doMock('../models/Debt', () => ({
        findAll: jest.fn().mockResolvedValue([
          { id: 'debt-1', user_id: 'user-1', description: 'Student Loan' },
          { id: 'debt-2', user_id: 'user-1', description: 'Credit Card' },
        ]),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.get('/debts', debtController.getAllDebts);
      });
      const response = await request(app)
        .get('/debts?user_id=user-1')
        .expect(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].user_id).toBe('user-1');
    });

    it('should get all debts (admin access)', async () => {
      jest.doMock('../models/Debt', () => ({
        findAll: jest.fn().mockResolvedValue([
          { id: 'debt-1', user_id: 'user-1', description: 'Student Loan' },
          { id: 'debt-2', user_id: 'user-2', description: 'Credit Card' },
        ]),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.get('/debts', debtController.getAllDebts);
      });
      const response = await request(app)
        .get('/debts')
        .expect(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when no debts exist', async () => {
      jest.doMock('../models/Debt', () => ({
        findAll: jest.fn().mockResolvedValue([]),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.get('/debts', debtController.getAllDebts);
      });
      const response = await request(app)
        .get('/debts')
        .expect(200);
      expect(response.body).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/Debt', () => ({
        findAll: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.get('/debts', debtController.getAllDebts);
      });
      const response = await request(app)
        .get('/debts')
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });
  });

  describe('GET /debts/:id', () => {
    it('should get debt by id', async () => {
      jest.doMock('../models/Debt', () => ({
        findByPk: jest.fn().mockResolvedValue({
          id: 'debt-1',
          user_id: 'user-1',
          description: 'Student Loan',
          amount: 1055.00,
        }),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.get('/debts/:id', debtController.getDebtById);
      });
      const response = await request(app)
        .get('/debts/debt-1')
        .expect(200);
      expect(response.body.id).toBe('debt-1');
    });

    it('should handle not found', async () => {
      jest.doMock('../models/Debt', () => ({
        findByPk: jest.fn().mockResolvedValue(null),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.get('/debts/:id', debtController.getDebtById);
      });
      const response = await request(app)
        .get('/debts/does-not-exist')
        .expect(404);
      expect(response.body.message).toBe('Debt not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/Debt', () => ({
        findByPk: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.get('/debts/:id', debtController.getDebtById);
      });
      const response = await request(app)
        .get('/debts/debt-1')
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });
  });

  describe('PUT /debts/:id', () => {
    it('should update debt successfully', async () => {
      const mockDebt = {
        id: 'debt-1',
        user_id: 'user-1',
        description: 'Student Loan',
        amount: 1055.00,
        update: jest.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };
      jest.doMock('../models/Debt', () => ({
        findByPk: jest.fn().mockResolvedValue(mockDebt),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.put('/debts/:id', debtController.updateDebt);
      });
      const updateData = { description: 'Updated Student Loan' };
      const response = await request(app)
        .put('/debts/debt-1')
        .send(updateData)
        .expect(200);
      expect(response.body.message).toBe('Debt updated successfully');
      expect(response.body.data.description).toBe('Updated Student Loan');
      expect(mockDebt.update).toHaveBeenCalledWith(updateData);
    });

    it('should handle not found', async () => {
      jest.doMock('../models/Debt', () => ({
        findByPk: jest.fn().mockResolvedValue(null),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.put('/debts/:id', debtController.updateDebt);
      });
      const updateData = { description: 'Updated Student Loan' };
      const response = await request(app)
        .put('/debts/does-not-exist')
        .send(updateData)
        .expect(404);
      expect(response.body.message).toBe('Debt not found');
    });

    it('should handle database errors', async () => {
      const mockDebt = {
        id: 'debt-1',
        update: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      jest.doMock('../models/Debt', () => ({
        findByPk: jest.fn().mockResolvedValue(mockDebt),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.put('/debts/:id', debtController.updateDebt);
      });
      const updateData = { description: 'Updated Student Loan' };
      const response = await request(app)
        .put('/debts/debt-1')
        .send(updateData)
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });
  });

  describe('DELETE /debts/:id', () => {
    it('should delete debt successfully', async () => {
      jest.doMock('../models/Debt', () => ({
        destroy: jest.fn().mockResolvedValue(1),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.delete('/debts/:id', debtController.deleteDebt);
      });
      const response = await request(app)
        .delete('/debts/debt-1')
        .expect(200);
      expect(response.body.message).toBe('Debt deleted successfully');
    });

    it('should handle not found', async () => {
      jest.doMock('../models/Debt', () => ({
        destroy: jest.fn().mockResolvedValue(0),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.delete('/debts/:id', debtController.deleteDebt);
      });
      const response = await request(app)
        .delete('/debts/does-not-exist')
        .expect(404);
      expect(response.body.message).toBe('Debt not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/Debt', () => ({
        destroy: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        app.delete('/debts/:id', debtController.deleteDebt);
      });
      const response = await request(app)
        .delete('/debts/debt-1')
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });
  });

  describe('POST /debts/:id/payment', () => {
    it('should make debt payment successfully', async () => {
      const mockDebt = {
        id: 'debt-1',
        user_id: 'user-1',
        amount: 1000.00,
        update: jest.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };
      const mockBalance = {
        user_id: 'user-1',
        balance: 2000.00,
        update: jest.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue(mockDebt),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue(mockBalance),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: 500.00 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(200);

      expect(response.body.message).toBe('Payment recorded successfully');
      expect(response.body.data.payment_amount).toBe(500.00);
      expect(response.body.data.remaining_debt).toBe(500.00);
      expect(response.body.data.is_fully_paid).toBe(false);
      expect(mockDebt.update).toHaveBeenCalledWith({
        amount: 500.00,
        last_payment_date: expect.any(String),
      });
      expect(mockBalance.update).toHaveBeenCalledWith({ balance: 1500.00 });
    });

    it('should fully pay off debt', async () => {
      const mockDebt = {
        id: 'debt-1',
        user_id: 'user-1',
        amount: 1000.00,
        fully_paid_date: null,
        update: jest.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };
      const mockBalance = {
        user_id: 'user-1',
        balance: 2000.00,
        update: jest.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue(mockDebt),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue(mockBalance),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: 1000.00 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(200);

      expect(response.body.data.is_fully_paid).toBe(true);
      expect(response.body.data.remaining_debt).toBe(0);
      expect(mockDebt.update).toHaveBeenCalledWith({
        amount: 0,
        last_payment_date: expect.any(String),
        is_fully_paid: true,
        fully_paid_date: expect.any(String),
      });
    });

    it('should handle user not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: 500.00 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should handle debt not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: 500.00 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(404);

      expect(response.body.message).toBe('Debt not found');
    });

    it('should handle invalid payment amount (zero)', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: 0 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(400);

      expect(response.body.message).toBe('Payment amount must be greater than 0');
    });

    it('should handle invalid payment amount (negative)', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: -100 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(400);

      expect(response.body.message).toBe('Payment amount must be greater than 0');
    });

    it('should handle payment amount exceeding debt amount', async () => {
      const mockDebt = {
        id: 'debt-1',
        user_id: 'user-1',
        amount: 1000.00,
      };
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue(mockDebt),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: 1500.00 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(400);

      expect(response.body.message).toBe('Payment amount cannot exceed total debt amount');
    });

    it('should handle insufficient balance', async () => {
      const mockDebt = {
        id: 'debt-1',
        user_id: 'user-1',
        amount: 1000.00,
      };
      const mockBalance = {
        user_id: 'user-1',
        balance: 500.00,
      };
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue(mockDebt),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue(mockBalance),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: 800.00 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(400);

      expect(response.body.message).toBe('Insufficient balance. Current balance: $500.00, Payment amount: $800.00');
    });

    it('should handle user balance not found', async () => {
      const mockDebt = {
        id: 'debt-1',
        user_id: 'user-1',
        amount: 1000.00,
      };
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue(mockDebt),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: 500.00 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(400);

      expect(response.body.message).toBe('User balance not found');
    });

    it('should handle database errors during payment', async () => {
      const mockDebt = {
        id: 'debt-1',
        user_id: 'user-1',
        amount: 1000.00,
        update: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      const mockBalance = {
        user_id: 'user-1',
        balance: 2000.00,
        update: jest.fn().mockResolvedValue({}),
      };
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Debt', () => ({
        findOne: jest.fn().mockResolvedValue(mockDebt),
      }));
      jest.doMock('../models/Balance', () => ({
        findOne: jest.fn().mockResolvedValue(mockBalance),
      }));

      let app, debtController;
      jest.isolateModules(() => {
        debtController = require('../controllers/debtController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/debts/:id/payment', mockFirebaseAuth, debtController.makeDebtPayment);
      });

      const paymentData = { payment_amount: 500.00 };
      const response = await request(app)
        .post('/debts/debt-1/payment')
        .send(paymentData)
        .expect(500);

      expect(response.body.message).toBe('DB error');
    });
  });
}); 