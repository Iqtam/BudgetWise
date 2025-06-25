const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/firebaseAuth');
const authController = require('../controllers/authController');

router.post('/firebase', verifyFirebaseToken, authController.syncFirebaseUser);
router.get('/me', verifyFirebaseToken, authController.getCurrentUser);

module.exports = router;