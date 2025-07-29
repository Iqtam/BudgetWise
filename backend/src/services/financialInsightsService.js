const BudgetPlannerAgent = require("./budgetPlannerAgent");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class FinancialInsightsService {
  constructor() {
    this.budgetPlannerAgent = new BudgetPlannerAgent();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Handle financial insights requests
  async handleFinancialInsights(userId, message) {
    try {
      console.log("Handling financial insights for user:", userId);
      const financialSnapshot =
        await this.budgetPlannerAgent.gatherFinancialSnapshot(userId);
      console.log("Financial snapshot gathered:", {
        transactionCount: financialSnapshot.transactions.length,
        categoryCount: financialSnapshot.categories.length,
        hasBalance: !!financialSnapshot.balance,
        hasDebts: financialSnapshot.debts.length > 0,
      });

      const incomeAnalysis = this.budgetPlannerAgent.analyzeIncomePatterns(
        financialSnapshot.transactions
      );
      console.log("Income analysis:", incomeAnalysis);

      const spendingAnalysis = this.budgetPlannerAgent.analyzeSpendingPatterns(
        financialSnapshot.transactions,
        financialSnapshot.categories
      );
      console.log("Spending analysis:", spendingAnalysis);

      // Check if user is asking for specific insights or just general summary
      const isSpecificInsightRequest = this.isSpecificInsightRequest(message);

      if (isSpecificInsightRequest) {
        // Generate detailed insights for specific request
        const response = await this.generateSpecificFinancialInsights(
          financialSnapshot,
          incomeAnalysis,
          spendingAnalysis,
          message
        );

        console.log("Specific insights response:", response);
        console.log("Graph data from specific insights:", response.graphData);

        return {
          conversationalResponse: response.conversationalResponse,
          insights: response.insights,
          actionItems: response.actionItems,
          graphData: response.graphData,
          insightType: response.insightType,
          financialSnapshot: {
            incomeAnalysis,
            spendingAnalysis,
            categories: financialSnapshot.categories,
            transactions: financialSnapshot.transactions,
          },
        };
      } else {
        // Generate summary and ask for specific insights
        const summary = await this.generateFinancialSummary(
          financialSnapshot,
          incomeAnalysis,
          spendingAnalysis
        );

        console.log("Summary response:", summary);
        console.log("Graph data from summary:", summary.graphData);

        return {
          conversationalResponse: summary.conversationalResponse,
          insights: summary.insights,
          actionItems: summary.actionItems,
          graphData: summary.graphData,
          insightType: summary.insightType,
          financialSnapshot: {
            incomeAnalysis,
            spendingAnalysis,
            categories: financialSnapshot.categories,
            transactions: financialSnapshot.transactions,
          },
        };
      }
    } catch (error) {
      console.error("Error generating financial insights:", error);
      return {
        conversationalResponse:
          "I can provide detailed insights about your spending patterns and financial health! To get started, make sure you have some transaction history recorded. I can analyze your income trends, spending categories, and help identify areas for improvement.",
      };
    }
  }

  // Check if user is asking for specific insights
  isSpecificInsightRequest(message) {
    const lowerMessage = message.toLowerCase();
    const specificKeywords = [
      "income insights",
      "income analysis",
      "income breakdown",
      "expense insights",
      "expense analysis",
      "spending insights",
      "spending analysis",
      "budget insights",
      "budget analysis",
      "budget breakdown",
      "debt insights",
      "debt analysis",
      "debt breakdown",
      "savings insights",
      "savings analysis",
      "detailed",
      "specific",
      "breakdown",
      "analysis",
    ];

    return specificKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  // Determine the specific type of insight requested
  getInsightType(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("income")) {
      return "income";
    } else if (
      lowerMessage.includes("expense") ||
      lowerMessage.includes("spending")
    ) {
      return "expense";
    } else if (lowerMessage.includes("budget")) {
      return "budget";
    } else if (lowerMessage.includes("debt")) {
      return "debt";
    } else if (lowerMessage.includes("savings")) {
      return "savings";
    }

    return "general";
  }

  // Generate financial summary with option to get specific insights
  async generateFinancialSummary(
    financialSnapshot,
    incomeAnalysis,
    spendingAnalysis
  ) {
    const monthlySurplus =
      incomeAnalysis.averageMonthlyIncome -
      spendingAnalysis.totalMonthlySpending;
    const savingsRate =
      incomeAnalysis.averageMonthlyIncome > 0
        ? (monthlySurplus / incomeAnalysis.averageMonthlyIncome) * 100
        : 0;

    const topCategory = Object.values(
      spendingAnalysis.categoryBreakdown || {}
    ).sort((a, b) => b.averageMonthly - a.averageMonthly)[0];

    let debtAnalysis;
    try {
      debtAnalysis = await this.budgetPlannerAgent.analyzeDebtSituation(
        financialSnapshot.debts || []
      );
    } catch (error) {
      console.error("Error analyzing debt situation:", error);
      debtAnalysis = {
        totalDebt: 0,
        minimumPayments: 0,
        recommendedStrategy: "snowball",
      };
    }

    const summaryResponse = `## 📊 Your Financial Summary

**💰 Income:** $${incomeAnalysis.averageMonthlyIncome.toFixed(
      2
    )}/month average  
**💸 Expenses:** $${spendingAnalysis.totalMonthlySpending.toFixed(
      2
    )}/month average  
**💵 Monthly Surplus:** $${monthlySurplus.toFixed(2)} (${savingsRate.toFixed(
      1
    )}% savings rate)  
**🏆 Top Spending Category:** ${topCategory ? topCategory.name : "N/A"} - $${
      topCategory ? topCategory.averageMonthly.toFixed(2) : "0"
    }/month  
**💳 Total Debt:** $${debtAnalysis.totalDebt.toFixed(2)}

---

**Would you like me to dive deeper into any specific area?**

- **Income Insights** - Analyze your income patterns and stability
- **Expense Insights** - Detailed breakdown of your spending habits  
- **Budget Analysis** - Review your budget performance and allocations
- **Debt Analysis** - Debt payoff strategies and recommendations
- **Savings Insights** - Savings opportunities and goal tracking

Just let me know which area interests you most!`;

    return {
      conversationalResponse: summaryResponse,
      insights: this.generateSummaryInsights(
        incomeAnalysis,
        spendingAnalysis,
        debtAnalysis
      ),
      actionItems: this.generateSummaryActionItems(
        incomeAnalysis,
        spendingAnalysis,
        debtAnalysis
      ),
      graphData: this.generateGeneralGraphData(
        incomeAnalysis,
        spendingAnalysis,
        financialSnapshot
      ),
      insightType: "summary",
    };
  }

  // Generate specific financial insights for detailed requests
  async generateSpecificFinancialInsights(
    financialSnapshot,
    incomeAnalysis,
    spendingAnalysis,
    userMessage
  ) {
    const insightType = this.getInsightType(userMessage);

    // Generate targeted response based on insight type
    const targetedResponse = await this.generateTargetedInsightResponse(
      insightType,
      financialSnapshot,
      incomeAnalysis,
      spendingAnalysis,
      userMessage
    );

    // Generate graph data for the specific insight type
    const graphData = this.generateGraphDataForInsight(
      insightType,
      financialSnapshot,
      incomeAnalysis,
      spendingAnalysis
    );

    return {
      conversationalResponse: targetedResponse.conversationalResponse,
      insights: targetedResponse.insights,
      actionItems: targetedResponse.actionItems,
      graphData: graphData,
      insightType: insightType,
    };
  }

  // Generate targeted insight response based on type
  async generateTargetedInsightResponse(
    insightType,
    financialSnapshot,
    incomeAnalysis,
    spendingAnalysis,
    userMessage
  ) {
    const prompt = this.createTargetedInsightPrompt(
      insightType,
      financialSnapshot,
      incomeAnalysis,
      spendingAnalysis,
      userMessage
    );

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        conversationalResponse: text,
        insights: this.generateInsightsFromAnalysis(
          incomeAnalysis,
          spendingAnalysis
        ),
        actionItems: this.generateInsightsActionItems(
          incomeAnalysis,
          spendingAnalysis
        ),
      };
    } catch (error) {
      console.error("Error generating targeted insight response:", error);
      return {
        conversationalResponse: this.generateFallbackTargetedInsight(
          insightType,
          incomeAnalysis,
          spendingAnalysis
        ),
        insights: this.generateInsightsFromAnalysis(
          incomeAnalysis,
          spendingAnalysis
        ),
        actionItems: this.generateInsightsActionItems(
          incomeAnalysis,
          spendingAnalysis
        ),
      };
    }
  }

  // Create targeted prompt for specific insight types
  createTargetedInsightPrompt(
    insightType,
    financialSnapshot,
    incomeAnalysis,
    spendingAnalysis,
    userMessage
  ) {
    const baseData = this.getBaseFinancialData(
      incomeAnalysis,
      spendingAnalysis
    );

    let focusArea = "";
    let specificInstructions = "";

    switch (insightType) {
      case "income":
        focusArea =
          "income patterns, stability, and optimization opportunities";
        specificInstructions = `
- Analyze income consistency and trends
- Identify opportunities for income growth
- Provide specific advice for income optimization
- Focus on income stability and diversification`;
        break;
      case "expense":
        focusArea =
          "spending patterns, categories, and reduction opportunities";
        specificInstructions = `
- Analyze spending by category and frequency
- Identify areas for cost reduction
- Provide specific spending optimization advice
- Focus on discretionary vs essential spending`;
        break;
      case "budget":
        focusArea = "budget performance, allocations, and optimization";
        specificInstructions = `
- Analyze budget vs actual spending
- Identify budget allocation improvements
- Provide specific budget optimization advice
- Focus on budget efficiency and reallocation`;
        break;
      case "debt":
        focusArea = "debt situation, payoff strategies, and debt management";
        specificInstructions = `
- Analyze current debt levels and types
- Provide debt payoff strategies
- Identify debt reduction opportunities
- Focus on debt-to-income ratios and payment strategies`;
        break;
      case "savings":
        focusArea = "savings rate, goals, and optimization strategies";
        specificInstructions = `
- Analyze current savings rate and patterns
- Identify savings optimization opportunities
- Provide specific savings strategies
- Focus on emergency funds and long-term savings`;
        break;
      default:
        focusArea = "overall financial health and optimization";
        specificInstructions = `
- Provide comprehensive financial analysis
- Cover all major financial areas
- Focus on overall financial health improvement`;
    }

    return `You are a certified financial advisor providing ${insightType} insights and analysis.

## Instructions
- Write in a friendly, supportive, and motivational tone.
- Focus specifically on ${focusArea}.
- Use Markdown formatting for clarity and engagement.
- Use headings (##, ###), bold, bullet points, and tables where appropriate.
- Provide actionable insights and specific recommendations.
- Be encouraging and focus on opportunities for improvement.

${specificInstructions}

## Financial Data Analysis

### Income Analysis
- **Average Monthly Income:** $${incomeAnalysis.averageMonthlyIncome.toFixed(2)}
- **Income Stability:** ${(incomeAnalysis.incomeStability * 100).toFixed(1)}%
- **Income Trend:** ${incomeAnalysis.trend}
- **Total Income (6 months):** $${incomeAnalysis.totalIncome.toFixed(2)}

### Spending Analysis
- **Average Monthly Spending:** $${spendingAnalysis.totalMonthlySpending.toFixed(
      2
    )}
- **Top Spending Categories:**
${Object.values(spendingAnalysis.categoryBreakdown || {})
  .sort((a, b) => b.averageMonthly - a.averageMonthly)
  .slice(0, 5)
  .map(
    (cat, index) =>
      `  ${index + 1}. ${cat.name}: $${cat.averageMonthly.toFixed(
        2
      )} (${cat.percentage.toFixed(1)}%)`
  )
  .join("\n")}

### Financial Health Metrics
- **Monthly Surplus/Deficit:** $${baseData.monthlySurplus.toFixed(2)}
- **Savings Rate:** ${baseData.savingsRate.toFixed(1)}%
- **Spending-to-Income Ratio:** ${baseData.spendingToIncomeRatio.toFixed(1)}%

### User Context
- **User Message:** "${userMessage}"
- **Insight Type:** ${
      insightType.charAt(0).toUpperCase() + insightType.slice(1)
    }
- **Analysis Period:** Last 6 months of transaction data

---

### Please format your response using Markdown with the following structure:

## ${insightType.charAt(0).toUpperCase() + insightType.slice(1)} Analysis
Start with a focused analysis of the ${insightType} area.

## Key Insights & Patterns
- **Insight 1:** [Specific finding with explanation]
- **Insight 2:** [Another important pattern]
- **Insight 3:** [Additional observation]

## Specific Recommendations
- **Immediate Actions:** [Quick wins for ${insightType} improvement]
- **Medium-term Goals:** [3-6 month ${insightType} improvements]
- **Long-term Strategy:** [Longer-term ${insightType} planning]

## Actionable Next Steps
- [Specific, actionable steps the user can take]

---

Focus on being specific about amounts, percentages, and categories. Use encouraging language and emphasize opportunities for improvement. Format your response using Markdown for clarity and readability.`;
  }

  // Generate graph data for specific insight types
  generateGraphDataForInsight(
    insightType,
    financialSnapshot,
    incomeAnalysis,
    spendingAnalysis
  ) {
    const baseData = this.getBaseFinancialData(
      incomeAnalysis,
      spendingAnalysis
    );

    switch (insightType) {
      case "income":
        return this.generateIncomeGraphData(incomeAnalysis, financialSnapshot);
      case "expense":
        return this.generateExpenseGraphData(
          spendingAnalysis,
          financialSnapshot
        );
      case "budget":
        return this.generateBudgetGraphData(
          spendingAnalysis,
          financialSnapshot
        );
      case "debt":
        return this.generateDebtGraphData(financialSnapshot);
      case "savings":
        return this.generateSavingsGraphData(
          baseData,
          incomeAnalysis,
          spendingAnalysis,
          financialSnapshot
        );
      default:
        return this.generateGeneralGraphData(
          incomeAnalysis,
          spendingAnalysis,
          financialSnapshot
        );
    }
  }

  // Helper method to get base financial data
  getBaseFinancialData(incomeAnalysis, spendingAnalysis) {
    const monthlySurplus =
      incomeAnalysis.averageMonthlyIncome -
      spendingAnalysis.totalMonthlySpending;
    const savingsRate =
      incomeAnalysis.averageMonthlyIncome > 0
        ? (monthlySurplus / incomeAnalysis.averageMonthlyIncome) * 100
        : 0;
    const spendingToIncomeRatio =
      incomeAnalysis.averageMonthlyIncome > 0
        ? (spendingAnalysis.totalMonthlySpending /
            incomeAnalysis.averageMonthlyIncome) *
          100
        : 0;

    return {
      monthlySurplus,
      savingsRate,
      spendingToIncomeRatio,
    };
  }

  // Generate income-specific graph data
  generateIncomeGraphData(incomeAnalysis, financialSnapshot) {
    return {
      type: "income",
      charts: [
        {
          title: "Monthly Income Trend",
          type: "line",
          data: financialSnapshot.transactions
            .filter((t) => t.type === "income")
            .map((t) => ({
              month: new Date(t.date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
              amount: t.amount,
            })),
        },
        {
          title: "Income Stability",
          type: "gauge",
          data: {
            value: incomeAnalysis.incomeStability * 100,
            max: 100,
            label: "Stability %",
          },
        },
      ],
      summary: {
        averageMonthly: incomeAnalysis.averageMonthlyIncome,
        stability: incomeAnalysis.incomeStability * 100,
        trend: incomeAnalysis.trend,
      },
    };
  }

  // Generate expense-specific graph data
  generateExpenseGraphData(spendingAnalysis, financialSnapshot) {
    const categoryData = Object.values(spendingAnalysis.categoryBreakdown || {})
      .sort((a, b) => b.averageMonthly - a.averageMonthly)
      .slice(0, 8);

    return {
      type: "expense",
      charts: [
        {
          title: "Spending by Category",
          type: "doughnut",
          data: categoryData.map((cat) => ({
            label: cat.name,
            value: cat.averageMonthly,
            percentage: cat.percentage,
          })),
        },
        {
          title: "Monthly Spending Trend",
          type: "line",
          data: financialSnapshot.transactions
            .filter((t) => t.type === "expense")
            .map((t) => ({
              month: new Date(t.date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
              amount: t.amount,
            })),
        },
      ],
      summary: {
        totalMonthly: spendingAnalysis.totalMonthlySpending,
        topCategory: categoryData[0]?.name || "N/A",
        categoryCount: Object.keys(spendingAnalysis.categoryBreakdown || {})
          .length,
      },
    };
  }

  // Generate budget-specific graph data
  generateBudgetGraphData(spendingAnalysis, financialSnapshot) {
    return {
      type: "budget",
      charts: [
        {
          title: "Budget vs Actual Spending",
          type: "bar",
          data: Object.values(spendingAnalysis.categoryBreakdown || {}).map(
            (cat) => ({
              category: cat.name,
              budgeted: cat.budgeted || 0,
              actual: cat.averageMonthly,
              variance: cat.averageMonthly - (cat.budgeted || 0),
            })
          ),
        },
      ],
      summary: {
        categoriesWithBudget: Object.values(
          spendingAnalysis.categoryBreakdown || {}
        ).filter((cat) => cat.budgeted > 0).length,
        totalBudgeted: Object.values(
          spendingAnalysis.categoryBreakdown || {}
        ).reduce((sum, cat) => sum + (cat.budgeted || 0), 0),
      },
    };
  }

  // Generate debt-specific graph data
  generateDebtGraphData(financialSnapshot) {
    const debts = financialSnapshot.debts || [];

    return {
      type: "debt",
      charts: [
        {
          title: "Debt Breakdown",
          type: "pie",
          data: debts.map((debt) => ({
            label: debt.name,
            value: debt.balance,
            percentage:
              (debt.balance / debts.reduce((sum, d) => sum + d.balance, 0)) *
              100,
          })),
        },
      ],
      summary: {
        totalDebt: debts.reduce((sum, debt) => sum + debt.balance, 0),
        debtCount: debts.length,
        averageInterest:
          debts.length > 0
            ? debts.reduce((sum, debt) => sum + debt.interest_rate, 0) /
              debts.length
            : 0,
      },
    };
  }

  // Generate savings-specific graph data
  generateSavingsGraphData(
    baseData,
    incomeAnalysis,
    spendingAnalysis,
    financialSnapshot
  ) {
    return {
      type: "savings",
      charts: [
        {
          title: "Savings Rate Over Time",
          type: "line",
          data: financialSnapshot.transactions
            .filter((t) => t.type === "savings")
            .map((t) => ({
              month: new Date(t.date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
              amount: t.amount,
            })),
        },
        {
          title: "Income vs Expenses vs Savings",
          type: "stacked-bar",
          data: {
            income: incomeAnalysis.averageMonthlyIncome,
            expenses: spendingAnalysis.totalMonthlySpending,
            savings: baseData.monthlySurplus,
          },
        },
      ],
      summary: {
        savingsRate: baseData.savingsRate,
        monthlySavings: baseData.monthlySurplus,
        emergencyFundTarget: incomeAnalysis.averageMonthlyIncome * 3,
      },
    };
  }

  // Generate general graph data
  generateGeneralGraphData(
    incomeAnalysis,
    spendingAnalysis,
    financialSnapshot
  ) {
    return {
      type: "general",
      charts: [
        {
          title: "Financial Overview",
          type: "donut",
          data: [
            { label: "Income", value: incomeAnalysis.averageMonthlyIncome },
            { label: "Expenses", value: spendingAnalysis.totalMonthlySpending },
            {
              label: "Savings",
              value:
                incomeAnalysis.averageMonthlyIncome -
                spendingAnalysis.totalMonthlySpending,
            },
          ],
        },
      ],
      summary: {
        income: incomeAnalysis.averageMonthlyIncome,
        expenses: spendingAnalysis.totalMonthlySpending,
        savings:
          incomeAnalysis.averageMonthlyIncome -
          spendingAnalysis.totalMonthlySpending,
      },
    };
  }

  // Generate fallback targeted insight
  generateFallbackTargetedInsight(
    insightType,
    incomeAnalysis,
    spendingAnalysis
  ) {
    const baseData = this.getBaseFinancialData(
      incomeAnalysis,
      spendingAnalysis
    );

    let response = `Here are your ${insightType} insights:\n\n`;

    switch (insightType) {
      case "income":
        response += `## Income Analysis\n\n`;
        response += `**Average Monthly Income:** $${incomeAnalysis.averageMonthlyIncome.toFixed(
          2
        )}\n`;
        response += `**Income Stability:** ${(
          incomeAnalysis.incomeStability * 100
        ).toFixed(1)}%\n`;
        response += `**Income Trend:** ${incomeAnalysis.trend}\n\n`;
        response += `**Recommendations:**\n`;
        response += `- Consider diversifying your income sources\n`;
        response += `- Build an emergency fund for income volatility\n`;
        response += `- Explore opportunities for income growth\n`;
        break;
      case "expense":
        response += `## Expense Analysis\n\n`;
        response += `**Average Monthly Spending:** $${spendingAnalysis.totalMonthlySpending.toFixed(
          2
        )}\n`;
        response += `**Top Spending Category:** ${
          Object.values(spendingAnalysis.categoryBreakdown || {}).sort(
            (a, b) => b.averageMonthly - a.averageMonthly
          )[0]?.name || "N/A"
        }\n\n`;
        response += `**Recommendations:**\n`;
        response += `- Review your top spending categories for savings opportunities\n`;
        response += `- Consider setting spending limits for discretionary categories\n`;
        response += `- Track your expenses more closely to identify patterns\n`;
        break;
      case "budget":
        response += `## Budget Analysis\n\n`;
        response += `**Budget Performance:** Review your budget allocations and actual spending\n`;
        response += `**Recommendations:**\n`;
        response += `- Adjust budget categories based on actual spending patterns\n`;
        response += `- Set realistic budget limits for each category\n`;
        response += `- Monitor budget performance regularly\n`;
        break;
      case "debt":
        response += `## Debt Analysis\n\n`;
        response += `**Recommendations:**\n`;
        response += `- List all your debts with balances and interest rates\n`;
        response += `- Prioritize high-interest debt for faster payoff\n`;
        response += `- Consider debt consolidation if beneficial\n`;
        break;
      case "savings":
        response += `## Savings Analysis\n\n`;
        response += `**Current Savings Rate:** ${baseData.savingsRate.toFixed(
          1
        )}%\n`;
        response += `**Monthly Savings:** $${baseData.monthlySurplus.toFixed(
          2
        )}\n\n`;
        response += `**Recommendations:**\n`;
        response += `- Aim for a 20% savings rate\n`;
        response += `- Build an emergency fund of 3-6 months of expenses\n`;
        response += `- Automate your savings for consistency\n`;
        break;
      default:
        response += `## General Financial Analysis\n\n`;
        response += `**Monthly Surplus:** $${baseData.monthlySurplus.toFixed(
          2
        )}\n`;
        response += `**Savings Rate:** ${baseData.savingsRate.toFixed(1)}%\n\n`;
        response += `**Recommendations:**\n`;
        response += `- Focus on areas that need the most attention\n`;
        response += `- Set specific financial goals\n`;
        response += `- Track your progress regularly\n`;
    }

    return response;
  }

  // Create comprehensive prompt for financial insights
  createFinancialInsightsPrompt(
    financialSnapshot,
    incomeAnalysis,
    spendingAnalysis,
    userMessage
  ) {
    const topSpendingCategories = Object.values(
      spendingAnalysis.categoryBreakdown || {}
    )
      .sort((a, b) => b.averageMonthly - a.averageMonthly)
      .slice(0, 5);

    const volatileCategories =
      spendingAnalysis.volatileCategories?.slice(0, 3) || [];
    const monthlySurplus =
      incomeAnalysis.averageMonthlyIncome -
      spendingAnalysis.totalMonthlySpending;
    const savingsRate =
      incomeAnalysis.averageMonthlyIncome > 0
        ? (monthlySurplus / incomeAnalysis.averageMonthlyIncome) * 100
        : 0;

    return `You are a certified financial advisor providing personalized financial insights and analysis.

## Instructions
- Write in a friendly, supportive, and motivational tone.
- Make your explanation conversational, not just factual.
- Use Markdown formatting for clarity and engagement.
- Use headings (##, ###), bold, bullet points, and tables where appropriate.
- Provide actionable insights and specific recommendations.
- Be encouraging and focus on opportunities for improvement.

## Financial Data Analysis

### Income Analysis
- **Average Monthly Income:** $${incomeAnalysis.averageMonthlyIncome.toFixed(2)}
- **Income Stability:** ${(incomeAnalysis.incomeStability * 100).toFixed(1)}%
- **Income Trend:** ${incomeAnalysis.trend}
- **Total Income (6 months):** $${incomeAnalysis.totalIncome.toFixed(2)}

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
- **Volatile Spending Areas:** ${volatileCategories.length} categories
${volatileCategories
  .map((cat) => `  - ${cat.name}: High variance in spending`)
  .join("\n")}

### Financial Health Metrics
- **Monthly Surplus/Deficit:** $${monthlySurplus.toFixed(2)}
- **Savings Rate:** ${savingsRate.toFixed(1)}%
- **Spending-to-Income Ratio:** ${(
      (spendingAnalysis.totalMonthlySpending /
        incomeAnalysis.averageMonthlyIncome) *
      100
    ).toFixed(1)}%

### User Context
- **User Message:** "${userMessage}"
- **Analysis Period:** Last 6 months of transaction data

---

### Please format your response using Markdown with the following structure:

## Financial Health Overview
Start with a brief, encouraging summary of their overall financial situation.

## Key Insights & Patterns
- **Insight 1:** [Specific finding with explanation]
- **Insight 2:** [Another important pattern]
- **Insight 3:** [Additional observation]

## Spending Analysis
- **Top Spending Areas:** [Analysis of biggest expenses]
- **Volatile Categories:** [Areas with inconsistent spending]
- **Opportunities:** [Potential areas for improvement]

## Income Analysis
- **Stability Assessment:** [Analysis of income consistency]
- **Trend Analysis:** [Income pattern over time]
- **Recommendations:** [Suggestions for income optimization]

## Actionable Recommendations
- **Immediate Actions:** [Quick wins they can implement]
- **Medium-term Goals:** [3-6 month improvements]
- **Long-term Strategy:** [Longer-term financial planning]

## Financial Projections
- **Current Trajectory:** [Where they're headed based on current patterns]
- **Optimization Potential:** [What's possible with changes]
- **Risk Assessment:** [Potential financial risks to address]

---

Focus on being specific about amounts, percentages, and categories. Use encouraging language and emphasize opportunities for improvement. Format your response using Markdown for clarity and readability.`;
  }

  // Generate insights for the summary view
  generateSummaryInsights(incomeAnalysis, spendingAnalysis, debtAnalysis) {
    const insights = [];
    const monthlySurplus =
      incomeAnalysis.averageMonthlyIncome -
      spendingAnalysis.totalMonthlySpending;
    const savingsRate =
      incomeAnalysis.averageMonthlyIncome > 0
        ? (monthlySurplus / incomeAnalysis.averageMonthlyIncome) * 100
        : 0;

    // Savings rate insight
    if (savingsRate < 20) {
      insights.push({
        type: "warning",
        title: "Low Savings Rate",
        message: `Your savings rate is ${savingsRate.toFixed(
          1
        )}%. Consider increasing it to at least 20% for better financial health.`,
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

    // Debt insight
    if (debtAnalysis.totalDebt > 0) {
      insights.push({
        type: "warning",
        title: "Active Debt",
        message: `You have $${debtAnalysis.totalDebt.toFixed(
          2
        )} in debt. Consider prioritizing debt payoff in your financial plan.`,
      });
    } else {
      insights.push({
        type: "info",
        title: "Debt-Free Status",
        message:
          "Great job! You're currently debt-free, which puts you in a strong financial position.",
      });
    }

    // Income stability insight
    if (incomeAnalysis.incomeStability < 0.7) {
      insights.push({
        type: "warning",
        title: "Income Volatility",
        message: `Your income shows ${(
          (1 - incomeAnalysis.incomeStability) *
          100
        ).toFixed(1)}% volatility. Consider building an emergency fund.`,
      });
    }

    return insights;
  }

  // Generate action items for the summary view
  generateSummaryActionItems(incomeAnalysis, spendingAnalysis, debtAnalysis) {
    const actionItems = [];
    const monthlySurplus =
      incomeAnalysis.averageMonthlyIncome -
      spendingAnalysis.totalMonthlySpending;
    const savingsRate =
      incomeAnalysis.averageMonthlyIncome > 0
        ? (monthlySurplus / incomeAnalysis.averageMonthlyIncome) * 100
        : 0;

    // Top spending category action
    const topCategory = Object.values(
      spendingAnalysis.categoryBreakdown || {}
    ).sort((a, b) => b.averageMonthly - a.averageMonthly)[0];

    if (topCategory) {
      actionItems.push({
        id: 1,
        title: `Review ${topCategory.name} Spending`,
        description: `Analyze your $${topCategory.averageMonthly.toFixed(
          2
        )} monthly spending in ${topCategory.name}`,
        priority: "medium",
      });
    }

    // Savings action
    if (savingsRate < 20) {
      actionItems.push({
        id: 2,
        title: "Improve Savings Rate",
        description: `Aim to save at least 20% of your income (currently ${savingsRate.toFixed(
          1
        )}%)`,
        priority: "high",
      });
    }

    // Debt action
    if (debtAnalysis.totalDebt > 0) {
      actionItems.push({
        id: 3,
        title: "Create Debt Payoff Plan",
        description: `Develop a strategy to pay off your $${debtAnalysis.totalDebt.toFixed(
          2
        )} in debt`,
        priority: "high",
      });
    }

    return actionItems;
  }

  // Generate insights from analysis data
  generateInsightsFromAnalysis(incomeAnalysis, spendingAnalysis) {
    const insights = [];
    const monthlySurplus =
      incomeAnalysis.averageMonthlyIncome -
      spendingAnalysis.totalMonthlySpending;
    const savingsRate =
      incomeAnalysis.averageMonthlyIncome > 0
        ? (monthlySurplus / incomeAnalysis.averageMonthlyIncome) * 100
        : 0;

    // Income stability insight
    if (incomeAnalysis.incomeStability < 0.7) {
      insights.push({
        type: "warning",
        title: "Income Volatility",
        message: `Your income shows ${(
          (1 - incomeAnalysis.incomeStability) *
          100
        ).toFixed(
          1
        )}% volatility. Consider building an emergency fund to handle income fluctuations.`,
      });
    }

    // Savings rate insight
    if (savingsRate < 20) {
      insights.push({
        type: "warning",
        title: "Low Savings Rate",
        message: `Your savings rate is ${savingsRate.toFixed(
          1
        )}%. Financial experts recommend saving at least 20% of your income.`,
      });
    } else {
      insights.push({
        type: "info",
        title: "Good Savings Rate",
        message: `Your savings rate of ${savingsRate.toFixed(
          1
        )}% is above the recommended 20% threshold. Keep up the good work!`,
      });
    }

    // Spending analysis insight
    const topCategory = Object.values(
      spendingAnalysis.categoryBreakdown || {}
    ).sort((a, b) => b.averageMonthly - a.averageMonthly)[0];

    if (topCategory && topCategory.percentage > 30) {
      insights.push({
        type: "warning",
        title: "High Category Concentration",
        message: `${
          topCategory.name
        } represents ${topCategory.percentage.toFixed(
          1
        )}% of your spending. Consider diversifying your expenses.`,
      });
    }

    return insights;
  }

  // Generate action items from insights
  generateInsightsActionItems(incomeAnalysis, spendingAnalysis) {
    const actionItems = [];
    const monthlySurplus =
      incomeAnalysis.averageMonthlyIncome -
      spendingAnalysis.totalMonthlySpending;
    const savingsRate =
      incomeAnalysis.averageMonthlyIncome > 0
        ? (monthlySurplus / incomeAnalysis.averageMonthlyIncome) * 100
        : 0;

    // Top spending category action
    const topCategory = Object.values(
      spendingAnalysis.categoryBreakdown || {}
    ).sort((a, b) => b.averageMonthly - a.averageMonthly)[0];

    if (topCategory) {
      actionItems.push({
        id: 1,
        title: `Review ${topCategory.name} Spending`,
        description: `Analyze your $${topCategory.averageMonthly.toFixed(
          2
        )} monthly spending in ${topCategory.name} for potential savings`,
        priority: "high",
      });
    }

    // Savings rate action
    if (savingsRate < 20) {
      actionItems.push({
        id: 2,
        title: "Increase Savings Rate",
        description: `Aim to save at least 20% of your income (currently ${savingsRate.toFixed(
          1
        )}%)`,
        priority: "high",
      });
    }

    // Income stability action
    if (incomeAnalysis.incomeStability < 0.7) {
      actionItems.push({
        id: 3,
        title: "Build Emergency Fund",
        description:
          "Create a 3-6 month emergency fund to handle income volatility",
        priority: "medium",
      });
    }

    return actionItems;
  }

  // Generate fallback response if LLM fails
  generateFallbackFinancialInsights(incomeAnalysis, spendingAnalysis) {
    const monthlySurplus =
      incomeAnalysis.averageMonthlyIncome -
      spendingAnalysis.totalMonthlySpending;
    const savingsRate =
      incomeAnalysis.averageMonthlyIncome > 0
        ? (monthlySurplus / incomeAnalysis.averageMonthlyIncome) * 100
        : 0;
    const topCategory = Object.values(
      spendingAnalysis.categoryBreakdown || {}
    ).sort((a, b) => b.averageMonthly - a.averageMonthly)[0];

    return `Here are your key financial insights:

## Financial Health Overview
Your financial situation shows a monthly ${
      monthlySurplus >= 0 ? "surplus" : "deficit"
    } of $${Math.abs(monthlySurplus).toFixed(
      2
    )} with a savings rate of ${savingsRate.toFixed(1)}%.

## Key Insights & Patterns
- **Income Stability:** Your income shows ${(
      incomeAnalysis.incomeStability * 100
    ).toFixed(1)}% stability over the past 6 months
- **Top Spending Area:** ${
      topCategory ? topCategory.name : "Unknown"
    } represents your largest monthly expense at $${
      topCategory ? topCategory.averageMonthly.toFixed(2) : "0"
    }
- **Spending Pattern:** You're spending ${(
      (spendingAnalysis.totalMonthlySpending /
        incomeAnalysis.averageMonthlyIncome) *
      100
    ).toFixed(1)}% of your income

## Actionable Recommendations
- Review your ${
      topCategory ? topCategory.name : "top spending"
    } category for potential savings
- ${
      savingsRate < 20
        ? "Work on increasing your savings rate to at least 20%"
        : "Maintain your good savings rate"
    }
- Consider tracking your expenses more closely to identify additional savings opportunities

Your financial foundation is solid, and with some targeted adjustments, you can improve your financial health even further!`;
  }
}

module.exports = FinancialInsightsService;
