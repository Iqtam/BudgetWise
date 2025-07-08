const categoryController = require('../controllers/categoryController');
const User = require('../models/User');
const Category = require('../models/Category');

jest.mock('../models/User');
jest.mock('../models/Category');

describe('categoryController', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { uid: 'firebase-uid-1' }, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return 404 if user not found', async () => {
      User.findOne.mockResolvedValue(null);
      await categoryController.getCategories(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return categories for user', async () => {
      const user = { id: 'user-1' };
      const categories = [{ id: 'cat-1', name: 'Food' }, { id: 'cat-2', name: 'Transport' }];
      User.findOne.mockResolvedValue(user);
      Category.findAll.mockResolvedValue(categories);
      await categoryController.getCategories(req, res);
      expect(Category.findAll).toHaveBeenCalledWith({
        where: { user_id: user.id },
        order: [['name', 'ASC']],
        include: [{ model: Category, as: 'parent', attributes: ['id', 'name'] }]
      });
      expect(res.json).toHaveBeenCalledWith(categories);
    });

    it('should filter categories by type if provided', async () => {
      const user = { id: 'user-1' };
      req.query.type = 'expense';
      const categories = [{ id: 'cat-1', name: 'Food', type: 'expense' }];
      User.findOne.mockResolvedValue(user);
      Category.findAll.mockResolvedValue(categories);
      await categoryController.getCategories(req, res);
      expect(Category.findAll).toHaveBeenCalledWith({
        where: { user_id: user.id, type: 'expense' },
        order: [['name', 'ASC']],
        include: [{ model: Category, as: 'parent', attributes: ['id', 'name'] }]
      });
      expect(res.json).toHaveBeenCalledWith(categories);
    });

    it('should handle DB error', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));
      await categoryController.getCategories(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });

  describe('createCategory', () => {
    it('should return 400 if name or type is missing', async () => {
      req.body = { name: '', type: '' };
      await categoryController.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name and type are required' });
    });

    it('should return 404 if user not found', async () => {
      req.body = { name: 'Food', type: 'expense' };
      User.findOne.mockResolvedValue(null);
      await categoryController.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if duplicate category exists', async () => {
      req.body = { name: 'Food', type: 'expense' };
      const user = { id: 'user-1' };
      User.findOne.mockResolvedValue(user);
      Category.findOne.mockResolvedValue({ id: 'cat-1', name: 'Food', type: 'expense' });
      await categoryController.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category already exists with this name and type' });
    });

    it('should create and return new category', async () => {
      req.body = { name: 'Food', type: 'expense', icon_url: 'icon.png', parent_id: null };
      const user = { id: 'user-1' };
      User.findOne.mockResolvedValue(user);
      Category.findOne.mockResolvedValue(null);
      const createdCategory = { id: 'cat-1', user_id: user.id, name: 'Food', type: 'expense', icon_url: 'icon.png', parent_id: null };
      Category.create.mockResolvedValue(createdCategory);
      await categoryController.createCategory(req, res);
      expect(Category.create).toHaveBeenCalledWith({
        user_id: user.id,
        name: 'Food',
        type: 'expense',
        icon_url: 'icon.png',
        parent_id: null
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdCategory);
    });

    it('should handle DB error', async () => {
      req.body = { name: 'Food', type: 'expense' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await categoryController.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });
}); 