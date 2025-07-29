const BudgetPlannerAgent = require("./budgetPlannerAgent");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class DebtManagementService {
  constructor() {
    this.budgetPlannerAgent = new BudgetPlannerAgent();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Handle debt management requests
  async handleDebtManagement(userId, message) {
    try {
      const financialSnapshot =
        await this.budgetPlannerAgent.gatherFinancialSnapshot(userId);
      const debtAnalysis = this.budgetPlannerAgent.analyzeDebtSituation(
        financialSnapshot.debts
      );

      if (debtAnalysis.totalDebt === 0) {
        return {
          conversationalResponse:
            "Great news! You don't have any recorded debts in your account. This puts you in a strong financial position to focus on savings and investments. Keep up the good work!",
        };
      }

      // Generate LLM response
      const response = await this.generateDebtLLMResponse(
        debtAnalysis,
        financialSnapshot,
        message
      );

      return {
        conversationalResponse: response.conversationalResponse,
        actionItems: response.actionItems,
        insights: response.insights,
        graphData: this.generateDebtGraphData(debtAnalysis, financialSnapshot),
      };
    } catch (error) {
      console.error("Error in debt management:", error);
      return {
        conversationalResponse:
          "I can help you create a debt payoff strategy! Tell me about your current debts (amounts, interest rates, minimum payments) and I'll recommend the best approach to pay them off efficiently.",
      };
    }
  }

  // Generate debt-specific action items
  generateDebtActionItems(debtAnalysis) {
    const actions = [
      {
        id: 1,
        title: "List All Debts",
        description:
          "Create a complete list of debts with balances and interest rates",
        priority: "high",
      },
      {
        id: 2,
        title: "Make Minimum Payments",
        description: `Ensure you're making minimum payments totaling $${debtAnalysis.minimumPayments.toFixed(
          2
        )}`,
        priority: "high",
      },
    ];

    if (debtAnalysis.recommendedStrategy === "avalanche") {
      actions.push({
        id: 3,
        title: "Target Highest Interest Debt",
        description:
          "Put any extra money toward your highest interest rate debt",
        priority: "medium",
      });
    } else {
      actions.push({
        id: 3,
        title: "Pay Off Smallest Debt First",
        description:
          "Focus on completely paying off your smallest debt balance",
        priority: "medium",
      });
    }

    return actions;
  }

  // Generate LLM response for debt management
  async generateDebtLLMResponse(debtAnalysis, financialSnapshot, userMessage) {
    const prompt = this.createDebtAdvicePrompt(debtAnalysis, financialSnapshot, userMessage);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        conversationalResponse: text,
        actionItems: this.generateDebtActionItems(debtAnalysis),
        insights: this.generateDebtInsights(debtAnalysis),
      };
    } catch (error) {
      console.error("Error generating debt LLM response:", error);
      return {
        conversationalResponse: this.generateFallbackDebtResponse(debtAnalysis),
        actionItems: this.generateDebtActionItems(debtAnalysis),
        insights: this.generateDebtInsights(debtAnalysis),
      };
    }
  }

  // Create prompt for debt advice
  createDebtAdvicePrompt(debtAnalysis, financialSnapshot, userMessage) {
    const debts = financialSnapshot.debts || [];
    const strategy = debtAnalysis.recommendedStrategy === "avalanche"
      ? "debt avalanche (paying highest interest rates first)"
      : "debt snowball (paying smallest balances first)";

    const debtBreakdown = debts.map(debt => ({
      name: debt.name || debt.description || "Unknown Debt",
      balance: parseFloat(debt.amount) || 0,
      interestRate: parseFloat(debt.interest_rate) || 0
    }));

    return `You are a certified financial advisor providing personalized debt management advice.

## Instructions
- Write in a friendly, supportive, and motivational tone
- Use Markdown formatting for clarity and engagement
- Provide specific, actionable advice based on the user's debt situation
- Be encouraging and focus on debt payoff strategies
- Address the user's specific message if provided

## Debt Analysis

### Overall Debt Situation
- **Total Debt:** $${debtAnalysis.totalDebt.toFixed(2)}
- **Minimum Monthly Payments:** $${debtAnalysis.minimumPayments.toFixed(2)}
- **Recommended Strategy:** ${strategy}
- **Number of Debts:** ${debts.length}

### Individual Debts
${debtBreakdown.map((debt, index) => 
  `${index + 1}. ${debt.name}: $${debt.balance.toFixed(2)} (${debt.interestRate}% interest)`
).join('\n')}

### User Context
- **User Message:** "${userMessage}"
- **Analysis Period:** Current debt situation

---

### Please format your response using Markdown with the following structure:

## Debt Analysis
Start with an encouraging overview of their debt situation and payoff potential.

## Key Insights
- **Insight 1:** [Specific finding about their debt situation]
- **Insight 2:** [Another important observation]
- **Insight 3:** [Additional recommendation]

## Debt Payoff Strategy
- **Recommended Approach:** [Explain the ${strategy} method]
- **Priority Order:** [Which debts to tackle first and why]
- **Monthly Payment Strategy:** [How to allocate extra payments]

## Actionable Next Steps
- [Specific, actionable steps the user can take]

---

Focus on being specific about amounts, interest rates, and realistic payoff timelines. Use encouraging language and emphasize the benefits of becoming debt-free. Format your response using Markdown for clarity and readability.`;
  }

  // Generate fallback response if LLM fails
  generateFallbackDebtResponse(debtAnalysis) {
    const strategy = debtAnalysis.recommendedStrategy === "avalanche"
      ? "debt avalanche (paying highest interest rates first)"
      : "debt snowball (paying smallest balances first)";

    return `I can help you tackle your debt strategically! Here's your debt situation:

**Total Debt:** $${debtAnalysis.totalDebt.toFixed(2)}
**Minimum Monthly Payments:** $${debtAnalysis.minimumPayments.toFixed(2)}
**Recommended Strategy:** ${strategy}

${
  debtAnalysis.recommendedStrategy === "avalanche"
    ? "Focus on paying extra toward your highest interest debt while making minimum payments on others."
    : "Start by paying off your smallest debt completely, then move to the next smallest. This builds momentum!"
}`;
  }

  // Generate insights for debt management
  generateDebtInsights(debtAnalysis) {
    const insights = [];

    if (debtAnalysis.totalDebt > 0) {
      insights.push({
        type: "tip",
        title: "Debt Payoff Strategy",
        message: `The ${debtAnalysis.recommendedStrategy} method can save you money and help you become debt-free faster.`,
      });
    }

    if (debtAnalysis.minimumPayments > debtAnalysis.totalDebt * 0.1) {
      insights.push({
        type: "warning",
        title: "High Minimum Payments",
        message: `Your minimum payments are ${((debtAnalysis.minimumPayments / debtAnalysis.totalDebt) * 100).toFixed(1)}% of your total debt. Consider debt consolidation if beneficial.`,
      });
    }

    return insights;
  }

  // Generate graph data for debt management
  generateDebtGraphData(debtAnalysis, financialSnapshot) {
    const debts = financialSnapshot.debts || [];

    return {
      type: "debt",
      charts: [
        {
          title: "Debt Breakdown",
          type: "doughnut",
          data: debts.map((debt) => ({
            label: debt.name || debt.description || "Unknown Debt",
            value: parseFloat(debt.amount) || 0,
          })),
        },
        {
          title: "Debt Payoff Timeline",
          type: "gauge",
          data: {
            value:
              debtAnalysis.totalDebt > 0
                ? Math.min(
                    100,
                    (debtAnalysis.minimumPayments / debtAnalysis.totalDebt) *
                      100
                  )
                : 0,
            max: 100,
            label: "Monthly Payment %",
          },
        },
      ],
      summary: {
        totalDebt: debtAnalysis.totalDebt,
        minimumPayments: debtAnalysis.minimumPayments,
        debtCount: debts.length,
        averageInterest:
          debts.length > 0
            ? debts.reduce(
                (sum, debt) => sum + (parseFloat(debt.interest_rate) || 0),
                0
              ) / debts.length
            : 0,
        strategy: debtAnalysis.recommendedStrategy,
      },
    };
  }
}

module.exports = DebtManagementService;
