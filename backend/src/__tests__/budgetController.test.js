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

describe('Budget Controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('POST /budgets', () => {
    it('should create budget successfully', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        create: jest.fn().mockResolvedValue({
          id: 'test-budget-id',
          user_id: 'test-user-id',
          category_id: 'test-category-id',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          goal_amount: 1000.00,
          spent: 0.00,
          expired: false,
          amount_exceeded: false,
          icon_url: 'test-icon.png',
        }),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/budgets', mockFirebaseAuth, budgetController.createBudget);
      });

      const budgetData = {
        category_id: 'test-category-id',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
        icon_url: 'test-icon.png',
      };

      const response = await request(app)
        .post('/budgets')
        .send(budgetData)
        .expect(201);

      expect(response.body.message).toBe('Budget created successfully');
      expect(response.body.data).toMatchObject({
        id: 'test-budget-id',
        user_id: 'test-user-id',
        category_id: 'test-category-id',
        goal_amount: 1000.00,
        icon_url: 'test-icon.png',
      });
    });

    it('should create budget with default values', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        create: jest.fn().mockResolvedValue({
          id: 'test-budget-id',
          user_id: 'test-user-id',
          category_id: 'test-category-id',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '2024-12-31',
          goal_amount: 1000.00,
          spent: 0.00,
          expired: false,
          amount_exceeded: false,
        }),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/budgets', mockFirebaseAuth, budgetController.createBudget);
      });

      const budgetData = {
        category_id: 'test-category-id',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
      };

      const response = await request(app)
        .post('/budgets')
        .send(budgetData)
        .expect(201);

      expect(response.body.message).toBe('Budget created successfully');
    });

    it('should handle user not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/Budget', () => ({
        create: jest.fn().mockResolvedValue({}),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/budgets', mockFirebaseAuth, budgetController.createBudget);
      });

      const budgetData = {
        category_id: 'test-category-id',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
      };

      const response = await request(app)
        .post('/budgets')
        .send(budgetData)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        create: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/budgets', mockFirebaseAuth, budgetController.createBudget);
      });

      const budgetData = {
        category_id: 'test-category-id',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
      };

      const response = await request(app)
        .post('/budgets')
        .send(budgetData)
        .expect(500);

      expect(response.body.message).toBe('Database error');
    });
  });

  describe('GET /budgets', () => {
    it('should get all budgets successfully', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockResolvedValue([
          {
            id: 'budget-1',
            user_id: 'test-user-id',
            category_id: 'category-1',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            goal_amount: 1000.00,
            spent: 500.00,
            expired: false,
            amount_exceeded: false,
          },
          {
            id: 'budget-2',
            user_id: 'test-user-id',
            category_id: 'category-2',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            goal_amount: 500.00,
            spent: 600.00,
            expired: false,
            amount_exceeded: true,
          },
        ]),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/budgets', mockFirebaseAuth, budgetController.getAllBudgets);
      });

      const response = await request(app)
        .get('/budgets')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: 'budget-1',
        user_id: 'test-user-id',
        goal_amount: 1000.00,
        spent: 500.00,
      });
      expect(response.body[1]).toMatchObject({
        id: 'budget-2',
        user_id: 'test-user-id',
        goal_amount: 500.00,
        spent: 600.00,
        amount_exceeded: true,
      });
    });

    it('should handle user not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockResolvedValue([]),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/budgets', mockFirebaseAuth, budgetController.getAllBudgets);
      });

      const response = await request(app)
        .get('/budgets')
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/budgets', mockFirebaseAuth, budgetController.getAllBudgets);
      });

      const response = await request(app)
        .get('/budgets')
        .expect(500);

      expect(response.body.message).toBe('Database error');
    });
  });

  describe('GET /budgets/:id', () => {
    it('should get budget by ID successfully', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findOne: jest.fn().mockResolvedValue({
          id: 'test-budget-id',
          user_id: 'test-user-id',
          category_id: 'test-category-id',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          goal_amount: 1000.00,
          spent: 500.00,
          expired: false,
          amount_exceeded: false,
        }),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/budgets/:id', mockFirebaseAuth, budgetController.getBudgetById);
      });

      const response = await request(app)
        .get('/budgets/test-budget-id')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'test-budget-id',
        user_id: 'test-user-id',
        category_id: 'test-category-id',
        goal_amount: 1000.00,
        spent: 500.00,
      });
    });

    it('should handle user not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/Budget', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/budgets/:id', mockFirebaseAuth, budgetController.getBudgetById);
      });

      const response = await request(app)
        .get('/budgets/test-budget-id')
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should handle budget not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/budgets/:id', mockFirebaseAuth, budgetController.getBudgetById);
      });

      const response = await request(app)
        .get('/budgets/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Budget not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findOne: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/budgets/:id', mockFirebaseAuth, budgetController.getBudgetById);
      });

      const response = await request(app)
        .get('/budgets/test-budget-id')
        .expect(500);

      expect(response.body.message).toBe('Database error');
    });
  });

  describe('PUT /budgets/:id', () => {
    it('should update budget successfully', async () => {
      const mockBudget = {
        id: 'test-budget-id',
        user_id: 'test-user-id',
        category_id: 'test-category-id',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
        spent: 500.00,
        expired: false,
        amount_exceeded: false,
        update: jest.fn().mockImplementation((data) => {
          Object.assign(mockBudget, data);
          return Promise.resolve(mockBudget);
        }),
      };

      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findOne: jest.fn().mockResolvedValue(mockBudget),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.put('/budgets/:id', mockFirebaseAuth, budgetController.updateBudget);
      });

      const updateData = {
        goal_amount: 1500.00,
        end_date: '2024-12-31',
      };

      const response = await request(app)
        .put('/budgets/test-budget-id')
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Budget updated successfully');
      expect(response.body.data.goal_amount).toBe(1500.00);
      expect(mockBudget.update).toHaveBeenCalledWith(updateData);
    });

    it('should handle user not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/Budget', () => ({
        findOne: jest.fn().mockResolvedValue({}),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.put('/budgets/:id', mockFirebaseAuth, budgetController.updateBudget);
      });

      const updateData = {
        goal_amount: 1500.00,
      };

      const response = await request(app)
        .put('/budgets/test-budget-id')
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should handle budget not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.put('/budgets/:id', mockFirebaseAuth, budgetController.updateBudget);
      });

      const updateData = {
        goal_amount: 1500.00,
      };

      const response = await request(app)
        .put('/budgets/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Budget not found');
    });

    it('should handle database errors', async () => {
      const mockBudget = {
        id: 'test-budget-id',
        user_id: 'test-user-id',
        update: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findOne: jest.fn().mockResolvedValue(mockBudget),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.put('/budgets/:id', mockFirebaseAuth, budgetController.updateBudget);
      });

      const updateData = {
        goal_amount: 1500.00,
      };

      const response = await request(app)
        .put('/budgets/test-budget-id')
        .send(updateData)
        .expect(500);

      expect(response.body.message).toBe('Database error');
    });
  });

  describe('DELETE /budgets/:id', () => {
    it('should delete budget successfully', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        destroy: jest.fn().mockResolvedValue(1),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.delete('/budgets/:id', mockFirebaseAuth, budgetController.deleteBudget);
      });

      const response = await request(app)
        .delete('/budgets/test-budget-id')
        .expect(200);

      expect(response.body.message).toBe('Budget deleted successfully');
    });

    it('should handle user not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/Budget', () => ({
        destroy: jest.fn().mockResolvedValue(0),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.delete('/budgets/:id', mockFirebaseAuth, budgetController.deleteBudget);
      });

      const response = await request(app)
        .delete('/budgets/test-budget-id')
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should handle budget not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        destroy: jest.fn().mockResolvedValue(0),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.delete('/budgets/:id', mockFirebaseAuth, budgetController.deleteBudget);
      });

      const response = await request(app)
        .delete('/budgets/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Budget not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        destroy: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.delete('/budgets/:id', mockFirebaseAuth, budgetController.deleteBudget);
      });

      const response = await request(app)
        .delete('/budgets/test-budget-id')
        .expect(500);

      expect(response.body.message).toBe('Database error');
    });
  });

  describe('POST /budgets/sync', () => {
    it('should sync budget spending successfully', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockResolvedValue([
          {
            id: 'budget-1',
            user_id: 'test-user-id',
            category_id: 'category-1',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            goal_amount: 1000.00,
            spent: 0.00,
            update: jest.fn().mockResolvedValue(undefined),
          },
        ]),
      }));
      jest.doMock('../models/Transaction', () => ({
        sum: jest.fn().mockResolvedValue(500.00),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/budgets/sync', mockFirebaseAuth, budgetController.syncBudgetSpendingAPI);
      });

      const response = await request(app)
        .post('/budgets/sync')
        .expect(200);

      expect(response.body.message).toBe('Budget spending synced successfully');
    });

    it('should handle user not found', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockResolvedValue([]),
      }));
      jest.doMock('../models/Transaction', () => ({
        sum: jest.fn().mockResolvedValue(0),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/budgets/sync', mockFirebaseAuth, budgetController.syncBudgetSpendingAPI);
      });

      const response = await request(app)
        .post('/budgets/sync')
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockRejectedValue(new Error('Database error')),
      }));
      jest.doMock('../models/Transaction', () => ({
        sum: jest.fn().mockResolvedValue(0),
      }));

      let app, budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/budgets/sync', mockFirebaseAuth, budgetController.syncBudgetSpendingAPI);
      });

      const response = await request(app)
        .post('/budgets/sync')
        .expect(500);

      expect(response.body.message).toBe('Database error');
    });
  });

  describe('syncBudgetSpending helper function', () => {
    it('should sync budget spending for all user budgets', async () => {
      const mockBudget1 = {
        id: 'budget-1',
        user_id: 'test-user-id',
        category_id: 'category-1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
        spent: 0.00,
        update: jest.fn().mockResolvedValue(undefined),
      };
      const mockBudget2 = {
        id: 'budget-2',
        user_id: 'test-user-id',
        category_id: 'category-2',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        goal_amount: 500.00,
        spent: 0.00,
        update: jest.fn().mockResolvedValue(undefined),
      };

      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockResolvedValue([mockBudget1, mockBudget2]),
      }));
      jest.doMock('../models/Transaction', () => ({
        sum: jest.fn()
          .mockResolvedValueOnce(800.00) // For budget-1
          .mockResolvedValueOnce(600.00), // For budget-2
      }));

      let budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
      });

      await budgetController.syncBudgetSpending('test-user-id');

      expect(mockBudget1.update).toHaveBeenCalledWith({
        spent: 800.00,
        amount_exceeded: false, // 800 < 1000
      });
      expect(mockBudget2.update).toHaveBeenCalledWith({
        spent: 600.00,
        amount_exceeded: true, // 600 > 500
      });
    });

    it('should sync budget spending for specific category', async () => {
      const mockBudget = {
        id: 'budget-1',
        user_id: 'test-user-id',
        category_id: 'category-1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
        spent: 0.00,
        update: jest.fn().mockResolvedValue(undefined),
      };

      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockResolvedValue([mockBudget]),
      }));
      jest.doMock('../models/Transaction', () => ({
        sum: jest.fn().mockResolvedValue(1200.00),
      }));

      let budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
      });

      await budgetController.syncBudgetSpending('test-user-id', 'category-1');

      expect(mockBudget.update).toHaveBeenCalledWith({
        spent: 1200.00,
        amount_exceeded: true, // 1200 > 1000
      });
    });

    it('should skip budgets without category_id', async () => {
      const mockBudget1 = {
        id: 'budget-1',
        user_id: 'test-user-id',
        category_id: null, // No category
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
        spent: 0.00,
        update: jest.fn().mockResolvedValue(undefined),
      };
      const mockBudget2 = {
        id: 'budget-2',
        user_id: 'test-user-id',
        category_id: 'category-1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        goal_amount: 500.00,
        spent: 0.00,
        update: jest.fn().mockResolvedValue(undefined),
      };

      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockResolvedValue([mockBudget1, mockBudget2]),
      }));
      jest.doMock('../models/Transaction', () => ({
        sum: jest.fn().mockResolvedValue(600.00), // Only called for budget-2
      }));

      let budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
      });

      await budgetController.syncBudgetSpending('test-user-id');

      expect(mockBudget1.update).not.toHaveBeenCalled();
      expect(mockBudget2.update).toHaveBeenCalledWith({
        spent: 600.00,
        amount_exceeded: true, // 600 > 500
      });
    });

    it('should handle zero spent amount', async () => {
      const mockBudget = {
        id: 'budget-1',
        user_id: 'test-user-id',
        category_id: 'category-1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
        spent: 0.00,
        update: jest.fn().mockResolvedValue(undefined),
      };

      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockResolvedValue([mockBudget]),
      }));
      jest.doMock('../models/Transaction', () => ({
        sum: jest.fn().mockResolvedValue(null), // No transactions
      }));

      let budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
      });

      await budgetController.syncBudgetSpending('test-user-id');

      expect(mockBudget.update).toHaveBeenCalledWith({
        spent: 0,
        amount_exceeded: false, // 0 < 1000
      });
    });

    it('should handle negative spent amount (absolute value)', async () => {
      const mockBudget = {
        id: 'budget-1',
        user_id: 'test-user-id',
        category_id: 'category-1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        goal_amount: 1000.00,
        spent: 0.00,
        update: jest.fn().mockResolvedValue(undefined),
      };

      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockResolvedValue([mockBudget]),
      }));
      jest.doMock('../models/Transaction', () => ({
        sum: jest.fn().mockResolvedValue(-500.00), // Negative amount
      }));

      let budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
      });

      await budgetController.syncBudgetSpending('test-user-id');

      expect(mockBudget.update).toHaveBeenCalledWith({
        spent: 500.00, // Absolute value
        amount_exceeded: false, // 500 < 1000
      });
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/Budget', () => ({
        findAll: jest.fn().mockRejectedValue(new Error('Database error')),
      }));
      jest.doMock('../models/Transaction', () => ({
        sum: jest.fn().mockResolvedValue(0),
      }));

      let budgetController;
      jest.isolateModules(() => {
        budgetController = require('../controllers/budgetController');
      });

      await expect(budgetController.syncBudgetSpending('test-user-id')).rejects.toThrow('Database error');
    });
  });
}); 