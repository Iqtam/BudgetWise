const BudgetPlannerAgent = require("./budgetPlannerAgent");

class DebtManagementService {
  constructor() {
    this.budgetPlannerAgent = new BudgetPlannerAgent();
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

      let strategy =
        debtAnalysis.recommendedStrategy === "avalanche"
          ? "debt avalanche (paying highest interest rates first)"
          : "debt snowball (paying smallest balances first)";

      const response = `I can help you tackle your debt strategically! Here's your debt situation:

      **Total Debt:** $${debtAnalysis.totalDebt.toFixed(2)}
      **Minimum Monthly Payments:** $${debtAnalysis.minimumPayments.toFixed(2)}
      **Recommended Strategy:** ${strategy}

      ${
        debtAnalysis.recommendedStrategy === "avalanche"
          ? "Focus on paying extra toward your highest interest debt while making minimum payments on others."
          : "Start by paying off your smallest debt completely, then move to the next smallest. This builds momentum!"
      }`;

      return {
        conversationalResponse: response,
        actionItems: this.generateDebtActionItems(debtAnalysis),
        insights: [
          {
            type: "tip",
            title: "Debt Payoff Strategy",
            message: `The ${strategy} method can save you money and help you become debt-free faster.`,
          },
        ],
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
