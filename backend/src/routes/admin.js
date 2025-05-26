const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/firebaseAuth');
const requireRole = require('../middlewares/requireRole');
const adminController = require('../controllers/adminController');

router.post('/set-role', verifyFirebaseToken, requireRole('admin'), adminController.setUserRole);

module.exports = router;