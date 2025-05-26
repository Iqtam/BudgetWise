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
