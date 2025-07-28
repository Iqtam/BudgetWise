const BudgetPlannerAgent = require('./budgetPlannerAgent');
const ReallocationAgent = require('./reallocationAgent');
const User = require('../models/User');
const ChatInteraction = require('../models/ChatInteraction');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI for intent classification
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIAssistantService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.budgetPlannerAgent = new BudgetPlannerAgent();
    this.reallocationAgent = new ReallocationAgent();
    
    // Intent patterns
    this.intentPatterns = {
      BUDGET_PLANNING: [
        'help me plan a budget',
        'create a budget',
        'budget planning',
        'how should I allocate my money',
        'budget for next month',
        'organize my finances',
        'make a financial plan',
        'budget assistance',
        'financial planning'
      ],
      EXPENSE_TRACKING: [
        'track expenses',
        'add expense',
        'record transaction',
        'spent money on',
        'bought something'
      ],
      SAVINGS_ADVICE: [
        'savings goal',
        'how to save money',
        'saving tips',
        'build emergency fund'
      ],
      DEBT_MANAGEMENT: [
        'pay off debt',
        'debt advice',
        'loan payment',
        'debt strategy'
      ],
      FINANCIAL_INSIGHTS: [
        'spending analysis',
        'financial insights',
        'money habits',
        'spending patterns'
      ],
      BUDGET_REALLOCATION: [
        'reallocate budget',
        'budget reallocation',
        'redistribute budget',
        'move money between categories',
        'adjust budget allocations',
        'optimize budget',
        'budget optimization',
        'rebalance budget'
      ],
      GENERAL_QUESTION: [
        'help',
        'what can you do',
        'financial advice',
        'money question'
      ]
    };
  }

  // Main entry point for AI Assistant
  async processUserMessage(firebaseUid, message, conversationContext = {}) {
    try {
      // Find user by Firebase UID
      const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
      if (!user) {
        throw new Error('User not found');
      }

      console.log(`Processing message for user ${user.id}: "${message}"`);

      // Classify intent
      const intent = await this.classifyIntent(message);
      console.log(`Classified intent: ${intent}`);

      // Route to appropriate agent
      const response = await this.routeToAgent(intent, user.id, message, conversationContext);

      // Store interaction in chat history
      await this.storeChatInteraction(user.id, message, intent, response);

      return {
        success: true,
        intent,
        ...response
      };

    } catch (error) {
      console.error('Error processing user message:', error);
      return {
        success: false,
        error: error.message,
        conversationalResponse: "I apologize, but I encountered an issue processing your request. Please try again."
      };
    }
  }

  // Intent classification using rule-based patterns + LLM fallback
  async classifyIntent(message) {
    const lowerMessage = message.toLowerCase();

    // First try rule-based classification
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern.toLowerCase()))) {
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
      - FINANCIAL_INSIGHTS: User wants analysis of their spending or financial patterns
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
      console.error('Error in LLM intent classification:', error);
    }

    // Default fallback
    return 'GENERAL_QUESTION';
  }

  // Route to appropriate agent based on intent
  async routeToAgent(intent, userId, message, conversationContext) {
    switch (intent) {
      case 'BUDGET_PLANNING':
        return await this.budgetPlannerAgent.createBudgetPlan(userId, message, conversationContext);

      case 'EXPENSE_TRACKING':
        return await this.handleExpenseTracking(userId, message);

      case 'SAVINGS_ADVICE':
        return await this.handleSavingsAdvice(userId, message);

      case 'DEBT_MANAGEMENT':
        return await this.handleDebtManagement(userId, message);

      case 'FINANCIAL_INSIGHTS':
        return await this.handleFinancialInsights(userId, message);

      case 'BUDGET_REALLOCATION':
        return await this.handleBudgetReallocation(userId, message, conversationContext);

      case 'GENERAL_QUESTION':
      default:
        return await this.handleGeneralQuestion(userId, message);
    }
  }

  // Handle expense tracking requests
  async handleExpenseTracking(userId, message) {
    return {
      conversationalResponse: `I can help you track expenses! You can tell me about your purchases in natural language, like "I spent $25 at Starbucks" or "Bought groceries for $80 yesterday." 

      I'll automatically categorize your expenses and add them to your transaction history. You can also upload receipt photos for automatic expense extraction.

      Would you like to tell me about a recent expense, or would you prefer to use the receipt scanner?`,
      
      actionItems: [
        {
          id: 1,
          title: "Add Expense via Chat",
          description: "Tell me about your expense in natural language",
          priority: "high"
        },
        {
          id: 2,
          title: "Upload Receipt",
          description: "Take a photo of your receipt for automatic processing",
          priority: "medium"
        }
      ],
      
      insights: [
        {
          type: "tip",
          title: "Expense Tracking Tips",
          message: "Regular expense tracking helps you stay within budget and identify spending patterns."
        }
      ]
    };
  }

  // Handle savings advice requests
  async handleSavingsAdvice(userId, message) {
    try {
      // Get user's current financial situation
      const financialSnapshot = await this.budgetPlannerAgent.gatherFinancialSnapshot(userId);
      const incomeAnalysis = this.budgetPlannerAgent.analyzeIncomePatterns(financialSnapshot.transactions);
      const spendingAnalysis = this.budgetPlannerAgent.analyzeSpendingPatterns(
        financialSnapshot.transactions, 
        financialSnapshot.categories
      );

      const currentSurplus = incomeAnalysis.averageMonthlyIncome - spendingAnalysis.totalMonthlySpending;
      const savingsRate = currentSurplus > 0 ? (currentSurplus / incomeAnalysis.averageMonthlyIncome) * 100 : 0;

      let response = `Based on your current financial situation, here's my savings advice:

      **Current Savings Potential:** $${currentSurplus.toFixed(2)} per month (${savingsRate.toFixed(1)}% of income)`;

      if (currentSurplus > 0) {
        response += `

        **Recommendations:**
        • Start with an emergency fund of $${(incomeAnalysis.averageMonthlyIncome * 3).toFixed(2)} (3 months of income)
        • Consider automating your savings to make it effortless
        • Explore high-yield savings accounts for better returns`;
      } else {
        response += `

        **To improve your savings:**
        • Review your budget to find areas to cut back
        • Consider increasing your income through side gigs
        • Start small - even $25/month builds the savings habit`;
      }

      return {
        conversationalResponse: response,
        actionItems: this.generateSavingsActionItems(currentSurplus, incomeAnalysis.averageMonthlyIncome),
        insights: [
          {
            type: "info",
            title: "Savings Rate",
            message: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend 20% or higher.`
          }
        ]
      };

    } catch (error) {
      console.error('Error in savings advice:', error);
      return {
        conversationalResponse: "I'd love to help with savings advice! To give you personalized recommendations, I need to analyze your income and spending patterns. Have you been tracking your expenses? Let me know about your financial goals and I'll provide tailored advice."
      };
    }
  }

  // Handle debt management requests
  async handleDebtManagement(userId, message) {
    try {
      const financialSnapshot = await this.budgetPlannerAgent.gatherFinancialSnapshot(userId);
      const debtAnalysis = this.budgetPlannerAgent.analyzeDebtSituation(financialSnapshot.debts);

      if (debtAnalysis.totalDebt === 0) {
        return {
          conversationalResponse: "Great news! You don't have any recorded debts in your account. This puts you in a strong financial position to focus on savings and investments. Keep up the good work!"
        };
      }

      let strategy = debtAnalysis.recommendedStrategy === 'avalanche' ? 
        'debt avalanche (paying highest interest rates first)' : 
        'debt snowball (paying smallest balances first)';

      const response = `I can help you tackle your debt strategically! Here's your debt situation:

      **Total Debt:** $${debtAnalysis.totalDebt.toFixed(2)}
      **Minimum Monthly Payments:** $${debtAnalysis.minimumPayments.toFixed(2)}
      **Recommended Strategy:** ${strategy}

      ${debtAnalysis.recommendedStrategy === 'avalanche' ? 
        'Focus on paying extra toward your highest interest debt while making minimum payments on others.' :
        'Start by paying off your smallest debt completely, then move to the next smallest. This builds momentum!'}`;

      return {
        conversationalResponse: response,
        actionItems: this.generateDebtActionItems(debtAnalysis),
        insights: [
          {
            type: "tip",
            title: "Debt Payoff Strategy",
            message: `The ${strategy} method can save you money and help you become debt-free faster.`
          }
        ]
      };

    } catch (error) {
      console.error('Error in debt management:', error);
      return {
        conversationalResponse: "I can help you create a debt payoff strategy! Tell me about your current debts (amounts, interest rates, minimum payments) and I'll recommend the best approach to pay them off efficiently."
      };
    }
  }

  // Handle financial insights requests
  async handleFinancialInsights(userId, message) {
    try {
      const financialSnapshot = await this.budgetPlannerAgent.gatherFinancialSnapshot(userId);
      const incomeAnalysis = this.budgetPlannerAgent.analyzeIncomePatterns(financialSnapshot.transactions);
      const spendingAnalysis = this.budgetPlannerAgent.analyzeSpendingPatterns(
        financialSnapshot.transactions, 
        financialSnapshot.categories
      );
      console.log('Financial Snapshot:', financialSnapshot);
      console.log('Income Analysis:', incomeAnalysis);
      console.log('Spending Analysis:', spendingAnalysis);


      // Generate insights
      const topSpendingCategory = Object.values(spendingAnalysis.categoryBreakdown)
        .sort((a, b) => b.averageMonthly - a.averageMonthly)[0];

      const response = `Here are your key financial insights:

      **Income Analysis:**
      • Average monthly income: $${incomeAnalysis.averageMonthlyIncome.toFixed(2)}
      • Income stability: ${(incomeAnalysis.incomeStability * 100).toFixed(1)}%
      • Trend: ${incomeAnalysis.trend}

      **Spending Analysis:**
      • Average monthly spending: $${spendingAnalysis.totalMonthlySpending.toFixed(2)}
      • Top spending category: ${topSpendingCategory ? topSpendingCategory.name : 'Unknown'} (${topSpendingCategory ? topSpendingCategory.percentage.toFixed(1) : 0}%)
      • Volatile spending areas: ${spendingAnalysis.volatileCategories.length} categories

      **Financial Health:**
      • Monthly surplus/deficit: $${(incomeAnalysis.averageMonthlyIncome - spendingAnalysis.totalMonthlySpending).toFixed(2)}
      • Savings rate: ${((incomeAnalysis.averageMonthlyIncome - spendingAnalysis.totalMonthlySpending) / incomeAnalysis.averageMonthlyIncome * 100).toFixed(1)}%`;

      return {
        conversationalResponse: response,
        insights: this.budgetPlannerAgent.generateInsights( {spendingAnalysis, incomeAnalysis} ),
        actionItems: [
          {
            id: 1,
            title: "Review Top Spending Category",
            description: `Examine your ${topSpendingCategory ? topSpendingCategory.name : 'top spending'} expenses for potential savings`,
            priority: "medium"
          }
        ]
      };

    } catch (error) {
      console.error('Error generating financial insights:', error);
      return {
        conversationalResponse: "I can provide detailed insights about your spending patterns and financial health! To get started, make sure you have some transaction history recorded. I can analyze your income trends, spending categories, and help identify areas for improvement."
      };
    }
  }

  // Handle budget reallocation requests
  async handleBudgetReallocation(userId, message, conversationContext) {
    try {
      console.log(`Processing budget reallocation for user: ${userId}`);
      
      // Extract timeframe from message or use default
      const timeframe = this.extractTimeframeFromMessage(message) || 'monthly';
      
      // Extract any specific goals mentioned
      const targetGoals = this.extractGoalsFromMessage(message);
      
      // Run reallocation analysis
      const reallocationResult = await this.reallocationAgent.analyzeAndRecommendReallocation(
        userId, 
        timeframe, 
        targetGoals
      );
      console.log('Reallocation analysis result:', reallocationResult);
      if (!reallocationResult.success) {
        return {
          conversationalResponse: `I encountered an issue analyzing your budget for reallocation: ${reallocationResult.error}. ${reallocationResult.fallbackAdvice?.message || 'Please try again later.'}`,
          actionItems: reallocationResult.fallbackAdvice?.basicAdvice?.map((advice, index) => ({
            id: index + 1,
            title: `Reallocation Tip ${index + 1}`,
            description: advice,
            priority: 'medium'
          })) || []
        };
      }
      
      // Generate conversational response
      const conversationalResponse = await this.reallocationAgent.generateReallocationLLMResponse(userId, reallocationResult);
      
      return {
        conversationalResponse,
        reallocationAnalysis: reallocationResult.analysis,
        opportunities: reallocationResult.opportunities,
        recommendations: reallocationResult.recommendations,
        reallocationPlan: reallocationResult.plan,
        projections: reallocationResult.projections,
        actionItems: this.generateReallocationActionItems(reallocationResult),
        insights: this.generateReallocationInsights(reallocationResult)
      };
      
    } catch (error) {
      console.error('Error in budget reallocation:', error);
      return {
        conversationalResponse: "I apologize, but I encountered an issue analyzing your budget for reallocation. Please ensure you have recent transaction data and active budgets, then try again.",
        actionItems: [
          {
            id: 1,
            title: "Check Budget Setup",
            description: "Ensure you have active budgets set up for your main expense categories",
            priority: "high"
          },
          {
            id: 2,
            title: "Add Recent Transactions",
            description: "Make sure your recent spending is recorded in the system",
            priority: "high"
          }
        ]
      };
    }
  }

  // Handle general questions
  async handleGeneralQuestion(userId, message) {
    const prompt = `You are a helpful financial assistant. Answer this financial question in a conversational, helpful way (150-300 words):

    User question: "${message}"

    Provide practical, actionable advice. If the question is outside financial topics, politely redirect to financial matters you can help with.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        conversationalResponse: text,
        actionItems: [
          {
            id: 1,
            title: "Explore Financial Features",
            description: "Try asking about budget planning, expense tracking, or savings advice",
            priority: "low"
          }
        ]
      };

    } catch (error) {
      console.error('Error in general question handling:', error);
      return {
        conversationalResponse: `I'm here to help with your financial questions! I can assist you with:

        • **Budget Planning** - Create personalized budgets based on your income and expenses
        • **Expense Tracking** - Record and categorize your spending
        • **Savings Advice** - Help you save money and reach your financial goals
        • **Debt Management** - Strategies to pay off debt efficiently
        • **Financial Insights** - Analyze your spending patterns and financial health

        What would you like help with today?`
      };
    }
  }

  // Generate savings-specific action items
  generateSavingsActionItems(surplus, monthlyIncome) {
    const actions = [
      {
        id: 1,
        title: "Set Up Emergency Fund",
        description: `Save $${(monthlyIncome * 3).toFixed(2)} for 3 months of expenses`,
        priority: "high"
      }
    ];

    if (surplus > 0) {
      actions.push({
        id: 2,
        title: "Automate Savings",
        description: `Set up automatic transfer of $${surplus.toFixed(2)} monthly`,
        priority: "high"
      });
    } else {
      actions.push({
        id: 2,
        title: "Review Budget",
        description: "Find areas to cut expenses and free up money for savings",
        priority: "high"
      });
    }

    return actions;
  }

  // Generate debt-specific action items
  generateDebtActionItems(debtAnalysis) {
    const actions = [
      {
        id: 1,
        title: "List All Debts",
        description: "Create a complete list of debts with balances and interest rates",
        priority: "high"
      },
      {
        id: 2,
        title: "Make Minimum Payments",
        description: `Ensure you're making minimum payments totaling $${debtAnalysis.minimumPayments.toFixed(2)}`,
        priority: "high"
      }
    ];

    if (debtAnalysis.recommendedStrategy === 'avalanche') {
      actions.push({
        id: 3,
        title: "Target Highest Interest Debt",
        description: "Put any extra money toward your highest interest rate debt",
        priority: "medium"
      });
    } else {
      actions.push({
        id: 3,
        title: "Pay Off Smallest Debt First",
        description: "Focus on completely paying off your smallest debt balance",
        priority: "medium"
      });
    }

    return actions;
  }

  // Store chat interaction in database
  async storeChatInteraction(userId, inputText, intent, response) {
    try {
      await ChatInteraction.create({
        user_id: userId,
        input_text: inputText,
        interpreted_action: intent,
        response: response.conversationalResponse,
        response_type: this.getResponseType(intent)
      });
    } catch (error) {
      console.error('Error storing chat interaction:', error);
    }
  }

  // Determine response type for chat interaction
  getResponseType(intent) {
    const typeMapping = {
      'BUDGET_PLANNING': 'suggestion',
      'EXPENSE_TRACKING': 'transaction',
      'SAVINGS_ADVICE': 'suggestion',
      'DEBT_MANAGEMENT': 'suggestion',
      'FINANCIAL_INSIGHTS': 'summary',
      'BUDGET_REALLOCATION': 'suggestion',
      'GENERAL_QUESTION': 'summary'
    };

    return typeMapping[intent] || 'summary';
  }

  // Helper methods for budget reallocation
  extractTimeframeFromMessage(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('weekly') || lowerMessage.includes('week')) return 'weekly';
    if (lowerMessage.includes('monthly') || lowerMessage.includes('month')) return 'monthly';
    if (lowerMessage.includes('quarterly') || lowerMessage.includes('quarter')) return 'quarterly';
    return 'monthly'; // default
  }

  extractGoalsFromMessage(message) {
    const goals = [];
    const lowerMessage = message.toLowerCase();
    
    // Look for common financial goals
    if (lowerMessage.includes('emergency fund')) {
      goals.push({ type: 'emergency_fund', priority: 'high' });
    }
    if (lowerMessage.includes('debt') || lowerMessage.includes('pay off')) {
      goals.push({ type: 'debt_payoff', priority: 'high' });
    }
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      goals.push({ type: 'savings_goal', priority: 'medium' });
    }
    if (lowerMessage.includes('invest')) {
      goals.push({ type: 'investment', priority: 'medium' });
    }
    
    return goals;
  }

  async generateReallocationResponse(reallocationResult) {
    const { analysis, recommendations, plan, projections } = reallocationResult;
    
    try {
      const prompt = `Generate a conversational response for budget reallocation analysis. Be encouraging and practical.

      Analysis Summary:
      - Total budget variance: ${analysis.totalVariancePercent?.toFixed(1)}%
      - Overspending categories: ${analysis.overspendingCategories?.length || 0}
      - Underspending categories: ${analysis.underspendingCategories?.length || 0}
      - Total recommendations: ${recommendations.recommendationCount || 0}
      
      Key Opportunities:
      ${reallocationResult.opportunities?.slice(0, 3).map(opp => 
        `- ${opp.reason} (${opp.priority} priority)`
      ).join('\n') || 'No major opportunities identified'}
      
      Expected Impact:
      - Potential monthly savings: $${projections.projectedMonthlySavings?.toFixed(0) || '0'}
      - Budget efficiency improvement: ${(projections.budgetEfficiencyImprovement * 100)?.toFixed(0) || '0'}%
      
      Write a conversational response (2-3 paragraphs) that:
      1. Acknowledges the user's current budget situation
      2. Highlights the main reallocation opportunities
      3. Explains the potential benefits
      4. Encourages action on the recommendations
      
      Be specific about dollar amounts and percentages where provided. Use a helpful, supportive tone.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error('Error generating reallocation response:', error);
      
      // Fallback response
      const totalRecommendations = recommendations.recommendationCount || 0;
      const potentialSavings = projections.projectedMonthlySavings || 0;
      
      return `I've analyzed your budget and found ${totalRecommendations} opportunities to optimize your spending allocations. ${
        analysis.overspendingCategories?.length > 0 
          ? `You're currently overspending in ${analysis.overspendingCategories.length} categories, ` 
          : ''
      }${
        analysis.underspendingCategories?.length > 0
          ? `while underutilizing ${analysis.underspendingCategories.length} budget categories. `
          : ''
      }

      By implementing these reallocation recommendations, you could potentially save $${potentialSavings.toFixed(0)} per month and improve your overall budget efficiency by ${(projections.budgetEfficiencyImprovement * 100).toFixed(0)}%. 

      The action items below provide specific steps to optimize your budget allocations. Start with the high-priority recommendations for the biggest impact!`;
    }
  }

  generateReallocationActionItems(reallocationResult) {
    const actionItems = [];
    const { plan } = reallocationResult;
    
    // Add immediate actions
    if (plan.immediate?.actions?.length > 0) {
      plan.immediate.actions.forEach((action, index) => {
        actionItems.push({
          id: actionItems.length + 1,
          title: action.description,
          description: `Priority: ${action.priority} | Impact: $${action.amount?.toFixed(0) || '0'}`,
          priority: action.priority,
          estimatedTime: '10-15 minutes'
        });
      });
    }
    
    // Add next cycle actions
    if (plan.nextCycle?.actions?.length > 0) {
      plan.nextCycle.actions.slice(0, 2).forEach((action, index) => {
        actionItems.push({
          id: actionItems.length + 1,
          title: action.description,
          description: `Next period optimization | Impact: $${action.amount?.toFixed(0) || '0'}`,
          priority: action.priority,
          estimatedTime: '15-20 minutes'
        });
      });
    }
    
    // Add monitoring action
    actionItems.push({
      id: actionItems.length + 1,
      title: "Monitor Budget Performance",
      description: "Track spending against new allocations for 2 weeks",
      priority: "medium",
      estimatedTime: "5 minutes daily"
    });
    
    return actionItems.slice(0, 5); // Limit to 5 action items
  }

  generateReallocationInsights(reallocationResult) {
    const insights = [];
    const { analysis, projections } = reallocationResult;
    
    // Variance insights
    if (analysis.totalVariancePercent > 20) {
      insights.push({
        type: 'warning',
        title: 'Significant Budget Variance',
        message: `Your actual spending differs from your budget by ${analysis.totalVariancePercent.toFixed(1)}%. This suggests your current allocations may need adjustment.`
      });
    }
    
    // Efficiency insights
    if (projections.budgetEfficiencyImprovement > 0.15) {
      insights.push({
        type: 'tip',
        title: 'High Optimization Potential',
        message: `These reallocations could improve your budget efficiency by ${(projections.budgetEfficiencyImprovement * 100).toFixed(0)}%. Focus on high-priority recommendations first.`
      });
    }
    
    // Savings insights
    if (projections.projectedMonthlySavings > 100) {
      insights.push({
        type: 'info',
        title: 'Potential Monthly Savings',
        message: `By optimizing your budget allocations, you could free up $${projections.projectedMonthlySavings.toFixed(0)} monthly for savings or debt payment.`
      });
    }
    
    // Untracked spending insight
    if (analysis.untrackedSpending?.total > 50) {
      insights.push({
        type: 'warning',
        title: 'Untracked Spending Detected',
        message: `You have $${analysis.untrackedSpending.total.toFixed(0)} in unbudgeted spending. Consider creating budgets for these categories.`
      });
    }
    
    return insights.slice(0, 3); // Limit to 3 insights
  }
}

module.exports = AIAssistantService; 