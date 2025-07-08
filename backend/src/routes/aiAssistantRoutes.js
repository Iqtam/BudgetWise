const express = require('express');
const router = express.Router();
const aiAssistantController = require('../controllers/aiAssistantController');
const verifyFirebaseToken = require('../middlewares/firebaseAuth');

// Apply authentication middleware to all AI assistant routes
router.use(verifyFirebaseToken);

// Main chat endpoint - processes any user message
router.post('/chat', aiAssistantController.processChat);

// Chat history management
router.get('/chat/history', aiAssistantController.getChatHistory);
router.delete('/chat/history', aiAssistantController.deleteChatHistory);

// Get AI Assistant capabilities and help
router.get('/capabilities', aiAssistantController.getCapabilities);

// Specific AI services
router.post('/budget/plan', aiAssistantController.createBudgetPlan);
router.post('/budget/reallocation', aiAssistantController.getBudgetReallocation);
router.get('/insights', aiAssistantController.getFinancialInsights);
router.post('/savings/advice', aiAssistantController.getSavingsAdvice);
router.post('/debt/advice', aiAssistantController.getDebtAdvice);

module.exports = router; 