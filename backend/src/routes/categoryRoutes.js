const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyFirebaseToken = require('../middlewares/firebaseAuth');

// Apply authentication middleware to all category routes
router.use(verifyFirebaseToken);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);

module.exports = router;
