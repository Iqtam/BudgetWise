const { Budget } = require('../models/Budget');

exports.createBudget = async (req, res) => {
  try {
    const {
      user_id,
      category_id,
      start_date,
      end_date,
      goal_amount,
      icon_url,
      expired,
      amount_exceeded
    } = req.body;

    const budget = await Budget.create({
      user_id,
      category_id,
      start_date: start_date || new Date(), // optional default
      end_date,
      goal_amount,
      icon_url,
      expired: expired !== undefined ? expired : false,
      amount_exceeded: amount_exceeded !== undefined ? amount_exceeded : false
    });

    res.status(201).json({
      message: 'Budget created successfully',
      data: budget
    });
  } catch (error) {
    console.error('Create Budget Error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getAllBudgets = async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = user_id ? { user_id } : {};
    const budgets = await Budget.findAll({ where });
    res.json(budgets);
  } catch (error) {
    console.error('Fetch Budget Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json(budget);
  } catch (error) {
    console.error('Fetch Budget By ID Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    await budget.update(req.body);
    res.json({
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    console.error('Update Budget Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const deletedCount = await Budget.destroy({ where: { id: req.params.id } });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete Budget Error:', error);
    res.status(500).json({ message: error.message });
  }
};