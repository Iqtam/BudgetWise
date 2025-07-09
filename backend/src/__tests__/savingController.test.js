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

describe('Saving Controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('POST /savings', () => {
    it('should create saving goal successfully', async () => {
      jest.doMock('../models/Saving', () => ({
        create: jest.fn().mockResolvedValue({
          id: 'saving-1',
          user_id: 'user-1',
          description: 'Vacation',
          start_amount: 100,
          target_amount: 1000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          expired: false,
          completed: false,
        }),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.post('/savings', savingController.createSaving);
      });
      const data = {
        user_id: 'user-1',
        description: 'Vacation',
        start_amount: 100,
        target_amount: 1000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };
      const response = await request(app)
        .post('/savings')
        .send(data)
        .expect(201);
      expect(response.body.message).toBe('Saving goal created successfully');
      expect(response.body.data).toMatchObject({
        id: 'saving-1',
        user_id: 'user-1',
        description: 'Vacation',
      });
    });

    it('should create saving goal with default values', async () => {
      jest.doMock('../models/Saving', () => ({
        create: jest.fn().mockResolvedValue({
          id: 'saving-2',
          user_id: 'user-2',
          description: 'Emergency',
          start_amount: 0,
          target_amount: 500,
          start_date: new Date().toISOString().split('T')[0],
          end_date: '2024-12-31',
          expired: false,
          completed: false,
        }),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.post('/savings', savingController.createSaving);
      });
      const data = {
        user_id: 'user-2',
        description: 'Emergency',
        start_amount: 0,
        target_amount: 500,
        end_date: '2024-12-31',
      };
      const response = await request(app)
        .post('/savings')
        .send(data)
        .expect(201);
      expect(response.body.data.expired).toBe(false);
      expect(response.body.data.completed).toBe(false);
    });

    it('should create saving goal with explicit boolean values', async () => {
      jest.doMock('../models/Saving', () => ({
        create: jest.fn().mockResolvedValue({
          id: 'saving-3',
          user_id: 'user-3',
          description: 'Completed Goal',
          start_amount: 1000,
          target_amount: 1000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          expired: true,
          completed: true,
        }),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.post('/savings', savingController.createSaving);
      });
      const data = {
        user_id: 'user-3',
        description: 'Completed Goal',
        start_amount: 1000,
        target_amount: 1000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        expired: true,
        completed: true,
      };
      const response = await request(app)
        .post('/savings')
        .send(data)
        .expect(201);
      expect(response.body.data.expired).toBe(true);
      expect(response.body.data.completed).toBe(true);
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/Saving', () => ({
        create: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.post('/savings', savingController.createSaving);
      });
      const data = {
        user_id: 'user-1',
        description: 'Vacation',
        start_amount: 100,
        target_amount: 1000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };
      const response = await request(app)
        .post('/savings')
        .send(data)
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });

    it('should handle validation errors from database', async () => {
      jest.doMock('../models/Saving', () => ({
        create: jest.fn().mockRejectedValue(new Error('Validation error: user_id cannot be null')),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.post('/savings', savingController.createSaving);
      });
      const data = {
        description: 'Vacation',
        start_amount: 100,
        target_amount: 1000,
      };
      const response = await request(app)
        .post('/savings')
        .send(data)
        .expect(500);
      expect(response.body.message).toBe('Validation error: user_id cannot be null');
    });
  });

  describe('GET /savings', () => {
    it('should get all savings for a user', async () => {
      jest.doMock('../models/Saving', () => ({
        findAll: jest.fn().mockResolvedValue([
          { id: 'saving-1', user_id: 'user-1', description: 'Vacation' },
          { id: 'saving-2', user_id: 'user-1', description: 'Emergency' },
        ]),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.get('/savings', savingController.getAllSavings);
      });
      const response = await request(app)
        .get('/savings?user_id=user-1')
        .expect(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].user_id).toBe('user-1');
    });

    it('should get all savings (no filter)', async () => {
      jest.doMock('../models/Saving', () => ({
        findAll: jest.fn().mockResolvedValue([
          { id: 'saving-1', user_id: 'user-1', description: 'Vacation' },
          { id: 'saving-2', user_id: 'user-2', description: 'Emergency' },
        ]),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.get('/savings', savingController.getAllSavings);
      });
      const response = await request(app)
        .get('/savings')
        .expect(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when no savings exist', async () => {
      jest.doMock('../models/Saving', () => ({
        findAll: jest.fn().mockResolvedValue([]),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.get('/savings', savingController.getAllSavings);
      });
      const response = await request(app)
        .get('/savings')
        .expect(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return empty array when user has no savings', async () => {
      jest.doMock('../models/Saving', () => ({
        findAll: jest.fn().mockResolvedValue([]),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.get('/savings', savingController.getAllSavings);
      });
      const response = await request(app)
        .get('/savings?user_id=user-with-no-savings')
        .expect(200);
      expect(response.body).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/Saving', () => ({
        findAll: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.get('/savings', savingController.getAllSavings);
      });
      const response = await request(app)
        .get('/savings')
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });
  });

  describe('GET /savings/:id', () => {
    it('should get saving by id', async () => {
      jest.doMock('../models/Saving', () => ({
        findByPk: jest.fn().mockResolvedValue({
          id: 'saving-1',
          user_id: 'user-1',
          description: 'Vacation',
        }),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.get('/savings/:id', savingController.getSavingById);
      });
      const response = await request(app)
        .get('/savings/saving-1')
        .expect(200);
      expect(response.body.id).toBe('saving-1');
    });

    it('should handle not found', async () => {
      jest.doMock('../models/Saving', () => ({
        findByPk: jest.fn().mockResolvedValue(null),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.get('/savings/:id', savingController.getSavingById);
      });
      const response = await request(app)
        .get('/savings/does-not-exist')
        .expect(404);
      expect(response.body.message).toBe('Saving goal not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/Saving', () => ({
        findByPk: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.get('/savings/:id', savingController.getSavingById);
      });
      const response = await request(app)
        .get('/savings/saving-1')
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });
  });

  describe('PUT /savings/:id', () => {
    it('should update saving goal', async () => {
      const mockSaving = {
        id: 'saving-1',
        user_id: 'user-1',
        description: 'Vacation',
        start_amount: 100,
        target_amount: 1000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        expired: false,
        completed: false,
        update: jest.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };
      jest.doMock('../models/Saving', () => ({
        findByPk: jest.fn().mockResolvedValue(mockSaving),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.put('/savings/:id', savingController.updateSaving);
      });
      const updateData = { description: 'Updated Vacation', completed: true };
      const response = await request(app)
        .put('/savings/saving-1')
        .send(updateData)
        .expect(200);
      expect(response.body.message).toBe('Saving goal updated successfully');
      expect(response.body.data.description).toBe('Updated Vacation');
      expect(response.body.data.completed).toBe(true);
      expect(mockSaving.update).toHaveBeenCalledWith(updateData);
    });

    it('should update saving goal with partial data', async () => {
      const mockSaving = {
        id: 'saving-1',
        user_id: 'user-1',
        description: 'Vacation',
        start_amount: 100,
        target_amount: 1000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        expired: false,
        completed: false,
        update: jest.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };
      jest.doMock('../models/Saving', () => ({
        findByPk: jest.fn().mockResolvedValue(mockSaving),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.put('/savings/:id', savingController.updateSaving);
      });
      const updateData = { target_amount: 1500 };
      const response = await request(app)
        .put('/savings/saving-1')
        .send(updateData)
        .expect(200);
      expect(response.body.data.target_amount).toBe(1500);
      expect(mockSaving.update).toHaveBeenCalledWith(updateData);
    });

    it('should handle not found', async () => {
      jest.doMock('../models/Saving', () => ({
        findByPk: jest.fn().mockResolvedValue(null),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.put('/savings/:id', savingController.updateSaving);
      });
      const updateData = { description: 'Updated Vacation' };
      const response = await request(app)
        .put('/savings/does-not-exist')
        .send(updateData)
        .expect(404);
      expect(response.body.message).toBe('Saving goal not found');
    });

    it('should handle database errors', async () => {
      const mockSaving = {
        id: 'saving-1',
        update: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      jest.doMock('../models/Saving', () => ({
        findByPk: jest.fn().mockResolvedValue(mockSaving),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.put('/savings/:id', savingController.updateSaving);
      });
      const updateData = { description: 'Updated Vacation' };
      const response = await request(app)
        .put('/savings/saving-1')
        .send(updateData)
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });

    it('should handle validation errors during update', async () => {
      const mockSaving = {
        id: 'saving-1',
        update: jest.fn().mockRejectedValue(new Error('Validation error: start_amount cannot be negative')),
      };
      jest.doMock('../models/Saving', () => ({
        findByPk: jest.fn().mockResolvedValue(mockSaving),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.put('/savings/:id', savingController.updateSaving);
      });
      const updateData = { start_amount: -100 };
      const response = await request(app)
        .put('/savings/saving-1')
        .send(updateData)
        .expect(500);
      expect(response.body.message).toBe('Validation error: start_amount cannot be negative');
    });
  });

  describe('DELETE /savings/:id', () => {
    it('should delete saving goal', async () => {
      jest.doMock('../models/Saving', () => ({
        destroy: jest.fn().mockResolvedValue(1),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.delete('/savings/:id', savingController.deleteSaving);
      });
      const response = await request(app)
        .delete('/savings/saving-1')
        .expect(200);
      expect(response.body.message).toBe('Saving goal deleted successfully');
    });

    it('should handle not found', async () => {
      jest.doMock('../models/Saving', () => ({
        destroy: jest.fn().mockResolvedValue(0),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.delete('/savings/:id', savingController.deleteSaving);
      });
      const response = await request(app)
        .delete('/savings/does-not-exist')
        .expect(404);
      expect(response.body.message).toBe('Saving goal not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('../models/Saving', () => ({
        destroy: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      let app, savingController;
      jest.isolateModules(() => {
        savingController = require('../controllers/savingController');
        app = express();
        app.use(express.json());
        app.delete('/savings/:id', savingController.deleteSaving);
      });
      const response = await request(app)
        .delete('/savings/saving-1')
        .expect(500);
      expect(response.body.message).toBe('DB error');
    });
  });
}); 