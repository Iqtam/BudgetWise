const AIAssistantService = require('../services/aiAssistantService');
const User = require('../models/User');
const ChatInteraction = require('../models/ChatInteraction');

class AIAssistantController {
  constructor() {
    this.aiAssistantService = new AIAssistantService();
  }

  // Main chat endpoint for processing user messages
  async processChat(req, res) {
    try {
      const { message, conversationContext } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Message is required and must be a non-empty string'
        });
      }

      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      console.log(`AI Assistant processing request for user: ${firebaseUid}`);
      console.log(`Message: "${message.trim()}"`);

      // Process the message through AI Assistant
      const response = await this.aiAssistantService.processUserMessage(
        firebaseUid, 
        message.trim(), 
        conversationContext || {}
      );

      if (!response.success) {
        return res.status(500).json({
          success: false,
          error: response.error,
          message: response.conversationalResponse
        });
      }

      // Return structured response
      res.status(200).json({
        success: true,
        message: 'Request processed successfully',
        data: {
          intent: response.intent,
          conversationalResponse: response.conversationalResponse,
          budgetSummary: response.budgetSummary || null,
          actionItems: response.actionItems || [],
          insights: response.insights || [],
          projections: response.projections || null,
          financialSnapshot: response.financialSnapshot || null,
          graphData: response.graphData || null,
          insightType: response.insightType || null
        }
      });

    } catch (error) {
      console.error('AI Assistant Controller Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'I apologize, but I encountered an issue processing your request. Please try again.'
      });
    }
  }

  // Get chat history for a user
  async getChatHistory(req, res) {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Find user by Firebase UID
      const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Fetch chat history
      const { count, rows: chatHistory } = await ChatInteraction.findAndCountAll({
        where: { user_id: user.id },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        attributes: [
          'id', 
          'input_text', 
          'interpreted_action', 
          'response', 
          'response_type', 
          'created_at'
        ]
      });

      res.status(200).json({
        success: true,
        data: {
          chatHistory: chatHistory.reverse(), // Reverse to show oldest first
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: limit
          }
        }
      });

    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch chat history'
      });
    }
  }

  // Delete chat history for a user
  async deleteChatHistory(req, res) {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Find user by Firebase UID
      const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Delete all chat interactions for the user
      const deletedCount = await ChatInteraction.destroy({
        where: { user_id: user.id }
      });

      res.status(200).json({
        success: true,
        message: `Deleted ${deletedCount} chat interactions`,
        data: { deletedCount }
      });

    } catch (error) {
      console.error('Error deleting chat history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete chat history'
      });
    }
  }

  // Get AI Assistant capabilities/help
  async getCapabilities(req, res) {
    try {
      const capabilities = {
        features: [
          {
            name: 'Budget Planning',
            description: 'Create personalized budgets based on your income and spending patterns',
            examples: [
              'Help me plan a budget',
              'Create a monthly budget',
              'How should I allocate my money?'
            ]
          },
          {
            name: 'Expense Tracking',
            description: 'Track and categorize your expenses using natural language',
            examples: [
              'I spent $25 at Starbucks',
              'Bought groceries for $80 yesterday',
              'Track my expenses'
            ]
          },
          {
            name: 'Savings Advice',
            description: 'Get personalized savings recommendations and strategies',
            examples: [
              'How can I save more money?',
              'Help me build an emergency fund',
              'Savings tips'
            ]
          },
          {
            name: 'Debt Management',
            description: 'Strategic advice for paying off debts efficiently',
            examples: [
              'Help me pay off my debt',
              'Debt payoff strategy',
              'Should I use debt avalanche or snowball?'
            ]
          },
          {
            name: 'Financial Insights',
            description: 'Analyze your spending patterns and financial health',
            examples: [
              'Show me my spending analysis',
              'Financial insights',
              'How are my money habits?'
            ]
          }
        ],
        supportedIntents: [
          'BUDGET_PLANNING',
          'EXPENSE_TRACKING',
          'SAVINGS_ADVICE',
          'DEBT_MANAGEMENT',
          'FINANCIAL_INSIGHTS',
          'GENERAL_QUESTION'
        ],
        responseTypes: [
          'suggestion',
          'transaction',
          'summary',
          'trend',
          'forecast'
        ]
      };

      res.status(200).json({
        success: true,
        data: capabilities
      });

    } catch (error) {
      console.error('Error getting capabilities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get capabilities'
      });
    }
  }

  // Budget planning specific endpoint
  async createBudgetPlan(req, res) {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Find user by Firebase UID
      const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      console.log(`Creating budget plan for user: ${user.id}`);

      // Create budget plan using the BudgetPlannerAgent
      const response = await this.aiAssistantService.budgetPlannerAgent.createBudgetPlan(
        user.id, 
        'Budget planning request',
        req.body.context || {}
      );

      if (!response.success) {
        return res.status(500).json({
          success: false,
          error: response.error,
          message: response.conversationalResponse
        });
      }

      res.status(200).json({
        success: true,
        message: 'Budget plan created successfully',
        data: {
          conversationalResponse: response.conversationalResponse,
          budgetSummary: response.budgetSummary,
          budgetPlan: response.budgetPlan,
          actionItems: response.actionItems,
          insights: response.insights,
          projections: response.projections,
          financialSnapshot: response.financialSnapshot
        }
      });

    } catch (error) {
      console.error('Error creating budget plan:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create budget plan',
        message: 'I apologize, but I encountered an issue creating your budget plan. Please try again.'
      });
    }
  }

  // Financial insights specific endpoint
  async getFinancialInsights(req, res) {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Find user by Firebase UID
      const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      console.log(`Generating financial insights for user: ${user.id}`);

      // Get financial insights
      const response = await this.aiAssistantService.handleFinancialInsights(
        user.id, 
        'Financial insights request'
      );

      res.status(200).json({
        success: true,
        message: 'Financial insights generated successfully',
        data: response
      });

    } catch (error) {
      console.error('Error getting financial insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get financial insights',
        message: 'I apologize, but I encountered an issue generating your financial insights. Please try again.'
      });
    }
  }

  // Savings advice specific endpoint
  async getSavingsAdvice(req, res) {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Find user by Firebase UID
      const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      console.log(`Generating savings advice for user: ${user.id}`);

      // Get savings advice
      const response = await this.aiAssistantService.handleSavingsAdvice(
        user.id, 
        req.body.message || 'Savings advice request'
      );

      res.status(200).json({
        success: true,
        message: 'Savings advice generated successfully',
        data: response
      });

    } catch (error) {
      console.error('Error getting savings advice:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get savings advice',
        message: 'I apologize, but I encountered an issue generating savings advice. Please try again.'
      });
    }
  }

  // Debt management advice specific endpoint
  async getDebtAdvice(req, res) {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Find user by Firebase UID
      const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      console.log(`Generating debt advice for user: ${user.id}`);

      // Get debt management advice
      const response = await this.aiAssistantService.handleDebtManagement(
        user.id, 
        req.body.message || 'Debt management advice request'
      );

      res.status(200).json({
        success: true,
        message: 'Debt advice generated successfully',
        data: response
      });

    } catch (error) {
      console.error('Error getting debt advice:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get debt advice',
        message: 'I apologize, but I encountered an issue generating debt advice. Please try again.'
      });
    }
  }

  // Budget reallocation specific endpoint
  async getBudgetReallocation(req, res) {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Find user by Firebase UID
      const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      console.log(`Generating budget reallocation for user: ${user.id}`);

      const { message, timeframe, targetGoals } = req.body;
      const userMessage = message || 'Analyze my budget and recommend reallocations';

      // Get budget reallocation recommendations
      const response = await this.aiAssistantService.handleBudgetReallocation(
        user.id, 
        userMessage,
        { 
          timeframe: timeframe || 'monthly',
          targetGoals: targetGoals || []
        }
      );

      res.status(200).json({
        success: true,
        message: 'Budget reallocation analysis completed successfully',
        data: response
      });

    } catch (error) {
      console.error('Error getting budget reallocation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get budget reallocation recommendations',
        message: 'I apologize, but I encountered an issue analyzing your budget for reallocation. Please try again.'
      });
    }
  }
}

// Create and export instance
const aiAssistantController = new AIAssistantController();

module.exports = {
  processChat: aiAssistantController.processChat.bind(aiAssistantController),
  getChatHistory: aiAssistantController.getChatHistory.bind(aiAssistantController),
  deleteChatHistory: aiAssistantController.deleteChatHistory.bind(aiAssistantController),
  getCapabilities: aiAssistantController.getCapabilities.bind(aiAssistantController),
  createBudgetPlan: aiAssistantController.createBudgetPlan.bind(aiAssistantController),
  getFinancialInsights: aiAssistantController.getFinancialInsights.bind(aiAssistantController),
  getSavingsAdvice: aiAssistantController.getSavingsAdvice.bind(aiAssistantController),
  getDebtAdvice: aiAssistantController.getDebtAdvice.bind(aiAssistantController),
  getBudgetReallocation: aiAssistantController.getBudgetReallocation.bind(aiAssistantController)
}; 