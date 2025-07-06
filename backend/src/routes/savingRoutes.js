const express = require('express');
const router = express.Router();
const savingController = require('../controllers/savingController');
const verifyFirebaseToken = require('../middlewares/firebaseAuth');

// Apply authentication middleware to all saving routes
router.use(verifyFirebaseToken);

router.post('/', savingController.createSaving);
router.get('/', savingController.getAllSavings);
router.delete('/:id', savingController.deleteSaving);
router.put('/:id', savingController.updateSaving);
router.get('/:id', savingController.getSavingById);


module.exports = router;
