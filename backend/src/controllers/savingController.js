const Saving = require('../models/Saving');

exports.createSaving = async (req, res) => {
  try {
    const {
      user_id,
      description,
      start_amount,
      target_amount,
      start_date,
      end_date,
      expired,
      completed
    } = req.body;

    const saving = await Saving.create({
      user_id,
      description,
      start_amount,
      target_amount,
      start_date: start_date || new Date(),
      end_date,
      expired: expired !== undefined ? expired : false,
      completed: completed !== undefined ? completed : false
    });

    res.status(201).json({
      message: 'Saving goal created successfully',
      data: saving
    });
  } catch (error) {
    console.error('Create Saving Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSavings = async (req, res) => {
  try {
    const { user_id } = req.query;

    let savings;
    if (user_id) {
      savings = await Saving.findAll({ where: { user_id } });
    } else {
      savings = await Saving.findAll();
    }

    res.json(savings);
  } catch (error) {
    console.error('Fetch Saving Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSavingById = async (req, res) => {
  try {
    const saving = await Saving.findByPk(req.params.id);
    if (!saving) return res.status(404).json({ message: 'Saving goal not found' });
    res.json(saving);
  } catch (error) {
    console.error('Fetch Saving By ID Error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.deleteSaving = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCount = await Saving.destroy({ where: { id } });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    res.json({ message: 'Saving goal deleted successfully' });
  } catch (error) {
    console.error('Delete Saving Error:', error);
    res.status(500).json({ message: error.message });
  }
};
exports.updateSaving = async (req, res) => {
  const { id } = req.params;

  try {
    const saving = await Saving.findByPk(id);
    if (!saving) return res.status(404).json({ message: 'Saving goal not found' });

    const updatedData = req.body;
    await saving.update(updatedData);

    res.json({
      message: 'Saving goal updated successfully',
      data: saving
    });
  } catch (error) {
    console.error('Update Saving Error:', error);
    res.status(500).json({ message: error.message });
  }
};