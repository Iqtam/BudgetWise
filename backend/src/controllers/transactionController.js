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

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (error) {
    console.error('Fetch Transaction Error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCount = await Transaction.destroy({ where: { id } });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    res.status(500).json({ message: error.message });
  }
};

