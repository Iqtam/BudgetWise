const Category = require('../models/Category');
const User = require('../models/User');

// GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const categories = await Category.findAll({
      where: { user_id: user.id },
      order: [['name', 'ASC']],
      include: [{ model: Category, as: 'parent', attributes: ['id', 'name'] }]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon_url, parent_id } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for duplicates within user's categories
    const existing = await Category.findOne({ 
      where: { 
        name, 
        type, 
        user_id: user.id 
      } 
    });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists with this name and type' });
    }

    const category = await Category.create({
      user_id: user.id,
      name,
      type,
      icon_url,
      parent_id: parent_id || null
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
