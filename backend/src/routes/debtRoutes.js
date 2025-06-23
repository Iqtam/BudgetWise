const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');

router.post('/', debtController.createDebt);
router.get('/', debtController.getAllDebts);
router.delete('/:id', debtController.deleteDebt);

module.exports = router;
