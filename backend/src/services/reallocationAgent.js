const { Op } = require("sequelize");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Category = require("../models/Category");
const Saving = require("../models/Saving");
const Debt = require("../models/Debt");
const Balance = require("../models/Balance");
const User = require("../models/User");
const AIBudgetPlan = require("../models/AIBudgetPlan");
const UserBudgetPreferences = require("../models/UserBudgetPreferences");
const { GoogleGenerativeAI } = require("@google/generative-ai");
class ReallocationAgent {
  constructor() {
    this.reallocationStrategies = {
      OVERSPENDING_ADJUSTMENT: "overspending_adjustment",
      UNDERUTILIZATION_OPTIMIZATION: "underutilization_optimization",
      GOAL_BASED_REALLOCATION: "goal_based_reallocation",
      SEASONAL_ADJUSTMENT: "seasonal_adjustment",
      EMERGENCY_REALLOCATION: "emergency_reallocation",
    };
    // Gemini LLM integration
    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch (e) {
      this.model = null;
    }
  }
  // Generate a conversational Markdown summary using Gemini LLM
  // Generate a conversational Markdown summary using LLM
  async generateReallocationLLMResponse(userId, reallocationResult) {
    if (!this.model) {
      return "Here's your budget reallocation plan.";
    }

    // Build prompt
    const plan = reallocationResult.plan;
    // console.log("Reallocation plan:", plan);
    const analysis = reallocationResult.analysis;
    // console.log("Reallocation analysis:", analysis);
    const projections = reallocationResult.projections;
    // console.log("Reallocation projections:", projections);
    const timeframe = reallocationResult.timeframe || "monthly";

    const prompt = `
You are a certified financial advisor. Below is a detailed analysis of the user's current budget, spending, detected reallocation opportunities, and recommendations.

## Context
${JSON.stringify(reallocationResult, null, 2)}

## Instructions
- Carefully review the context above.
- Suggest specific budget reallocations and adjustments for the user, using the detected opportunities and recommendations.
- If data is incomplete or confidence is low, still suggest at least one actionable reallocation based on available information, but note any caveats.
- For each suggestion, explain the reasoning and expected impact.
- Use Markdown formatting: headings, bold, bullet points, and tables where appropriate.
- Start with a brief summary of the user's situation.
- Then provide actionable recommendations, grouped by priority (immediate, next cycle).
- Include practical next steps and encouragement at the end.
- Do not simply repeat the context; use it to generate new, personalized advice.

## Example structure

### Situation Overview
Brief summary of key findings.

### Immediate Reallocation Recommendations
- **Category:** Suggestion and reasoning (expected impact)

### Next Cycle Recommendations
- **Category:** Suggestion and reasoning (expected impact)

### Insights & Projections
- Summarize key insights and financial projections.

### Next Steps & Encouragement
Friendly, motivational closing paragraph.

---

Now, generate the full Markdown report and advice for the user.
`;

    try {
      const result = await this.model.generateContent(prompt);
      return (
        result?.response?.text() || "Here's your budget reallocation plan."
      );
    } catch (e) {
      return "Here's your budget reallocation plan.";
    }
  }

  // Main entry point for budget reallocation analysis
  async analyzeAndRecommendReallocation(
    userId,
    timeframe = "monthly",
    targetGoals = []
  ) {
    try {
      console.log(`Starting reallocation analysis for user: ${userId}`);

      // Phase 1: Gather comprehensive financial data
      const financialData = await this.gatherReallocationData(
        userId,
        timeframe
      );

      // Phase 2: Analyze spending vs budget variances
      const varianceAnalysis = await this.analyzeSpendingVariances(
        financialData
      );

      // Phase 3: Identify reallocation opportunities
      const opportunities = await this.identifyReallocationOpportunities(
        varianceAnalysis,
        targetGoals
      );

      // Phase 4: Generate specific reallocation recommendations
      const recommendations = await this.generateReallocationRecommendations(
        opportunities,
        financialData
      );

      // Phase 5: Calculate impact projections
      const projections = await this.calculateReallocationImpact(
        recommendations,
        financialData
      );

      // Phase 6: Create actionable reallocation plan
      const plan = await this.createReallocationPlan(
        recommendations,
        projections
      );

      // Phase 7: Store reallocation results (optional, for tracking)
      await this.storeReallocationResults(userId, {
        analysis: varianceAnalysis,
        opportunities,
        recommendations,
        projections,
        plan,
      });

      return {
        success: true,
        analysis: varianceAnalysis,
        opportunities,
        recommendations,
        projections,
        plan,
        timeframe,
        analysisDate: new Date(),
      };
    } catch (error) {
      console.error("Error in reallocation analysis:", error);
      return {
        success: false,
        error: error.message,
        fallbackAdvice: this.generateFallbackReallocationAdvice(),
      };
    }
  }

  // Phase 1: Gather comprehensive data for reallocation analysis
  async gatherReallocationData(userId, timeframe) {
    const timeRanges = this.getTimeRanges(timeframe);

    const [
      currentBudgets,
      actualSpending,
      historicalSpending,
      categories,
      savings,
      debts,
      balance,
    ] = await Promise.all([
      // Current active budgets
      Budget.findAll({
        where: {
          user_id: userId,
          expired: false,
        },
      }),

      // Actual spending in current period
      Transaction.findAll({
        where: {
          user_id: userId,
          type: "expense",
          // date: {
          //   [Op.gte]: timeRanges.current.start,
          //   [Op.lte]: timeRanges.current.end
          // }
        },
      }),

      // Historical spending for comparison
      Transaction.findAll({
        where: {
          user_id: userId,
          type: "expense",
          // date: {
          //   [Op.gte]: timeRanges.historical.start,
          //   [Op.lte]: timeRanges.historical.end
          // }
        },
      }),

      Category.findAll({ where: { user_id: userId } }),
      Saving.findAll({ where: { user_id: userId } }),
      Debt.findAll({ where: { user_id: userId } }),
      Balance.findOne({ where: { user_id: userId } }),
    ]);

    return {
      currentBudgets,
      actualSpending,
      historicalSpending,
      categories,
      savings,
      debts,
      balance: balance || { balance: 0 },
      timeRanges,
    };
  }

  // Phase 2: Analyze spending vs budget variances
  async analyzeSpendingVariances(financialData) {
    const { currentBudgets, actualSpending, categories } = financialData;

    // Group actual spending by category
    const spendingByCategory = this.groupSpendingByCategory(actualSpending);

    // Create variance analysis for each budget category
    const categoryVariances = [];
    let totalBudgeted = 0;
    let totalSpent = 0;

    currentBudgets.forEach((budget) => {
      const categoryId = budget.category_id;
      const budgetAmount = parseFloat(budget.goal_amount);
      const actualAmount = spendingByCategory[categoryId] || 0;
      const variance = actualAmount - budgetAmount;
      const variancePercent =
        budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

      const category = categories.find((c) => c.id === categoryId);

      categoryVariances.push({
        categoryId,
        categoryName: category?.name || "Unknown",
        budgetAmount,
        actualAmount,
        variance,
        variancePercent,
        status: this.getVarianceStatus(variancePercent),
        severity: this.getVarianceSeverity(variancePercent, actualAmount),
      });

      totalBudgeted += budgetAmount;
      totalSpent += actualAmount;
    });

    // Analyze categories without budgets (untracked spending)
    const untrackedSpending = this.analyzeUntrackedSpending(
      spendingByCategory,
      currentBudgets,
      categories
    );

    return {
      categoryVariances: categoryVariances.sort(
        (a, b) => Math.abs(b.variance) - Math.abs(a.variance)
      ),
      totalBudgeted,
      totalSpent,
      totalVariance: totalSpent - totalBudgeted,
      totalVariancePercent:
        totalBudgeted > 0
          ? ((totalSpent - totalBudgeted) / totalBudgeted) * 100
          : 0,
      untrackedSpending,
      overspendingCategories: categoryVariances.filter((v) => v.variance > 0),
      underspendingCategories: categoryVariances.filter((v) => v.variance < 0),
      highVarianceCategories: categoryVariances.filter(
        (v) => Math.abs(v.variancePercent) > 20
      ),
    };
  }

  // Phase 3: Identify reallocation opportunities
  async identifyReallocationOpportunities(varianceAnalysis, targetGoals) {
    const opportunities = [];

    // 1. Overspending Adjustment Opportunities
    varianceAnalysis.overspendingCategories.forEach((category) => {
      if (category.variancePercent > 15) {
        opportunities.push({
          type: this.reallocationStrategies.OVERSPENDING_ADJUSTMENT,
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          currentBudget: category.budgetAmount,
          suggestedBudget: category.actualAmount * 1.1, // 10% buffer
          reason: `Consistently overspending by ${category.variancePercent.toFixed(
            1
          )}%`,
          priority: category.severity,
          impact: "high",
        });
      }
    });

    // 2. Underutilization Optimization Opportunities
    varianceAnalysis.underspendingCategories.forEach((category) => {
      if (category.variancePercent < -25 && category.actualAmount > 0) {
        opportunities.push({
          type: this.reallocationStrategies.UNDERUTILIZATION_OPTIMIZATION,
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          currentBudget: category.budgetAmount,
          suggestedBudget: category.actualAmount * 1.05, // Small buffer
          availableReallocation: Math.abs(category.variance) * 0.8, // 80% can be reallocated
          reason: `Underutilizing budget by ${Math.abs(
            category.variancePercent
          ).toFixed(1)}%`,
          priority: "medium",
          impact: "medium",
        });
      }
    });

    // 3. Goal-Based Reallocation Opportunities
    if (targetGoals.length > 0) {
      const goalOpportunities = this.identifyGoalBasedOpportunities(
        varianceAnalysis,
        targetGoals
      );
      opportunities.push(...goalOpportunities);
    }

    // 4. Untracked Spending Opportunities
    if (varianceAnalysis.untrackedSpending.total > 100) {
      opportunities.push({
        type: "UNTRACKED_SPENDING_ALLOCATION",
        reason: "Significant spending in unbudgeted categories",
        untrackedAmount: varianceAnalysis.untrackedSpending.total,
        suggestedCategories:
          varianceAnalysis.untrackedSpending.categories.slice(0, 3),
        priority: "high",
        impact: "high",
      });
    }

    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Phase 4: Generate specific reallocation recommendations
  async generateReallocationRecommendations(opportunities, financialData) {
    const recommendations = [];
    let totalReallocation = 0;

    opportunities.forEach((opportunity) => {
      switch (opportunity.type) {
        case this.reallocationStrategies.OVERSPENDING_ADJUSTMENT:
          recommendations.push({
            id: `realloc_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            type: opportunity.type,
            title: `Increase ${opportunity.categoryName} Budget`,
            description: `Increase budget from $${opportunity.currentBudget.toFixed(
              0
            )} to $${opportunity.suggestedBudget.toFixed(0)}`,
            fromCategories: this.findReallocationSources(
              opportunity.suggestedBudget - opportunity.currentBudget,
              financialData
            ),
            toCategory: {
              id: opportunity.categoryId,
              name: opportunity.categoryName,
              currentBudget: opportunity.currentBudget,
              newBudget: opportunity.suggestedBudget,
            },
            amount: opportunity.suggestedBudget - opportunity.currentBudget,
            reason: opportunity.reason,
            priority: opportunity.priority,
            expectedImpact: this.calculateExpectedImpact(opportunity),
            timeline: "immediate",
          });
          break;

        case this.reallocationStrategies.UNDERUTILIZATION_OPTIMIZATION:
          recommendations.push({
            id: `realloc_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            type: opportunity.type,
            title: `Reallocate from ${opportunity.categoryName}`,
            description: `Reduce budget from $${opportunity.currentBudget.toFixed(
              0
            )} to $${opportunity.suggestedBudget.toFixed(0)}`,
            fromCategory: {
              id: opportunity.categoryId,
              name: opportunity.categoryName,
              currentBudget: opportunity.currentBudget,
              newBudget: opportunity.suggestedBudget,
            },
            availableAmount: opportunity.availableReallocation,
            suggestedTargets: this.suggestReallocationTargets(
              opportunity.availableReallocation,
              financialData
            ),
            reason: opportunity.reason,
            priority: opportunity.priority,
            expectedImpact: this.calculateExpectedImpact(opportunity),
            timeline: "next_cycle",
          });
          break;
      }

      totalReallocation += opportunity.suggestedBudget
        ? Math.abs(opportunity.suggestedBudget - opportunity.currentBudget)
        : 0;
    });

    return {
      recommendations,
      totalReallocationAmount: totalReallocation,
      recommendationCount: recommendations.length,
      estimatedTimeToImplement:
        this.estimateImplementationTime(recommendations),
    };
  }

  // Phase 5: Calculate reallocation impact projections
  async calculateReallocationImpact(recommendations, financialData) {
    const { recommendations: reallocs } = recommendations;

    let budgetEfficiencyImprovement = 0;
    let overspendingReduction = 0;
    let availableFundsIncrease = 0;
    let riskReduction = 0;

    reallocs.forEach((rec) => {
      switch (rec.type) {
        case this.reallocationStrategies.OVERSPENDING_ADJUSTMENT:
          overspendingReduction += rec.amount * 0.8; // 80% reduction in overspending
          budgetEfficiencyImprovement += 0.15; // 15% efficiency gain per adjustment
          break;

        case this.reallocationStrategies.UNDERUTILIZATION_OPTIMIZATION:
          availableFundsIncrease += rec.availableAmount;
          budgetEfficiencyImprovement += 0.1; // 10% efficiency gain
          break;
      }
    });

    return {
      budgetEfficiencyImprovement: Math.min(budgetEfficiencyImprovement, 0.5), // Cap at 50%
      overspendingReduction,
      availableFundsIncrease,
      projectedMonthlySavings:
        overspendingReduction + availableFundsIncrease * 0.7,
      riskReduction: this.calculateRiskReduction(reallocs),
      timeToStability: this.estimateStabilityTime(reallocs),
      confidenceScore: this.calculateConfidenceScore(reallocs, financialData),
    };
  }

  // Phase 6: Create actionable reallocation plan
  async createReallocationPlan(recommendations, projections) {
    const { recommendations: reallocs } = recommendations;

    // Group recommendations by priority and timeline
    const immediateActions = reallocs.filter((r) => r.timeline === "immediate");
    const nextCycleActions = reallocs.filter(
      (r) => r.timeline === "next_cycle"
    );

    const plan = {
      immediate: {
        title: "Immediate Budget Adjustments",
        actions: immediateActions.map((action) => ({
          id: action.id,
          description: action.description,
          amount: action.amount,
          priority: action.priority,
          steps: this.generateActionSteps(action),
        })),
        totalImpact: immediateActions.reduce(
          (sum, a) => sum + (a.amount || 0),
          0
        ),
      },

      nextCycle: {
        title: "Next Period Optimizations",
        actions: nextCycleActions.map((action) => ({
          id: action.id,
          description: action.description,
          amount: action.availableAmount || action.amount,
          priority: action.priority,
          steps: this.generateActionSteps(action),
        })),
        totalImpact: nextCycleActions.reduce(
          (sum, a) => sum + (a.availableAmount || a.amount || 0),
          0
        ),
      },

      summary: {
        totalRecommendations: reallocs.length,
        estimatedMonthlySavings: projections.projectedMonthlySavings,
        implementationTime: recommendations.estimatedTimeToImplement,
        confidenceLevel:
          projections.confidenceScore > 0.8
            ? "high"
            : projections.confidenceScore > 0.6
            ? "medium"
            : "low",
      },
    };

    return plan;
  }

  // Helper Methods
  getTimeRanges(timeframe) {
    const now = new Date();
    const ranges = {};

    switch (timeframe) {
      case "monthly":
        ranges.current = {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
        ranges.historical = {
          start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0),
        };
        break;

      case "weekly":
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        ranges.current = {
          start: weekStart,
          end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
        };
        ranges.historical = {
          start: new Date(weekStart.getTime() - 12 * 7 * 24 * 60 * 60 * 1000),
          end: weekStart,
        };
        break;

      default:
        ranges.current = {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
        ranges.historical = {
          start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0),
        };
    }

    return ranges;
  }

  groupSpendingByCategory(transactions) {
    const spending = {};

    transactions.forEach((transaction) => {
      const categoryId = transaction.category_id || "uncategorized";
      const amount = Math.abs(parseFloat(transaction.amount));

      if (!spending[categoryId]) {
        spending[categoryId] = 0;
      }
      spending[categoryId] += amount;
    });

    return spending;
  }

  getVarianceStatus(variancePercent) {
    if (variancePercent > 20) return "significant_overspending";
    if (variancePercent > 10) return "moderate_overspending";
    if (variancePercent > -10) return "on_track";
    if (variancePercent > -25) return "moderate_underspending";
    return "significant_underspending";
  }

  getVarianceSeverity(variancePercent, amount) {
    if (Math.abs(variancePercent) > 50 || amount > 500) return "high";
    if (Math.abs(variancePercent) > 25 || amount > 200) return "medium";
    return "low";
  }

  analyzeUntrackedSpending(spendingByCategory, budgets, categories) {
    const budgetedCategories = new Set(budgets.map((b) => b.category_id));
    const untracked = [];
    let total = 0;

    Object.entries(spendingByCategory).forEach(([categoryId, amount]) => {
      if (
        !budgetedCategories.has(categoryId) &&
        categoryId !== "uncategorized"
      ) {
        const category = categories.find((c) => c.id === categoryId);
        untracked.push({
          categoryId,
          categoryName: category?.name || "Unknown",
          amount,
        });
        total += amount;
      }
    });

    return {
      categories: untracked.sort((a, b) => b.amount - a.amount),
      total,
      count: untracked.length,
    };
  }

  identifyGoalBasedOpportunities(varianceAnalysis, targetGoals) {
    // Implementation for goal-based opportunities
    return targetGoals.map((goal) => ({
      type: this.reallocationStrategies.GOAL_BASED_REALLOCATION,
      goal,
      requiredReallocation: goal.monthlyRequirement,
      priority: goal.priority || "medium",
      impact: "high",
    }));
  }

  findReallocationSources(neededAmount, financialData) {
    const sources = [];
    let remaining = neededAmount;

    // Find categories with underspending that can contribute
    financialData.currentBudgets.forEach((budget) => {
      const categoryId = budget.category_id;
      const spending = financialData.actualSpending
        .filter((t) => t.category_id === categoryId)
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

      const available = parseFloat(budget.goal_amount) - spending;

      if (available > 50 && remaining > 0) {
        const contribution = Math.min(available * 0.5, remaining); // Take max 50% of available
        sources.push({
          categoryId,
          categoryName: budget.Category?.name || "Unknown",
          availableAmount: available,
          contributionAmount: contribution,
        });
        remaining -= contribution;
      }
    });

    return sources;
  }

  suggestReallocationTargets(availableAmount, financialData) {
    // Suggest where to reallocate freed up funds
    const targets = [
      {
        type: "emergency_fund",
        priority: "high",
        suggestedAmount: availableAmount * 0.4,
      },
      {
        type: "debt_payment",
        priority: "high",
        suggestedAmount: availableAmount * 0.3,
      },
      {
        type: "savings_goal",
        priority: "medium",
        suggestedAmount: availableAmount * 0.3,
      },
    ];

    return targets;
  }

  calculateExpectedImpact(opportunity) {
    // Calculate the expected positive impact of this reallocation
    return {
      budgetAccuracy:
        opportunity.type === this.reallocationStrategies.OVERSPENDING_ADJUSTMENT
          ? 0.25
          : 0.15,
      stressReduction: opportunity.priority === "high" ? 0.3 : 0.2,
      financialStability: 0.2,
    };
  }

  estimateImplementationTime(recommendations) {
    const baseTime = 15; // 15 minutes base
    const perRecommendation = 10; // 10 minutes per recommendation
    return baseTime + recommendations.length * perRecommendation;
  }

  calculateRiskReduction(recommendations) {
    return recommendations.reduce((total, rec) => {
      if (rec.priority === "high") return total + 0.3;
      if (rec.priority === "medium") return total + 0.2;
      return total + 0.1;
    }, 0);
  }

  estimateStabilityTime(recommendations) {
    const highPriorityCount = recommendations.filter(
      (r) => r.priority === "high"
    ).length;
    return highPriorityCount > 3 ? "2-3 months" : "1-2 months";
  }

  calculateConfidenceScore(recommendations, financialData) {
    // Base confidence on data quality and recommendation complexity
    const dataQuality = financialData.actualSpending.length > 10 ? 0.8 : 0.6;
    const complexityPenalty = recommendations.length > 5 ? 0.1 : 0;
    return Math.max(0.5, dataQuality - complexityPenalty);
  }

  generateActionSteps(action) {
    const baseSteps = [
      "Review current budget allocation",
      "Analyze spending patterns",
      "Implement budget changes",
    ];

    if (action.type === this.reallocationStrategies.OVERSPENDING_ADJUSTMENT) {
      return [
        `Review ${action.toCategory.name} spending patterns`,
        `Identify sources for additional $${action.amount.toFixed(0)}`,
        `Update budget allocation for ${action.toCategory.name}`,
        "Monitor spending for next 2 weeks",
      ];
    }

    return baseSteps;
  }

  generateFallbackReallocationAdvice() {
    return {
      message: "Unable to perform detailed reallocation analysis",
      basicAdvice: [
        "Review categories where you consistently overspend",
        "Look for unused budget allocations that can be reallocated",
        "Consider seasonal spending patterns when adjusting budgets",
        "Prioritize essential categories over discretionary ones",
      ],
    };
  }

  // Store reallocation results for tracking and learning
  async storeReallocationResults(userId, results) {
    try {
      // Store as a budget plan record for tracking
      const reallocationRecord = await AIBudgetPlan.create({
        user_id: userId,
        framework_type: "BUDGET_REALLOCATION",
        monthly_income: results.analysis.totalBudgeted || 0,
        category_allocations: {
          originalAllocations: results.analysis.categoryVariances,
          recommendations: results.recommendations.recommendations,
          opportunities: results.opportunities,
        },
        total_needs: results.projections.projectedMonthlySavings || 0,
        total_wants: 0,
        total_savings_debt: results.projections.availableFundsIncrease || 0,
        confidence_score: results.projections.confidenceScore || 0.5,
        status: "active",
        user_feedback: {
          reallocationAnalysis: results.analysis,
          implementationPlan: results.plan,
        },
      });

      console.log(
        `Stored reallocation results for user ${userId}: ${reallocationRecord.id}`
      );
      return reallocationRecord;
    } catch (error) {
      console.error("Error storing reallocation results:", error);
      // Don't throw error - this is optional storage
      return null;
    }
  }
}

module.exports = ReallocationAgent;
