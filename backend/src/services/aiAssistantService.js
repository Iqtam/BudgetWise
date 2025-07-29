const BudgetPlannerAgent = require("./budgetPlannerAgent");
const ReallocationAgent = require("./reallocationAgent");
const User = require("../models/User");
const ChatInteraction = require("../models/ChatInteraction");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import modular services
const ExpenseTrackingService = require("./expenseTrackingService");
const SavingsAdviceService = require("./savingsAdviceService");
const DebtManagementService = require("./debtManagementService");
const FinancialInsightsService = require("./financialInsightsService");
const GeneralQuestionService = require("./generalQuestionService");

// Initialize Gemini AI for intent classification
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIAssistantService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.budgetPlannerAgent = new BudgetPlannerAgent();
    this.reallocationAgent = new ReallocationAgent();

    // Initialize modular services
    this.expenseTrackingService = new ExpenseTrackingService();
    this.savingsAdviceService = new SavingsAdviceService();
    this.debtManagementService = new DebtManagementService();
    this.financialInsightsService = new FinancialInsightsService();
    this.generalQuestionService = new GeneralQuestionService();

    // Intent patterns
    this.intentPatterns = {
      BUDGET_PLANNING: [
        "help me plan a budget",
        "create a budget",
        "budget planning",
        "how should I allocate my money",
        "budget for next month",
        "organize my finances",
        "make a financial plan",
        "budget assistance",
        "financial planning",
      ],
      EXPENSE_TRACKING: [
        "track expenses",
        "add expense",
        "record transaction",
        "spent money on",
        "bought something",
      ],
      SAVINGS_ADVICE: [
        "savings goal",
        "how to save money",
        "saving tips",
        "build emergency fund",
      ],
      DEBT_MANAGEMENT: [
        "pay off debt",
        "debt advice",
        "loan payment",
        "debt strategy",
      ],
      FINANCIAL_INSIGHTS: [
        "spending analysis",
        "financial insights",
        "money habits",
        "spending patterns",
        "financial summary",
        "how am i doing",
        "financial overview",
        "my finances",
        "financial health",
      ],
      BUDGET_REALLOCATION: [
        "reallocate budget",
        "budget reallocation",
        "redistribute budget",
        "move money between categories",
        "adjust budget allocations",
        "optimize budget",
        "budget optimization",
        "rebalance budget",
      ],
      GENERAL_QUESTION: [
        "help",
        "what can you do",
        "financial advice",
        "money question",
      ],
    };
  }

  // Main entry point for AI Assistant
  async processUserMessage(firebaseUid, message, conversationContext = {}) {
    try {
      // Find user by Firebase UID
      const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
      if (!user) {
        throw new Error("User not found");
      }

      console.log(`Processing message for user ${user.id}: "${message}"`);

      // Classify intent
      const intent = await this.classifyIntent(message);
      console.log(`Classified intent: ${intent}`);

      // Route to appropriate agent
      const response = await this.routeToAgent(
        intent,
        user.id,
        message,
        conversationContext
      );

      // Store interaction in chat history
      await this.storeChatInteraction(user.id, message, intent, response);
      console.log("Chat Response", response);
      console.log("Response keys:", Object.keys(response));
      console.log("Graph data in response:", response.graphData);
      console.log("Insight type in response:", response.insightType);
      return {
        success: true,
        intent,
        ...response,
      };
    } catch (error) {
      console.error("Error processing user message:", error);
      return {
        success: false,
        error: error.message,
        conversationalResponse:
          "I apologize, but I encountered an issue processing your request. Please try again.",
      };
    }
  }

  // Intent classification using rule-based patterns + LLM fallback
  async classifyIntent(message) {
    const lowerMessage = message.toLowerCase();

    // First try rule-based classification
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      if (
        patterns.some((pattern) => lowerMessage.includes(pattern.toLowerCase()))
      ) {
        return intent;
      }
    }

    // Fallback to LLM classification
    try {
      const prompt = `Classify this financial query into one of these categories:
      - BUDGET_PLANNING: User wants help creating or planning a budget
      - BUDGET_REALLOCATION: User wants to reallocate, redistribute, or optimize budget allocations
      - EXPENSE_TRACKING: User wants to track or record expenses
      - SAVINGS_ADVICE: User wants advice on saving money or savings goals
      - DEBT_MANAGEMENT: User wants help with debt payment or debt strategy
      - FINANCIAL_INSIGHTS: User wants analysis of their spending or financial patterns, financial summary, or overview
      - GENERAL_QUESTION: General financial questions or help requests

      User message: "${message}"

      Respond with only the category name, nothing else.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const classification = response.text().trim();

      // Validate the classification
      if (Object.keys(this.intentPatterns).includes(classification)) {
        return classification;
      }
    } catch (error) {
      console.error("Error in LLM intent classification:", error);
    }

    // Default fallback
    return "GENERAL_QUESTION";
  }

  // Route to appropriate agent based on intent
  async routeToAgent(intent, userId, message, conversationContext) {
    switch (intent) {
      case "BUDGET_PLANNING":
        return await this.budgetPlannerAgent.createBudgetPlan(
          userId,
          message,
          conversationContext
        );

      case "EXPENSE_TRACKING":
        return await this.expenseTrackingService.handleExpenseTracking(
          userId,
          message
        );

      case "SAVINGS_ADVICE":
        return await this.savingsAdviceService.handleSavingsAdvice(
          userId,
          message
        );

      case "DEBT_MANAGEMENT":
        return await this.debtManagementService.handleDebtManagement(
          userId,
          message
        );

      case "FINANCIAL_INSIGHTS":
        return await this.financialInsightsService.handleFinancialInsights(
          userId,
          message
        );

      case "BUDGET_REALLOCATION":
        return await this.reallocationAgent.handleBudgetReallocation(
          userId,
          message,
          conversationContext
        );

      case "GENERAL_QUESTION":
      default:
        return await this.generalQuestionService.handleGeneralQuestion(
          userId,
          message
        );
    }
  }

  // Store chat interaction in database
  async storeChatInteraction(userId, inputText, intent, response) {
    try {
      await ChatInteraction.create({
        user_id: userId,
        input_text: inputText,
        interpreted_action: intent,
        response: response.conversationalResponse,
        response_type: this.getResponseType(intent),
      });
    } catch (error) {
      console.error("Error storing chat interaction:", error);
    }
  }

  // Determine response type for chat interaction
  getResponseType(intent) {
    const typeMapping = {
      BUDGET_PLANNING: "suggestion",
      EXPENSE_TRACKING: "transaction",
      SAVINGS_ADVICE: "suggestion",
      DEBT_MANAGEMENT: "suggestion",
      FINANCIAL_INSIGHTS: "summary",
      BUDGET_REALLOCATION: "suggestion",
      GENERAL_QUESTION: "summary",
    };

    return typeMapping[intent] || "summary";
  }
}

module.exports = AIAssistantService;
