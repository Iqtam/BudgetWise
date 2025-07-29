const BudgetPlannerAgent = require("./budgetPlannerAgent");

class SavingsAdviceService {
  constructor() {
    this.budgetPlannerAgent = new BudgetPlannerAgent();
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

      let response = `Based on your current financial situation, here's my savings advice:

      **Current Savings Potential:** $${currentSurplus.toFixed(
        2
      )} per month (${savingsRate.toFixed(1)}% of income)`;

      if (currentSurplus > 0) {
        response += `

        **Recommendations:**
        - Start with an emergency fund of $${(
          incomeAnalysis.averageMonthlyIncome * 3
        ).toFixed(2)} (3 months of income)
        - Consider automating your savings to make it effortless
        - Explore high-yield savings accounts for better returns`;
      } else {
        response += `

        **To improve your savings:**
        - Review your budget to find areas to cut back
        - Consider increasing your income through side gigs
        - Start small - even $25/month builds the savings habit`;
      }

      return {
        conversationalResponse: response,
        actionItems: this.generateSavingsActionItems(
          currentSurplus,
          incomeAnalysis.averageMonthlyIncome
        ),
        insights: [
          {
            type: "info",
            title: "Savings Rate",
            message: `Your current savings rate is ${savingsRate.toFixed(
              1
            )}%. Financial experts recommend 20% or higher.`,
          },
        ],
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
