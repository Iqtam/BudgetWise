const { Op } = require('sequelize');
const Transaction = require('../models/Transaction');


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

    // Delete the transaction
    await transaction.destroy();

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

    res.json({
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    res.status(500).json({ message: error.message });
  }
};

