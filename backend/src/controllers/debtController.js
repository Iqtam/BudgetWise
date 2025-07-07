const Debt = require('../models/Debt');
const User = require('../models/User');
const Balance = require('../models/Balance');

exports.createDebt = async (req, res) => {
  try {
    const {
      user_id,
      description,
      type,
      start_date,
      expiration_date,
      interest_rate,
      amount,
      taken_from
    } = req.body;

    // Calculate total amount including interest
    const totalAmountWithInterest = amount * (1 + interest_rate / 100);

    const debt = await Debt.create({
      user_id,
      description,
      type,
      start_date: start_date || new Date(),
      expiration_date,
      interest_rate,
      amount: totalAmountWithInterest, // Store total amount including interest
      original_amount: totalAmountWithInterest, // Store the original total for reference
      taken_from
    });

    res.status(201).json({
      message: 'Debt created successfully',
      data: debt
    });
  } catch (error) {
    console.error('Create Debt Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDebts = async (req, res) => {
  try {
    const { user_id } = req.query;

    let debts;
    if (user_id) {
      debts = await Debt.findAll({ where: { user_id } });
    } else {
      debts = await Debt.findAll(); // Admin access
    }

    res.json(debts);
  } catch (error) {
    console.error('Fetch Debts Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDebtById = async (req, res) => {
  try {
    const debt = await Debt.findByPk(req.params.id);
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    res.json(debt);
  } catch (error) {
    console.error('Fetch Debt By ID Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateDebt = async (req, res) => {
  const { id } = req.params;

  try {
    const debt = await Debt.findByPk(id);
    if (!debt) return res.status(404).json({ message: 'Debt not found' });

    const updatedData = req.body;
    await debt.update(updatedData);

    res.json({
      message: 'Debt updated successfully',
      data: debt
    });
  } catch (error) {
    console.error('Update Debt Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDebt = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCount = await Debt.destroy({ where: { id } });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Debt not found' });
    }

    res.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    console.error('Delete Debt Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/debts/:id/payment
exports.makeDebtPayment = async (req, res) => {
  const { id } = req.params;
  const { payment_amount } = req.body;

  try {
    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate payment amount
    if (!payment_amount || payment_amount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than 0' });
    }

    // Find the debt
    const debt = await Debt.findOne({
      where: { 
        id: id,
        user_id: user.id 
      }
    });
    
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }

    // Check if payment amount doesn't exceed total debt amount
    if (payment_amount > debt.amount) {
      return res.status(400).json({ message: 'Payment amount cannot exceed total debt amount' });
    }

    // Get user's balance
    let balance = await Balance.findOne({ where: { user_id: user.id } });
    
    if (!balance) {
      return res.status(400).json({ message: 'User balance not found' });
    }

    const currentBalance = parseFloat(balance.balance);
    
    // Check if user has sufficient balance
    if (currentBalance < payment_amount) {
      return res.status(400).json({ 
        message: `Insufficient balance. Current balance: $${currentBalance.toFixed(2)}, Payment amount: $${payment_amount.toFixed(2)}` 
      });
    }

    // Perform the transaction (both debt reduction and balance update)
    const newDebtAmount = Math.max(0, debt.amount - payment_amount);
    const newBalance = currentBalance - payment_amount;
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Determine if debt is fully paid
    const isFullyPaid = newDebtAmount === 0;

    // Prepare debt update object
    const debtUpdateData = {
      amount: newDebtAmount,
      last_payment_date: currentDate
    };

    // If fully paid, also update the fully paid status and date
    if (isFullyPaid) {
      debtUpdateData.is_fully_paid = true;
      debtUpdateData.fully_paid_date = currentDate;
    }

    // Update both debt and balance
    await Promise.all([
      debt.update(debtUpdateData),
      balance.update({ balance: newBalance })
    ]);

    res.json({
      message: 'Payment recorded successfully',
      data: {
        debt: debt,
        balance: balance,
        payment_amount: payment_amount,
        remaining_debt: newDebtAmount,
        is_fully_paid: isFullyPaid,
        last_payment_date: currentDate,
        fully_paid_date: isFullyPaid ? currentDate : debt.fully_paid_date
      }
    });
  } catch (error) {
    console.error('Make Debt Payment Error:', error);
    res.status(500).json({ message: error.message });
  }
};
