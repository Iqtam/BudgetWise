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

describe('OCR Controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('POST /ocr/receipt', () => {
    it('should process receipt image successfully', async () => {
      // Set up all default mocks before isolateModules
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('fs', () => ({
        existsSync: () => true,
        mkdirSync: () => {},
        readFileSync: () => Buffer.from('fake-image-data'),
        unlinkSync: () => {},
      }));
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn(() => JSON.stringify({
                  type: 'expense',
                  amount: 25.0,
                  vendor: 'Starbucks',
                  description: 'Coffee purchase',
                  category: 'Food',
                })),
              },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Upload', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-upload-id', update: jest.fn().mockResolvedValue(undefined) }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/receipt', mockFirebaseAuth, ocrController.processReceipt);
      });

      const response = await request(app)
        .post('/ocr/receipt')
        .attach('receipt', Buffer.from('fake-image-data'), 'test-receipt.jpg')
        .expect(200);
      expect(response.body.message).toBe('Receipt processed successfully');
      expect(response.body.data).toMatchObject({
        type: 'expense',
        amount: 25.0,
        vendor: 'Starbucks',
        description: 'Coffee purchase',
        category: 'Food',
      });
    });

    it('should handle missing file', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = undefined;
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('fs', () => ({
        existsSync: () => true,
        mkdirSync: () => {},
        readFileSync: () => Buffer.from('fake-image-data'),
        unlinkSync: () => {},
      }));
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn(() => JSON.stringify({
                  type: 'expense',
                  amount: 25.0,
                  vendor: 'Starbucks',
                  description: 'Coffee purchase',
                  category: 'Food',
                })),
              },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Upload', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-upload-id', update: jest.fn().mockResolvedValue(undefined) }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/receipt', mockFirebaseAuth, ocrController.processReceipt);
      });

      const response = await request(app)
        .post('/ocr/receipt')
        .expect(400);
      expect(response.body.message).toBe('No file uploaded');
    });

    it('should handle invalid file type', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            // Simulate file filter rejection
            next(new Error('Invalid file type. Only images are allowed.'));
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        mockMulter.MulterError = class extends Error {};
        return mockMulter;
      });
      jest.doMock('fs', () => ({
        existsSync: () => true,
        mkdirSync: () => {},
        readFileSync: () => Buffer.from('fake-image-data'),
        unlinkSync: () => {},
      }));
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn(() => JSON.stringify({
                  type: 'expense',
                  amount: 25.0,
                  vendor: 'Starbucks',
                  description: 'Coffee purchase',
                  category: 'Food',
                })),
              },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Upload', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-upload-id', update: jest.fn().mockResolvedValue(undefined) }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/receipt', mockFirebaseAuth, ocrController.processReceipt);
      });

      const response = await request(app)
        .post('/ocr/receipt')
        .attach('receipt', Buffer.from('not-an-image'), 'test.txt')
        .expect(400);
      expect(response.body.message).toBe('Invalid file type. Only images are allowed.');
    });

    it('should handle user not found', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('fs', () => ({
        existsSync: () => true,
        mkdirSync: () => {},
        readFileSync: () => Buffer.from('fake-image-data'),
        unlinkSync: () => {},
      }));
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn(() => JSON.stringify({
                  type: 'expense',
                  amount: 25.0,
                  vendor: 'Starbucks',
                  description: 'Coffee purchase',
                  category: 'Food',
                })),
              },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/Upload', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-upload-id', update: jest.fn().mockResolvedValue(undefined) }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/receipt', mockFirebaseAuth, ocrController.processReceipt);
      });

      const response = await request(app)
        .post('/ocr/receipt')
        .attach('receipt', Buffer.from('fake-image-data'), 'test-receipt.jpg')
        .expect(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should handle upload creation errors', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('fs', () => ({
        existsSync: () => true,
        mkdirSync: () => {},
        readFileSync: () => Buffer.from('fake-image-data'),
        unlinkSync: () => {},
      }));
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn(() => JSON.stringify({
                  type: 'expense',
                  amount: 25.0,
                  vendor: 'Starbucks',
                  description: 'Coffee purchase',
                  category: 'Food',
                })),
              },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Upload', () => ({
        create: jest.fn().mockRejectedValue(new Error('Database error')),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/receipt', mockFirebaseAuth, ocrController.processReceipt);
      });

      const response = await request(app)
        .post('/ocr/receipt')
        .attach('receipt', Buffer.from('fake-image-data'), 'test-receipt.jpg')
        .expect(500);
      expect(response.body.message).toBe('Failed to process receipt');
    });

    it('should handle Gemini API errors', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('fs', () => ({
        existsSync: () => true,
        mkdirSync: () => {},
        readFileSync: () => Buffer.from('fake-image-data'),
        unlinkSync: () => {},
      }));
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockRejectedValue(new Error('API Error')),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Upload', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-upload-id', update: jest.fn().mockResolvedValue(undefined) }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/receipt', mockFirebaseAuth, ocrController.processReceipt);
      });

      const response = await request(app)
        .post('/ocr/receipt')
        .attach('receipt', Buffer.from('fake-image-data'), 'test-receipt.jpg')
        .expect(500);
      expect(response.body.message).toBe('Failed to process receipt');
    });

    it('should handle invalid JSON response from Gemini', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('fs', () => ({
        existsSync: () => true,
        mkdirSync: () => {},
        readFileSync: () => Buffer.from('fake-image-data'),
        unlinkSync: () => {},
      }));
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: { text: jest.fn(() => 'Invalid JSON response') },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Upload', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-upload-id', update: jest.fn().mockResolvedValue(undefined) }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/receipt', mockFirebaseAuth, ocrController.processReceipt);
      });

      const response = await request(app)
        .post('/ocr/receipt')
        .attach('receipt', Buffer.from('fake-image-data'), 'test-receipt.jpg')
        .expect(500);
      expect(response.body.message).toBe('Failed to process receipt');
    });

    it('should handle file read errors', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('fs', () => ({
        existsSync: () => true,
        mkdirSync: () => {},
        readFileSync: () => { throw new Error('File read error'); },
        unlinkSync: () => {},
      }));
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn(() => JSON.stringify({
                  type: 'expense',
                  amount: 25.0,
                  vendor: 'Starbucks',
                  description: 'Coffee purchase',
                  category: 'Food',
                })),
              },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/Upload', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-upload-id', update: jest.fn().mockResolvedValue(undefined) }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/receipt', mockFirebaseAuth, ocrController.processReceipt);
      });

      const response = await request(app)
        .post('/ocr/receipt')
        .attach('receipt', Buffer.from('fake-image-data'), 'test-receipt.jpg')
        .expect(500);
      expect(response.body.message).toBe('Failed to process receipt');
    });
  });

  describe('POST /ocr/chat', () => {
    it('should process chat message successfully', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn(() => JSON.stringify({
                  type: 'expense',
                  amount: 25.0,
                  vendor: 'Starbucks',
                  description: 'Coffee purchase',
                  category: 'Food',
                })),
              },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/chat', mockFirebaseAuth, ocrController.processChatTransaction);
      });

      const response = await request(app)
        .post('/ocr/chat')
        .send({ message: 'I spent $25 at Starbucks yesterday for coffee' })
        .expect(200);
      expect(response.body.message).toBe('Transaction processed successfully');
      expect(response.body.data).toMatchObject({
        type: 'expense',
        amount: 25.0,
        vendor: 'Starbucks',
        description: 'Coffee purchase',
        category: 'Food',
      });
    });

    it('should handle income transactions', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn(() => JSON.stringify({
                  type: 'income',
                  amount: 1000.0,
                  vendor: 'Company',
                  description: 'Salary payment',
                  category: 'Income',
                })),
              },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/chat', mockFirebaseAuth, ocrController.processChatTransaction);
      });

      const response = await request(app)
        .post('/ocr/chat')
        .send({ message: 'I received $1000 salary from company today' })
        .expect(200);
      expect(response.body.data).toMatchObject({
        type: 'income',
        amount: 1000.0,
        vendor: 'Company',
        description: 'Salary payment',
        category: 'Income',
      });
    });

    it('should handle missing message', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/chat', mockFirebaseAuth, ocrController.processChatTransaction);
      });

      const response = await request(app)
        .post('/ocr/chat')
        .send({})
        .expect(400);
      expect(response.body.message).toBe('Message is required and must be a non-empty string');
    });

    it('should handle empty message', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/chat', mockFirebaseAuth, ocrController.processChatTransaction);
      });

      const response = await request(app)
        .post('/ocr/chat')
        .send({ message: '' })
        .expect(400);
      expect(response.body.message).toBe('Message is required and must be a non-empty string');
    });

    it('should handle user not found', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn(() => JSON.stringify({
                  type: 'expense',
                  amount: 25.0,
                  vendor: 'Starbucks',
                  description: 'Coffee purchase',
                  category: 'Food',
                })),
              },
            }),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/chat', mockFirebaseAuth, ocrController.processChatTransaction);
      });

      const response = await request(app)
        .post('/ocr/chat')
        .send({ message: 'I spent $25 at Starbucks' })
        .expect(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should handle Gemini API errors', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn(() => ({
          getGenerativeModel: () => ({
            generateContent: jest.fn().mockRejectedValue(new Error('API Error')),
          }),
        })),
      }));
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        create: jest.fn().mockResolvedValue({ id: 'test-extraction-id' }),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.post('/ocr/chat', mockFirebaseAuth, ocrController.processChatTransaction);
      });

      const response = await request(app)
        .post('/ocr/chat')
        .send({ message: 'I spent $25 at Starbucks' })
        .expect(500);
      expect(response.body.message).toBe('Failed to process transaction');
    });
  });

  describe('GET /ocr/history', () => {
    it('should retrieve OCR history successfully', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        findAll: jest.fn().mockResolvedValue([
          {
            id: 'extraction-1',
            interpreted_type: 'expense',
            category_suggestion: 'Food',
            amount: 25.0,
            extraction_method: 'ocr',
            Upload: {
              file_name: 'receipt1.jpg',
              file_type: 'image/jpeg',
              uploaded_at: '2025-07-08T14:16:46.525Z',
            },
          },
        ]),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/ocr/history', mockFirebaseAuth, ocrController.getOCRHistory);
      });

      const response = await request(app)
        .get('/ocr/history')
        .expect(200);
      expect(response.body.message).toBe('OCR history retrieved successfully');
      expect(response.body.data).toEqual([
        {
          id: 'extraction-1',
          interpreted_type: 'expense',
          category_suggestion: 'Food',
          amount: 25.0,
          extraction_method: 'ocr',
          Upload: {
            file_name: 'receipt1.jpg',
            file_type: 'image/jpeg',
            uploaded_at: '2025-07-08T14:16:46.525Z',
          },
        },
      ]);
    });

    it('should handle user not found', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/ocr/history', mockFirebaseAuth, ocrController.getOCRHistory);
      });

      const response = await request(app)
        .get('/ocr/history')
        .expect(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should handle database errors', async () => {
      jest.doMock('multer', () => {
        const mockMulter = () => ({
          single: () => (req, res, next) => {
            req.file = {
              originalname: 'test-receipt.jpg',
              mimetype: 'image/jpeg',
              path: '/tmp/test-receipt.jpg',
              size: 1024,
            };
            next();
          },
        });
        mockMulter.diskStorage = jest.fn(() => ({
          destination: jest.fn(),
          filename: jest.fn(),
        }));
        return mockMulter;
      });
      jest.doMock('../models/User', () => ({
        findOne: jest.fn().mockResolvedValue({ id: 'test-user-id', firebase_uid: 'test-firebase-uid' }),
      }));
      jest.doMock('../models/AIExtraction', () => ({
        findAll: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      let app, ocrController;
      jest.isolateModules(() => {
        ocrController = require('../controllers/ocrController');
        app = express();
        app.use(express.json());
        const mockFirebaseAuth = (req, res, next) => { req.user = { uid: 'test-firebase-uid' }; next(); };
        app.get('/ocr/history', mockFirebaseAuth, ocrController.getOCRHistory);
      });

      const response = await request(app)
        .get('/ocr/history')
        .expect(500);
      expect(response.body.message).toBe('Failed to retrieve OCR history');
    });
  });
}); 