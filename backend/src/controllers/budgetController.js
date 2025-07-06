const Budget = require('../models/Budget');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

exports.createBudget = async (req, res) => {
  try {
    const {
      category_id,
      start_date,
      end_date,
      goal_amount,
      icon_url,
      expired,
      amount_exceeded
    } = req.body;

    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const budget = await Budget.create({
      user_id: user.id,
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
    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const budgets = await Budget.findAll({ 
      where: { user_id: user.id } 
    });
    res.json(budgets);
  } catch (error) {
    console.error('Fetch Budget Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const budget = await Budget.findOne({
      where: { 
        id: req.params.id,
        user_id: user.id 
      }
    });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json(budget);
  } catch (error) {
    console.error('Fetch Budget By ID Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const budget = await Budget.findOne({
      where: { 
        id: req.params.id,
        user_id: user.id 
      }
    });
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
    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deletedCount = await Budget.destroy({ 
      where: { 
        id: req.params.id,
        user_id: user.id 
      } 
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete Budget Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to sync budget spending with actual transactions
exports.syncBudgetSpending = async (userId, categoryId = null) => {
  try {
    // If categoryId is provided, sync only that budget, otherwise sync all user budgets
    const budgetQuery = { user_id: userId };
    if (categoryId) {
      budgetQuery.category_id = categoryId;
    }

    const budgets = await Budget.findAll({ where: budgetQuery });

    for (const budget of budgets) {
      if (!budget.category_id) continue; // Skip budgets without categories

      // Calculate total spent for this budget's category within the budget period
      const totalSpent = await Transaction.sum('amount', {
        where: {
          user_id: userId,
          category_id: budget.category_id,
          type: 'expense',
          date: {
            [Op.between]: [budget.start_date, budget.end_date]
          }
        }
      });

      // Update the budget's spent amount
      const spentAmount = totalSpent ? Math.abs(totalSpent) : 0;
      await budget.update({ 
        spent: spentAmount,
        amount_exceeded: spentAmount > budget.goal_amount
      });
    }
  } catch (error) {
    console.error('Error syncing budget spending:', error);
    throw error;
  }
};

// API endpoint to manually sync budget spending
exports.syncBudgetSpendingAPI = async (req, res) => {
  try {
    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await exports.syncBudgetSpending(user.id);

    res.json({ message: 'Budget spending synced successfully' });
  } catch (error) {
    console.error('Sync Budget Spending API Error:', error);
    res.status(500).json({ message: error.message });
  }
};