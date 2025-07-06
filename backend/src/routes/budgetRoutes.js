const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const verifyFirebaseToken = require('../middlewares/firebaseAuth');

// Apply authentication middleware to all budget routes
router.use(verifyFirebaseToken);

router.post('/', budgetController.createBudget);
router.get('/', budgetController.getAllBudgets);
router.get('/:id', budgetController.getBudgetById);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);
router.post('/sync', budgetController.syncBudgetSpendingAPI);

module.exports = router;
