const Category = require('../models/Category');

// GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
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

    // Optional: check for duplicates
    const existing = await Category.findOne({ where: { name, type } });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists with this name and type' });
    }

    const category = await Category.create({
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
