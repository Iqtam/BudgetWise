const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');
const verifyFirebaseToken = require('../middlewares/firebaseAuth');

// Apply authentication middleware to all debt routes
router.use(verifyFirebaseToken);

router.post('/', debtController.createDebt);
router.get('/', debtController.getAllDebts);
router.get('/:id', debtController.getDebtById);
router.put('/:id', debtController.updateDebt);
router.delete('/:id', debtController.deleteDebt);
router.post('/:id/payment', debtController.makeDebtPayment);

module.exports = router;
