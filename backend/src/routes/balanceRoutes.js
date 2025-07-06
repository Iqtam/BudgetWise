const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const verifyFirebaseToken = require('../middlewares/firebaseAuth');

// Apply authentication middleware to all balance routes
router.use(verifyFirebaseToken);

router.get('/', balanceController.getBalance);
router.put('/', balanceController.updateBalance);
router.post('/adjust', balanceController.adjustBalance);

module.exports = router; 