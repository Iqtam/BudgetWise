const { Op } = require('sequelize');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { syncBudgetSpending } = require('./budgetController');


exports.createTransaction = async (req, res) => {
  try {
    const {
      user_id,
      amount,
      date,
      description,
      category_id,
      type,
      event_id,
      recurrence,
      confirmed
    } = req.body;


    const transaction = await Transaction.create({
      user_id,
      amount,
      date: date || new Date(), // optional default
      description,
      category_id,
      type,
      event_id,
      recurrence: recurrence || false,
      confirmed: confirmed !== undefined ? confirmed : true
    });

    // Sync budget spending if this is an expense transaction with a category
    if (type === 'expense' && category_id) {
      try {
        await syncBudgetSpending(user_id, category_id);
      } catch (budgetError) {
        console.error('Error syncing budget spending:', budgetError);
        // Don't fail the transaction creation if budget sync fails
      }
    }

    res.status(201).json({
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// exports.getAllTransactions = async (req, res) => {
//   try {
//     const { user_id } = req.query;
    
//     let transactions;
//     if (user_id) {
//       // Filter transactions by user_id if provided
//       transactions = await Transaction.findAll({
//         where: { user_id }
//       });
//     } else {
//       // Return all transactions if no user_id specified (for admin use)
//       transactions = await Transaction.findAll();
//     }
    
//     res.json(transactions);
//   } catch (error) {
//     console.error('Fetch Transaction Error:', error);
//     res.status(500).json({ message: error.message });
//   }
// };

exports.getAllTransactions = async (req, res) => {
  try {
    const {
      user_id,
      type,              // 'expense' or 'income'
      category_id,       // UUID
      search,            // keyword in description
      sort_by = 'date',  // default to sorting by date
      order = 'DESC'     // DESC or ASC
    } = req.query;

    const where = {};

    if (user_id) where.user_id = user_id;
    if (type) where.type = type;
    if (category_id) where.category_id = category_id;
    if (search) {
      where.description = {
        [Op.iLike]: `%${search}%` // case-insensitive partial match (Postgres)
      };
    }

    const transactions = await Transaction.findAll({
      where,
      order: [[sort_by, order]]
    });

    res.json(transactions);
  } catch (error) {
    console.error('Fetch Transaction Error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Fetch Single Transaction Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the transaction by ID
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Store transaction details for budget sync before deletion
    const transactionUserId = transaction.user_id;
    const transactionCategoryId = transaction.category_id;
    const transactionType = transaction.type;

    // Delete the transaction
    await transaction.destroy();

    // Sync budget spending if this was an expense transaction with a category
    if (transactionType === 'expense' && transactionCategoryId) {
      try {
        await syncBudgetSpending(transactionUserId, transactionCategoryId);
      } catch (budgetError) {
        console.error('Error syncing budget spending:', budgetError);
        // Don't fail the transaction deletion if budget sync fails
      }
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const {
    amount,
    date,
    description,
    category_id,
    type,
    event_id,
    recurrence,
    confirmed
  } = req.body;

  try {
    // Find the transaction by ID
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Store old values for budget sync
    const oldCategoryId = transaction.category_id;
    const oldType = transaction.type;
    const userId = transaction.user_id;

    // Update the transaction
    await transaction.update({
      amount: amount !== undefined ? amount : transaction.amount,
      date: date !== undefined ? date : transaction.date,
      description: description !== undefined ? description : transaction.description,
      category_id: category_id !== undefined ? category_id : transaction.category_id,
      type: type !== undefined ? type : transaction.type,
      event_id: event_id !== undefined ? event_id : transaction.event_id,
      recurrence: recurrence !== undefined ? recurrence : transaction.recurrence,
      confirmed: confirmed !== undefined ? confirmed : transaction.confirmed
    });

    // Sync budget spending if expense transaction with category changed
    const newCategoryId = transaction.category_id;
    const newType = transaction.type;

    if (newType === 'expense' || oldType === 'expense') {
      try {
        // Sync both old and new categories if they exist and are different
        if (oldCategoryId && (oldType === 'expense')) {
          await syncBudgetSpending(userId, oldCategoryId);
        }
        if (newCategoryId && (newType === 'expense') && newCategoryId !== oldCategoryId) {
          await syncBudgetSpending(userId, newCategoryId);
        }
      } catch (budgetError) {
        console.error('Error syncing budget spending:', budgetError);
        // Don't fail the transaction update if budget sync fails
      }
    }

    res.json({
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    res.status(500).json({ message: error.message });
  }
};

