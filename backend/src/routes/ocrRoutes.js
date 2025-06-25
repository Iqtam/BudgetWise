const express = require("express");
const router = express.Router();
const ocrController = require("../controllers/ocrController");
const firebaseAuth = require("../middlewares/firebaseAuth");

// Apply Firebase authentication to all OCR routes
router.use(firebaseAuth);

// OCR Receipt Processing
router.post("/receipt", ocrController.processReceipt);

// Get OCR History
router.get("/history", ocrController.getOCRHistory);

module.exports = router;
