const { Op } = require("sequelize");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Balance = require("../models/Balance");
const Debt = require("../models/Debt");
const Saving = require("../models/Saving");
const Category = require("../models/Category");
const User = require("../models/User");
const ChatInteraction = require("../models/ChatInteraction");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class BudgetPlannerAgent {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Phase 1: Data Aggregation & Analysis
  async gatherFinancialSnapshot(userId) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [
        transactions,
        currentBudgets,
        balance,
        debts,
        savings,
        categories,
      ] = await Promise.all([
        Transaction.findAll({
          where: {
            user_id: userId,
            date: {
              [Op.gte]: sixMonthsAgo,
            },
          },
          order: [["date", "DESC"]],
        }),
        Budget.findAll({
          where: { user_id: userId },
        }),
        Balance.findOne({ where: { user_id: userId } }),
        Debt.findAll({ where: { user_id: userId } }),
        Saving.findAll({ where: { user_id: userId } }),
        Category.findAll({ where: { user_id: userId } }),
      ]);

      return {
        transactions,
        currentBudgets,
        balance: balance || { balance: 0 },
        debts,
        savings,
        categories,
        snapshotDate: new Date(),
      };
    } catch (error) {
      console.error("Error gathering financial snapshot:", error);
      throw new Error("Failed to gather financial data");
    }
  }

  // Analyze income patterns from transaction history
  analyzeIncomePatterns(transactions) {
    const incomeTransactions = transactions.filter((t) => t.type === "income");

    if (incomeTransactions.length === 0) {
      return {
        averageMonthlyIncome: 0,
        incomeStability: 0,
        trend: "unknown",
        recurringIncome: [],
        totalIncome: 0,
      };
    }

    // Group by month
    const monthlyIncome = {};
    incomeTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyIncome[monthKey]) {
        monthlyIncome[monthKey] = 0;
      }
      monthlyIncome[monthKey] += parseFloat(transaction.amount);
    });

    const monthlyAmounts = Object.values(monthlyIncome);
    const averageMonthlyIncome =
      monthlyAmounts.reduce((sum, amount) => sum + amount, 0) /
      monthlyAmounts.length;

    // Calculate stability (lower variance = more stable)
    const variance =
      monthlyAmounts.reduce(
        (sum, amount) => sum + Math.pow(amount - averageMonthlyIncome, 2),
        0
      ) / monthlyAmounts.length;
    const incomeStability = Math.max(
      0,
      1 - Math.sqrt(variance) / averageMonthlyIncome
    );

    // Determine trend
    let trend = "stable";
    if (monthlyAmounts.length >= 3) {
      const firstThird = monthlyAmounts.slice(
        0,
        Math.floor(monthlyAmounts.length / 3)
      );
      const lastThird = monthlyAmounts.slice(
        -Math.floor(monthlyAmounts.length / 3)
      );
      const firstAvg =
        firstThird.reduce((sum, amount) => sum + amount, 0) / firstThird.length;
      const lastAvg =
        lastThird.reduce((sum, amount) => sum + amount, 0) / lastThird.length;

      if (lastAvg > firstAvg * 1.1) trend = "increasing";
      else if (lastAvg < firstAvg * 0.9) trend = "decreasing";
    }

    return {
      averageMonthlyIncome,
      incomeStability,
      trend,
      recurringIncome: this.identifyRecurringIncome(incomeTransactions),
      totalIncome: incomeTransactions.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0
      ),
      monthlyBreakdown: monthlyIncome,
    };
  }

  // Analyze spending patterns by category
  analyzeSpendingPatterns(transactions, categories) {
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense"
    );

    if (expenseTransactions.length === 0) {
      return {
        totalMonthlySpending: 0,
        categoryBreakdown: {},
        spendingTrends: {},
        volatileCategories: [],
        essentialVsDiscretionary: { essential: 0, discretionary: 0 },
      };
    }

    // Group expenses by category and month
    const categorySpending = {};
    const monthlySpending = {};

    expenseTransactions.forEach((transaction) => {
      const categoryId = transaction.category_id || "uncategorized";
      const date = new Date(transaction.date);
      const monthKey = date.toISOString().substring(0, 7);
      const amount = Math.abs(parseFloat(transaction.amount));

      // Category totals
      if (!categorySpending[categoryId]) {
        categorySpending[categoryId] = {
          total: 0,
          transactions: [],
          monthlyAmounts: {},
        };
      }
      categorySpending[categoryId].total += amount;
      categorySpending[categoryId].transactions.push(transaction);

      // Monthly breakdown by category
      if (!categorySpending[categoryId].monthlyAmounts[monthKey]) {
        categorySpending[categoryId].monthlyAmounts[monthKey] = 0;
      }
      categorySpending[categoryId].monthlyAmounts[monthKey] += amount;

      // Total monthly spending
      if (!monthlySpending[monthKey]) {
        monthlySpending[monthKey] = 0;
      }
      monthlySpending[monthKey] += amount;
    });

    // Calculate averages and trends
    const monthCount = Object.keys(monthlySpending).length || 1;
    const totalMonthlySpending =
      Object.values(monthlySpending).reduce((sum, amount) => sum + amount, 0) /
      monthCount;

    // Category analysis
    const categoryBreakdown = {};
    const volatileCategories = [];

    Object.entries(categorySpending).forEach(([categoryId, data]) => {
      const category = categories.find((c) => c.id === categoryId);
      const categoryName = category ? category.name : "Uncategorized";

      const monthlyAmounts = Object.values(data.monthlyAmounts);
      const averageMonthly = data.total / monthCount;

      // Calculate volatility
      const variance =
        monthlyAmounts.reduce(
          (sum, amount) => sum + Math.pow(amount - averageMonthly, 2),
          0
        ) / Math.max(monthlyAmounts.length, 1);
      const volatility = Math.sqrt(variance) / averageMonthly;

      categoryBreakdown[categoryId] = {
        name: categoryName,
        averageMonthly,
        total: data.total,
        transactionCount: data.transactions.length,
        volatility,
        percentage: (averageMonthly / totalMonthlySpending) * 100,
      };

      if (volatility > 0.5) {
        volatileCategories.push(categoryId);
      }
    });

    return {
      totalMonthlySpending,
      categoryBreakdown,
      volatileCategories,
      monthlyBreakdown: monthlySpending,
      transactionCount: expenseTransactions.length,
    };
  }

  // Identify recurring income sources
  identifyRecurringIncome(incomeTransactions) {
    const recurringPatterns = {};

    incomeTransactions.forEach((transaction) => {
      const key = `${transaction.description}-${Math.round(
        parseFloat(transaction.amount)
      )}`;
      if (!recurringPatterns[key]) {
        recurringPatterns[key] = [];
      }
      recurringPatterns[key].push(transaction);
    });

    return Object.entries(recurringPatterns)
      .filter(([key, transactions]) => transactions.length >= 2)
      .map(([key, transactions]) => ({
        pattern: key,
        frequency: transactions.length,
        averageAmount:
          transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) /
          transactions.length,
        lastOccurrence: Math.max(
          ...transactions.map((t) => new Date(t.date).getTime())
        ),
      }));
  }

  // Phase 2: Budget Framework Selection
  selectBudgetFramework(incomeAnalysis, debtAnalysis, savingsGoals) {
    const monthlyIncome = incomeAnalysis.averageMonthlyIncome;
    const totalDebt = debtAnalysis.totalDebt;
    const highInterestDebt = debtAnalysis.highInterestDebt;
    const aggressiveSavingsGoals = savingsGoals.filter(
      (goal) => goal.target_amount > monthlyIncome * 3
    );

    // Decision tree for framework selection
    if (monthlyIncome < 30000) {
      return "ENVELOPE_SYSTEM";
    }

    if (highInterestDebt > monthlyIncome * 0.3) {
      return "DEBT_AVALANCHE_BUDGET";
    }

    if (aggressiveSavingsGoals.length > 0) {
      return "AGGRESSIVE_SAVINGS_BUDGET";
    }

    if (incomeAnalysis.incomeStability > 0.8) {
      return "50_30_20_RULE";
    }

    return "BALANCED_APPROACH";
  }

  // Phase 3: Budget Calculation Algorithms
  calculate50_30_20Budget(monthlyIncome) {
    return {
      needs: monthlyIncome * 0.5,
      wants: monthlyIncome * 0.3,
      savingsAndDebt: monthlyIncome * 0.2,
      framework: "50_30_20_RULE",
    };
  }

  calculateEnvelopeBudget(monthlyIncome, fixedExpenses, spendingAnalysis) {
    const fixedTotal = fixedExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const remaining = monthlyIncome - fixedTotal;

    if (remaining <= 0) {
      throw new Error("Income insufficient to cover fixed expenses");
    }

    return {
      fixed: fixedTotal,
      groceries: remaining * 0.25,
      transportation: remaining * 0.15,
      entertainment: remaining * 0.1,
      miscellaneous: remaining * 0.2,
      emergency: remaining * 0.3,
      framework: "ENVELOPE_SYSTEM",
    };
  }

  calculateDebtAvalancheBudget(monthlyIncome, debts, essentialExpenses) {
    const essentialTotal = essentialExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const minimumDebtPayments = debts.reduce(
      (sum, debt) => sum + debt.amount * 0.02,
      0
    ); // 2% minimum

    const availableForDebtPayoff =
      monthlyIncome - essentialTotal - minimumDebtPayments;

    // Sort debts by interest rate (highest first)
    const sortedDebts = debts.sort(
      (a, b) => parseFloat(b.interest_rate) - parseFloat(a.interest_rate)
    );

    return {
      essentials: essentialTotal,
      minimumDebtPayments,
      extraDebtPayment: Math.max(0, availableForDebtPayoff),
      targetDebt: sortedDebts[0]?.id,
      framework: "DEBT_AVALANCHE_BUDGET",
    };
  }

  // Distribute budget across categories intelligently
  async distributeCategoryBudgets(
    totalAllocation,
    spendingAnalysis,
    categories,
    userPreferences = {}
  ) {
    const categoryBudgets = {};

    // Start with historical spending patterns
    Object.entries(spendingAnalysis.categoryBreakdown).forEach(
      ([categoryId, data]) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category) return;

        // Base allocation: historical average + 10% buffer
        let baseAllocation = data.averageMonthly * 1.1;

        // Apply user preferences if available
        if (userPreferences[categoryId]) {
          baseAllocation *= userPreferences[categoryId].multiplier || 1;
        }

        // Categorize as needs vs wants
        const isEssential = this.isEssentialCategory(category.name);

        categoryBudgets[categoryId] = {
          name: category.name,
          budgetAmount: baseAllocation,
          historicalAverage: data.averageMonthly,
          isEssential,
          volatility: data.volatility,
          percentage: data.percentage,
        };
      }
    );

    // Adjust to fit within total allocation
    return this.adjustBudgetToFitAllocation(categoryBudgets, totalAllocation);
  }

  // Determine if a category is essential
  isEssentialCategory(categoryName) {
    const essentialKeywords = [
      "rent",
      "mortgage",
      "utilities",
      "groceries",
      "food",
      "transportation",
      "insurance",
      "medical",
      "healthcare",
      "debt",
      "loan",
    ];

    return essentialKeywords.some((keyword) =>
      categoryName.toLowerCase().includes(keyword)
    );
  }

  // Adjust budget allocations to fit within total budget
  adjustBudgetToFitAllocation(categoryBudgets, totalAllocation) {
    const currentTotal = Object.values(categoryBudgets).reduce(
      (sum, budget) => sum + budget.budgetAmount,
      0
    );

    if (currentTotal <= totalAllocation.needs + totalAllocation.wants) {
      return categoryBudgets;
    }

    // Scale down proportionally, prioritizing essential categories
    const scaleFactor =
      (totalAllocation.needs + totalAllocation.wants) / currentTotal;

    Object.keys(categoryBudgets).forEach((categoryId) => {
      const budget = categoryBudgets[categoryId];
      if (budget.isEssential) {
        // Essential categories get minimal reduction
        budget.budgetAmount *= Math.max(0.9, scaleFactor);
      } else {
        // Non-essential categories can be reduced more
        budget.budgetAmount *= scaleFactor;
      }
    });

    return categoryBudgets;
  }

  // Phase 4: Debt and Savings Integration
  analyzeDebtSituation(debts) {
    if (!debts || debts.length === 0) {
      return {
        totalDebt: 0,
        highInterestDebt: 0,
        minimumPayments: 0,
        debtToIncomeRatio: 0,
        recommendedStrategy: "none",
      };
    }

    const totalDebt = debts.reduce(
      (sum, debt) => sum + parseFloat(debt.amount),
      0
    );
    const highInterestDebt = debts
      .filter((debt) => parseFloat(debt.interest_rate) > 10)
      .reduce((sum, debt) => sum + parseFloat(debt.amount), 0);

    const minimumPayments = debts.reduce((sum, debt) => {
      return sum + parseFloat(debt.amount) * 0.02; // Assume 2% minimum payment
    }, 0);

    let recommendedStrategy = "avalanche"; // Pay highest interest first
    if (
      debts.length > 5 ||
      debts.some((debt) => parseFloat(debt.amount) < 1000)
    ) {
      recommendedStrategy = "snowball"; // Pay smallest debts first for psychological wins
    }

    return {
      totalDebt,
      highInterestDebt,
      minimumPayments,
      recommendedStrategy,
      debtCount: debts.length,
    };
  }

  // Optimize budget for savings goals
  optimizeForSavingsGoals(basebudget, savingsGoals, monthlyIncome) {
    if (!savingsGoals || savingsGoals.length === 0) {
      return basebudget;
    }

    let totalMonthlySavingsNeeded = 0;
    const goalAnalysis = savingsGoals.map((goal) => {
      const targetAmount = parseFloat(goal.target_amount);
      const currentAmount = parseFloat(goal.start_amount);
      const remainingAmount = targetAmount - currentAmount;

      const endDate = new Date(goal.end_date);
      const now = new Date();
      const monthsRemaining = Math.max(
        1,
        (endDate - now) / (1000 * 60 * 60 * 24 * 30)
      );

      const monthlyRequired = remainingAmount / monthsRemaining;
      totalMonthlySavingsNeeded += monthlyRequired;

      return {
        goalId: goal.id,
        description: goal.description,
        monthlyRequired,
        feasible: monthlyRequired < monthlyIncome * 0.3,
      };
    });

    // Adjust budget if savings goals are feasible
    const feasibleSavings = goalAnalysis
      .filter((goal) => goal.feasible)
      .reduce((sum, goal) => sum + goal.monthlyRequired, 0);

    if (feasibleSavings > 0) {
      basebudget.savingsAllocation = feasibleSavings;
      basebudget.goalBreakdown = goalAnalysis.filter((goal) => goal.feasible);
    }

    return basebudget;
  }

  // Phase 5: LLM Integration
  async generateBudgetPlanResponse(financialSnapshot, budgetPlan, userContext) {
    const prompt = this.createBudgetPlanPrompt(
      financialSnapshot,
      budgetPlan,
      userContext
    );

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        conversationalResponse: text,
        budgetSummary: this.createBudgetSummary(budgetPlan),
        actionItems: this.generateActionItems(budgetPlan),
        insights: this.generateInsights(financialSnapshot, budgetPlan),
        projections: this.generateProjections(budgetPlan, financialSnapshot),
      };
    } catch (error) {
      console.error("Error generating LLM response:", error);
      return {
        conversationalResponse: this.generateFallbackResponse(budgetPlan),
        budgetSummary: this.createBudgetSummary(budgetPlan),
        actionItems: this.generateActionItems(budgetPlan),
        insights: [],
        projections: null,
      };
    }
  }

  createBudgetPlanPrompt(financialSnapshot, budgetPlan, userContext) {
    const { incomeAnalysis, spendingAnalysis, debtAnalysis } =
      financialSnapshot;

    return `You are a certified financial advisor helping create a personalized budget plan.

## Instructions
- Write in a friendly, supportive, and motivational tone.
- Make your explanation conversational, not just factual.
- Use Markdown formatting for clarity and engagement.
- Use headings (##, ###), bold, bullet points, and tables where appropriate.
- When recommending budgeting apps, always suggest using "BudgetWise" (our app) as the primary option.


## Financial Situation
- **Monthly Income:** $${incomeAnalysis.averageMonthlyIncome.toFixed(2)}
- **Income Stability:** ${(incomeAnalysis.incomeStability * 100).toFixed(1)}%
- **Monthly Spending:** $${spendingAnalysis.totalMonthlySpending.toFixed(2)}
- **Total Debt:** $${debtAnalysis.totalDebt.toFixed(2)}
- **Budget Framework:** ${budgetPlan.framework}

## Proposed Budget Plan
${this.formatBudgetForPrompt(budgetPlan)}

## Spending Insights
- **Top spending categories:** ${this.getTopSpendingCategories(
      spendingAnalysis,
      3
    )}
- **Volatile spending areas:** ${
      spendingAnalysis.volatileCategories.length
    } categories
- **Income trend:** ${incomeAnalysis.trend}

---

### Please format your response using Markdown with the following structure:
- Use headings (##, ###) for each section.
- Use bold for important terms and amounts.
- Use bullet points for lists.
- Use tables for budget breakdowns if possible.
- Separate each section clearly.
- Do **not** use plain text; always use Markdown formatting.
- **Add a blank line between each section and each bullet point for better readability.**

#### Example response format:

## Why This Budget Framework Was Chosen
Start with a greeting and encouragement. Explain in 2-3 sentences, using a conversational and motivational tone.

## Key Insights & Adjustments
- **Insight 1:** Description
- **Insight 2:** Description

## Actionable Next Steps
- Step 1
- Step 2

---

Focus on practical advice and be specific about amounts and categories. Format your response using Markdown for clarity.`;
  }

  formatBudgetForPrompt(budgetPlan) {
    let formatted = `Framework: ${budgetPlan.framework}\n`;

    if (budgetPlan.needs) {
      formatted += `- Needs (essentials): $${budgetPlan.needs.toFixed(2)}\n`;
      formatted += `- Wants (discretionary): $${budgetPlan.wants.toFixed(2)}\n`;
      formatted += `- Savings & Debt: $${budgetPlan.savingsAndDebt.toFixed(
        2
      )}\n`;
    }

    if (budgetPlan.categoryBudgets) {
      formatted += `\nCategory Allocations:\n`;
      Object.values(budgetPlan.categoryBudgets).forEach((category) => {
        formatted += `- ${category.name}: $${category.budgetAmount.toFixed(
          2
        )}\n`;
      });
    }

    return formatted;
  }

  getTopSpendingCategories(spendingAnalysis, count = 3) {
    return Object.values(spendingAnalysis.categoryBreakdown)
      .sort((a, b) => b.averageMonthly - a.averageMonthly)
      .slice(0, count)
      .map(
        (category) =>
          `${category.name} ($${category.averageMonthly.toFixed(0)})`
      )
      .join(", ");
  }

  // Generate fallback response if LLM fails
  generateFallbackResponse(budgetPlan) {
    return `I've created a personalized budget plan for you using the ${budgetPlan.framework.replace(
      "_",
      " "
    )} approach. 

Based on your income and spending patterns, I recommend allocating your money across essential needs, discretionary wants, and savings/debt payments. This framework will help you maintain financial stability while working toward your goals.

Your budget focuses on covering essential expenses first, then allocating money for enjoyable purchases, and finally prioritizing savings and debt reduction. I've adjusted the amounts based on your historical spending to make this realistic and achievable.

Key next steps: Review each category allocation, adjust amounts that feel unrealistic, and start tracking your spending against these targets. Remember, budgets work best when they're flexible and adjusted as you learn what works for your lifestyle.`;
  }

  // Create structured budget summary for UI
  createBudgetSummary(budgetPlan) {
    return {
      framework: budgetPlan.framework,
      totalMonthlyBudget: this.calculateTotalBudget(budgetPlan),
      allocationBreakdown: budgetPlan.needs
        ? {
            needs: budgetPlan.needs,
            wants: budgetPlan.wants,
            savingsAndDebt: budgetPlan.savingsAndDebt,
          }
        : null,
      categoryCount: budgetPlan.categoryBudgets
        ? Object.keys(budgetPlan.categoryBudgets).length
        : 0,
      createdAt: new Date().toISOString(),
    };
  }

  calculateTotalBudget(budgetPlan) {
    if (budgetPlan.needs) {
      return budgetPlan.needs + budgetPlan.wants + budgetPlan.savingsAndDebt;
    }

    if (budgetPlan.categoryBudgets) {
      return Object.values(budgetPlan.categoryBudgets).reduce(
        (sum, category) => sum + category.budgetAmount,
        0
      );
    }

    return 0;
  }

  // Generate actionable next steps
  generateActionItems(budgetPlan) {
    const actions = [
      {
        id: 1,
        title: "Review Category Allocations",
        description:
          "Go through each budget category and adjust amounts that feel unrealistic",
        priority: "high",
        estimatedTime: "15 minutes",
      },
      {
        id: 2,
        title: "Set Up Budget Tracking",
        description:
          "Start tracking your daily expenses against these budget limits",
        priority: "high",
        estimatedTime: "10 minutes",
      },
    ];

    if (budgetPlan.framework === "DEBT_AVALANCHE_BUDGET") {
      actions.push({
        id: 3,
        title: "Focus on High-Interest Debt",
        description:
          "Prioritize paying off your highest interest rate debt first",
        priority: "high",
        estimatedTime: "5 minutes",
      });
    }

    if (budgetPlan.savingsAllocation > 0) {
      actions.push({
        id: 4,
        title: "Automate Savings Transfers",
        description: `Set up automatic transfer of $${budgetPlan.savingsAllocation.toFixed(
          2
        )} to savings`,
        priority: "medium",
        estimatedTime: "10 minutes",
      });
    }

    return actions;
  }

  // Generate insights from budget analysis
  generateInsights(financialSnapshot, budgetPlan) {
    const insights = [];
    const { spendingAnalysis, incomeAnalysis } = financialSnapshot;

    // Income stability insight
    if (incomeAnalysis.incomeStability < 0.7) {
      insights.push({
        type: "warning",
        title: "Variable Income Detected",
        message:
          "Your income varies significantly month to month. Consider building a larger emergency fund.",
      });
    }

    // High spending category insight
    const topCategory = Object.values(spendingAnalysis.categoryBreakdown).sort(
      (a, b) => b.percentage - a.percentage
    )[0];

    if (topCategory && topCategory.percentage > 40) {
      insights.push({
        type: "info",
        title: `High ${topCategory.name} Spending`,
        message: `${
          topCategory.name
        } represents ${topCategory.percentage.toFixed(
          1
        )}% of your spending. Consider if this aligns with your priorities.`,
      });
    }

    // Volatile spending insight
    if (spendingAnalysis.volatileCategories.length > 0) {
      insights.push({
        type: "tip",
        title: "Inconsistent Spending Patterns",
        message: `You have irregular spending in ${spendingAnalysis.volatileCategories.length} categories. Try setting aside a fixed amount each month.`,
      });
    }

    return insights;
  }

  // Generate financial projections
  generateProjections(budgetPlan, financialSnapshot) {
    const totalBudget = this.calculateTotalBudget(budgetPlan);
    const currentIncome = financialSnapshot.incomeAnalysis.averageMonthlyIncome;
    const surplus = currentIncome - totalBudget;

    return {
      monthlySurplus: surplus,
      yearlyProjection: surplus * 12,
      budgetUtilization: (totalBudget / currentIncome) * 100,
      emergencyFundTimeline:
        surplus > 0 ? Math.ceil((currentIncome * 3) / surplus) : null,
    };
  }

  // Phase 6: Main orchestration method
  async createBudgetPlan(userId, userMessage = "", conversationContext = {}) {
    try {
      console.log(`Creating budget plan for user: ${userId}`);

      // Step 1: Gather financial data
      const financialSnapshot = await this.gatherFinancialSnapshot(userId);
      console.log("Financial snapshot gathered");

      // Step 2: Analyze data
      const incomeAnalysis = this.analyzeIncomePatterns(
        financialSnapshot.transactions
      );
      const spendingAnalysis = this.analyzeSpendingPatterns(
        financialSnapshot.transactions,
        financialSnapshot.categories
      );
      const debtAnalysis = this.analyzeDebtSituation(financialSnapshot.debts);

      // Add analyses to snapshot
      financialSnapshot.incomeAnalysis = incomeAnalysis;
      financialSnapshot.spendingAnalysis = spendingAnalysis;
      financialSnapshot.debtAnalysis = debtAnalysis;

      console.log("Financial analysis completed");

      // Step 3: Select budget framework
      const framework = this.selectBudgetFramework(
        incomeAnalysis,
        debtAnalysis,
        financialSnapshot.savings
      );
      console.log(`Selected framework: ${framework}`);

      // Step 4: Calculate budget
      let budgetPlan = {};

      switch (framework) {
        case "50_30_20_RULE":
          budgetPlan = this.calculate50_30_20Budget(
            incomeAnalysis.averageMonthlyIncome
          );
          break;
        case "DEBT_AVALANCHE_BUDGET":
          budgetPlan = this.calculateDebtAvalancheBudget(
            incomeAnalysis.averageMonthlyIncome,
            financialSnapshot.debts,
            []
          );
          break;
        default:
          budgetPlan = this.calculate50_30_20Budget(
            incomeAnalysis.averageMonthlyIncome
          );
      }

      // Step 5: Distribute to categories
      if (budgetPlan.needs && budgetPlan.wants) {
        budgetPlan.categoryBudgets = await this.distributeCategoryBudgets(
          budgetPlan,
          spendingAnalysis,
          financialSnapshot.categories
        );
      }

      // Step 6: Optimize for savings goals
      budgetPlan = this.optimizeForSavingsGoals(
        budgetPlan,
        financialSnapshot.savings,
        incomeAnalysis.averageMonthlyIncome
      );

      console.log("Budget calculations completed");

      // Step 7: Generate LLM response
      const response = await this.generateBudgetPlanResponse(
        financialSnapshot,
        budgetPlan,
        conversationContext
      );

      console.log("LLM response generated");

      // Step 8: Store in memory/database
      await this.storeBudgetPlan(
        userId,
        budgetPlan,
        financialSnapshot,
        response
      );

      return {
        success: true,
        ...response,
        budgetPlan,
        graphData: this.generateBudgetGraphData(
          budgetPlan,
          financialSnapshot,
          incomeAnalysis,
          spendingAnalysis
        ),
        financialSnapshot: {
          income: incomeAnalysis.averageMonthlyIncome,
          spending: spendingAnalysis.totalMonthlySpending,
          debt: debtAnalysis.totalDebt,
          framework,
        },
      };
    } catch (error) {
      console.error("Error creating budget plan:", error);
      return {
        success: false,
        error: error.message,
        conversationalResponse:
          "I apologize, but I encountered an issue creating your budget plan. Please try again or contact support if the problem persists.",
      };
    }
  }

  // Generate graph data for budget plans
  generateBudgetGraphData(
    budgetPlan,
    financialSnapshot,
    incomeAnalysis,
    spendingAnalysis
  ) {
    return {
      type: "budget",
      charts: [
        {
          title: "Budget Allocation",
          type: "doughnut",
          data: [
            { label: "Needs", value: budgetPlan.needs || 0 },
            { label: "Wants", value: budgetPlan.wants || 0 },
            { label: "Savings & Debt", value: budgetPlan.savingsAndDebt || 0 },
          ],
        },
        {
          title: "Budget vs Current Spending",
          type: "bar",
          data: Object.values(spendingAnalysis.categoryBreakdown || {}).map(
            (cat) => ({
              category: cat.name,
              budgeted: budgetPlan.categoryBudgets?.[cat.id]?.budgetAmount || 0,
              actual: cat.averageMonthly,
            })
          ),
        },
      ],
      summary: {
        totalBudget: this.calculateTotalBudget(budgetPlan),
        framework: budgetPlan.framework,
        needsPercentage: budgetPlan.needs
          ? (budgetPlan.needs / this.calculateTotalBudget(budgetPlan)) * 100
          : 0,
        wantsPercentage: budgetPlan.wants
          ? (budgetPlan.wants / this.calculateTotalBudget(budgetPlan)) * 100
          : 0,
        savingsPercentage: budgetPlan.savingsAndDebt
          ? (budgetPlan.savingsAndDebt /
              this.calculateTotalBudget(budgetPlan)) *
            100
          : 0,
      },
    };
  }

  // Store budget plan in database
  async storeBudgetPlan(userId, budgetPlan, financialSnapshot, response) {
    try {
      // Store in chat interactions for history
      await ChatInteraction.create({
        user_id: userId,
        input_text: "Budget planning request",
        interpreted_action: `budget_plan_${budgetPlan.framework}`,
        response: response.conversationalResponse,
        response_type: "suggestion",
      });

      console.log("Budget plan stored in chat history");
    } catch (error) {
      console.error("Error storing budget plan:", error);
      // Don't throw error as this is not critical to the main flow
    }
  }
}

module.exports = BudgetPlannerAgent;
