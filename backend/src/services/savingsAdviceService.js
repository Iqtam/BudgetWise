const BudgetPlannerAgent = require("./budgetPlannerAgent");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class SavingsAdviceService {
  constructor() {
    this.budgetPlannerAgent = new BudgetPlannerAgent();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Handle savings advice requests
  async handleSavingsAdvice(userId, message) {
    try {
      // Get user's current financial situation
      const financialSnapshot =
        await this.budgetPlannerAgent.gatherFinancialSnapshot(userId);
      const incomeAnalysis = this.budgetPlannerAgent.analyzeIncomePatterns(
        financialSnapshot.transactions
      );
      const spendingAnalysis = this.budgetPlannerAgent.analyzeSpendingPatterns(
        financialSnapshot.transactions,
        financialSnapshot.categories
      );

      const currentSurplus =
        incomeAnalysis.averageMonthlyIncome -
        spendingAnalysis.totalMonthlySpending;
      const savingsRate =
        currentSurplus > 0
          ? (currentSurplus / incomeAnalysis.averageMonthlyIncome) * 100
          : 0;

      // Generate LLM response
      const response = await this.generateSavingsLLMResponse(
        currentSurplus,
        savingsRate,
        incomeAnalysis,
        spendingAnalysis,
        financialSnapshot,
        message,
        conversationContext
      );

      return {
        conversationalResponse: response.conversationalResponse,
        actionItems: response.actionItems,
        insights: response.insights,
        graphData: this.generateSavingsGraphData(
          currentSurplus,
          incomeAnalysis,
          spendingAnalysis,
          financialSnapshot
        ),
      };
    } catch (error) {
      console.error("Error in savings advice:", error);
      return {
        conversationalResponse:
          "I'd love to help with savings advice! To give you personalized recommendations, I need to analyze your income and spending patterns. Have you been tracking your expenses? Let me know about your financial goals and I'll provide tailored advice.",
      };
    }
  }

  // Generate savings-specific action items
  generateSavingsActionItems(surplus, monthlyIncome) {
    const actions = [
      {
        id: 1,
        title: "Set Up Emergency Fund",
        description: `Save $${(monthlyIncome * 3).toFixed(
          2
        )} for 3 months of expenses`,
        priority: "high",
      },
    ];

    if (surplus > 0) {
      actions.push({
        id: 2,
        title: "Automate Savings",
        description: `Set up automatic transfer of $${surplus.toFixed(
          2
        )} monthly`,
        priority: "high",
      });
    } else {
      actions.push({
        id: 2,
        title: "Review Budget",
        description: "Find areas to cut expenses and free up money for savings",
        priority: "high",
      });
    }

    return actions;
  }

  // Generate LLM response for savings advice
  async generateSavingsLLMResponse(
    currentSurplus,
    savingsRate,
    incomeAnalysis,
    spendingAnalysis,
    financialSnapshot,
    userMessage,
    conversationContext = {}
  ) {
    const prompt = this.createSavingsAdvicePrompt(
      currentSurplus,
      savingsRate,
      incomeAnalysis,
      spendingAnalysis,
      financialSnapshot,
      userMessage,
      conversationContext
    );

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        conversationalResponse: text,
        actionItems: this.generateSavingsActionItems(
          currentSurplus,
          incomeAnalysis.averageMonthlyIncome
        ),
        insights: this.generateSavingsInsights(savingsRate, currentSurplus),
      };
    } catch (error) {
      console.error("Error generating savings LLM response:", error);
      return {
        conversationalResponse: this.generateFallbackSavingsResponse(
          currentSurplus,
          savingsRate,
          incomeAnalysis
        ),
        actionItems: this.generateSavingsActionItems(
          currentSurplus,
          incomeAnalysis.averageMonthlyIncome
        ),
        insights: this.generateSavingsInsights(savingsRate, currentSurplus),
      };
    }
  }

  // Create prompt for savings advice
  createSavingsAdvicePrompt(
    currentSurplus,
    savingsRate,
    incomeAnalysis,
    spendingAnalysis,
    financialSnapshot,
    userMessage,
    conversationContext = {}
  ) {
    const emergencyFundTarget = incomeAnalysis.averageMonthlyIncome * 3;
    const topSpendingCategories = Object.values(
      spendingAnalysis.categoryBreakdown || {}
    )
      .sort((a, b) => b.averageMonthly - a.averageMonthly)
      .slice(0, 3);

    // Add conversation context if available
    let contextEnhancement = "";
    if (
      conversationContext.conversationMemory &&
      conversationContext.conversationMemory.hasContext
    ) {
      contextEnhancement = `

## Conversation Context
${conversationContext.conversationMemory.context}

## Instructions for Context-Aware Response
- Reference previous conversation topics when relevant
- Build upon previous advice and recommendations
- Maintain consistency with earlier suggestions
- Address any follow-up questions or clarifications`;
    }

    return `You are a certified financial advisor providing personalized savings advice.

## Instructions
- Write in a friendly, supportive, and motivational tone
- Use Markdown formatting for clarity and engagement
- Provide specific, actionable advice based on the user's financial data
- Be encouraging and focus on opportunities for improvement
- Address the user's specific message if provided${contextEnhancement}

## Financial Data Analysis

### Income & Savings
- **Average Monthly Income:** $${incomeAnalysis.averageMonthlyIncome.toFixed(2)}
- **Current Monthly Surplus:** $${currentSurplus.toFixed(2)}
- **Savings Rate:** ${savingsRate.toFixed(1)}%
- **Emergency Fund Target:** $${emergencyFundTarget.toFixed(
      2
    )} (3 months of income)

### Spending Analysis
- **Average Monthly Spending:** $${spendingAnalysis.totalMonthlySpending.toFixed(
      2
    )}
- **Top Spending Categories:**
${topSpendingCategories
  .map(
    (cat, index) =>
      `  ${index + 1}. ${cat.name}: $${cat.averageMonthly.toFixed(
        2
      )} (${cat.percentage.toFixed(1)}%)`
  )
  .join("\n")}

### User Context
- **User Message:** "${userMessage}"
- **Analysis Period:** Last 6 months of transaction data

---

### Please format your response using Markdown with the following structure:

## Savings Analysis
Start with an encouraging overview of their current savings situation.

## Key Insights
- **Insight 1:** [Specific finding about their savings potential]
- **Insight 2:** [Another important observation]
- **Insight 3:** [Additional recommendation]

## Specific Recommendations
- **Immediate Actions:** [Quick wins for savings improvement]
- **Medium-term Goals:** [3-6 month savings strategies]
- **Long-term Strategy:** [Longer-term savings planning]

## Actionable Next Steps
- [Specific, actionable steps the user can take]

---

Focus on being specific about amounts, percentages, and realistic goals. Use encouraging language and emphasize opportunities for improvement. Format your response using Markdown for clarity and readability.`;
  }

  // Generate fallback response if LLM fails
  generateFallbackSavingsResponse(currentSurplus, savingsRate, incomeAnalysis) {
    const emergencyFundTarget = incomeAnalysis.averageMonthlyIncome * 3;

    let response = `Based on your current financial situation, here's my savings advice:

**Current Savings Potential:** $${currentSurplus.toFixed(
      2
    )} per month (${savingsRate.toFixed(1)}% of income)`;

    if (currentSurplus > 0) {
      response += `

**Recommendations:**
- Start with an emergency fund of $${emergencyFundTarget.toFixed(
        2
      )} (3 months of income)
- Consider automating your savings to make it effortless
- Explore high-yield savings accounts for better returns`;
    } else {
      response += `

**To improve your savings:**
- Review your budget to find areas to cut back
- Consider increasing your income through side gigs
- Start small - even $25/month builds the savings habit`;
    }

    return response;
  }

  // Generate insights for savings
  generateSavingsInsights(savingsRate, currentSurplus) {
    const insights = [];

    if (savingsRate < 20) {
      insights.push({
        type: "warning",
        title: "Low Savings Rate",
        message: `Your current savings rate is ${savingsRate.toFixed(
          1
        )}%. Financial experts recommend 20% or higher.`,
      });
    } else {
      insights.push({
        type: "info",
        title: "Good Savings Rate",
        message: `Your savings rate of ${savingsRate.toFixed(
          1
        )}% is above the recommended 20% threshold. Keep it up!`,
      });
    }

    if (currentSurplus <= 0) {
      insights.push({
        type: "warning",
        title: "No Monthly Surplus",
        message:
          "You're spending more than you earn. Focus on reducing expenses or increasing income.",
      });
    }

    return insights;
  }

  // Generate graph data for savings advice
  generateSavingsGraphData(
    surplus,
    incomeAnalysis,
    spendingAnalysis,
    financialSnapshot
  ) {
    return {
      type: "savings",
      charts: [
        {
          title: "Income vs Expenses vs Savings",
          type: "donut",
          data: [
            { label: "Income", value: incomeAnalysis.averageMonthlyIncome },
            { label: "Expenses", value: spendingAnalysis.totalMonthlySpending },
            { label: "Savings", value: Math.max(0, surplus) },
          ],
        },
        {
          title: "Savings Rate Progress",
          type: "gauge",
          data: {
            value:
              surplus > 0
                ? (surplus / incomeAnalysis.averageMonthlyIncome) * 100
                : 0,
            max: 50,
            label: "Savings Rate %",
          },
        },
      ],
      summary: {
        monthlyIncome: incomeAnalysis.averageMonthlyIncome,
        monthlyExpenses: spendingAnalysis.totalMonthlySpending,
        monthlySavings: surplus,
        savingsRate:
          surplus > 0
            ? (surplus / incomeAnalysis.averageMonthlyIncome) * 100
            : 0,
        emergencyFundTarget: incomeAnalysis.averageMonthlyIncome * 3,
      },
    };
  }
}

module.exports = SavingsAdviceService;
