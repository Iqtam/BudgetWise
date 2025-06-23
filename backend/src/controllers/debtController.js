const Debt = require('../models/Debt');

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

    const debt = await Debt.create({
      user_id,
      description,
      type,
      start_date: start_date || new Date(),
      expiration_date,
      interest_rate,
      amount,
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
