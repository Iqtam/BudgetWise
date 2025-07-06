const Balance = require('../models/Balance');
const User = require('../models/User');

// GET /api/balance
exports.getBalance = async (req, res) => {
  try {
    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create balance record for user
    let balance = await Balance.findOne({ where: { user_id: user.id } });
    
    if (!balance) {
      // Create balance record if it doesn't exist
      balance = await Balance.create({
        user_id: user.id,
        balance: 0.00
      });
    }

    res.json(balance);
  } catch (error) {
    console.error('Get Balance Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/balance
exports.updateBalance = async (req, res) => {
  try {
    const { balance: newBalance } = req.body;

    if (newBalance === undefined || newBalance === null) {
      return res.status(400).json({ message: 'Balance amount is required' });
    }

    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create balance record for user
    let balance = await Balance.findOne({ where: { user_id: user.id } });
    
    if (!balance) {
      // Create balance record if it doesn't exist
      balance = await Balance.create({
        user_id: user.id,
        balance: newBalance
      });
    } else {
      // Update existing balance
      await balance.update({ balance: newBalance });
    }

    res.json({
      message: 'Balance updated successfully',
      data: balance
    });
  } catch (error) {
    console.error('Update Balance Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/balance/adjust
exports.adjustBalance = async (req, res) => {
  try {
    const { amount, type } = req.body; // type: 'add' or 'subtract'

    if (!amount || !type) {
      return res.status(400).json({ message: 'Amount and type are required' });
    }

    if (!['add', 'subtract'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "add" or "subtract"' });
    }

    // Get user ID from Firebase token
    const firebaseUid = req.user.uid;
    
    // Find user by Firebase UID
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create balance record for user
    let balance = await Balance.findOne({ where: { user_id: user.id } });
    
    if (!balance) {
      // Create balance record if it doesn't exist
      balance = await Balance.create({
        user_id: user.id,
        balance: type === 'add' ? amount : -amount
      });
    } else {
      // Adjust existing balance
      const currentBalance = parseFloat(balance.balance);
      const adjustment = parseFloat(amount);
      const newBalance = type === 'add' ? currentBalance + adjustment : currentBalance - adjustment;
      
      await balance.update({ balance: newBalance });
    }

    res.json({
      message: `Balance ${type === 'add' ? 'increased' : 'decreased'} successfully`,
      data: balance
    });
  } catch (error) {
    console.error('Adjust Balance Error:', error);
    res.status(500).json({ message: error.message });
  }
}; 