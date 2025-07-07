const ReallocationAgent = require('../services/reallocationAgent');
const { Transaction, Budget, Category, Saving, Debt, Balance, User } = require('../models');

// Mock the models
jest.mock('../models', () => ({
  Transaction: {
    findAll: jest.fn()
  },
  Budget: {
    findAll: jest.fn()
  },
  Category: {
    findAll: jest.fn()
  },
  Saving: {
    findAll: jest.fn()
  },
  Debt: {
    findAll: jest.fn()
  },
  Balance: {
    findOne: jest.fn()
  },
  User: {
    findOne: jest.fn()
  }
}));

describe('ReallocationAgent', () => {
  let reallocationAgent;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    reallocationAgent = new ReallocationAgent();
    jest.clearAllMocks();
  });

  describe('analyzeAndRecommendReallocation', () => {
    beforeEach(() => {
      // Mock data setup
      const mockCategories = [
        { id: 'cat1', name: 'Groceries' },
        { id: 'cat2', name: 'Entertainment' },
        { id: 'cat3', name: 'Transportation' },
        { id: 'cat4', name: 'Utilities' }
      ];

      const mockBudgets = [
        { category_id: 'cat1', goal_amount: 500 },
        { category_id: 'cat2', goal_amount: 200 },
        { category_id: 'cat3', goal_amount: 300 },
        { category_id: 'cat4', goal_amount: 150 }
      ];

      const mockTransactions = [
        // Overspending in groceries
        { category_id: 'cat1', amount: 180, type: 'expense', date: '2024-01-15' },
        { category_id: 'cat1', amount: 220, type: 'expense', date: '2024-01-20' },
        { category_id: 'cat1', amount: 200, type: 'expense', date: '2024-01-25' },
        
        // Underspending in entertainment
        { category_id: 'cat2', amount: 50, type: 'expense', date: '2024-01-10' },
        { category_id: 'cat2', amount: 30, type: 'expense', date: '2024-01-15' },
        
        // Normal spending in transportation
        { category_id: 'cat3', amount: 150, type: 'expense', date: '2024-01-12' },
        { category_id: 'cat3', amount: 140, type: 'expense', date: '2024-01-28' },
        
        // Unbudgeted spending
        { category_id: 'cat5', amount: 100, type: 'expense', date: '2024-01-16' }
      ];

      Category.findAll.mockResolvedValue(mockCategories);
      Budget.findAll.mockResolvedValue(mockBudgets);
      Transaction.findAll.mockResolvedValue(mockTransactions);
      Saving.findAll.mockResolvedValue([]);
      Debt.findAll.mockResolvedValue([]);
      Balance.findOne.mockResolvedValue({ balance: 5000 });
    });

    it('should successfully analyze and recommend budget reallocations', async () => {
      const result = await reallocationAgent.analyzeAndRecommendReallocation(mockUserId);

      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.opportunities).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.projections).toBeDefined();
      expect(result.plan).toBeDefined();
    });

    it('should identify overspending categories', async () => {
      const result = await reallocationAgent.analyzeAndRecommendReallocation(mockUserId);

      expect(result.analysis.overspendingCategories).toHaveLength(1);
      expect(result.analysis.overspendingCategories[0].categoryId).toBe('cat1');
      expect(result.analysis.overspendingCategories[0].variance).toBeGreaterThan(0);
    });

    it('should identify underspending categories', async () => {
      const result = await reallocationAgent.analyzeAndRecommendReallocation(mockUserId);

      expect(result.analysis.underspendingCategories).toHaveLength(2);
      expect(result.analysis.underspendingCategories.some(cat => cat.categoryId === 'cat2')).toBe(true);
    });

    it('should generate reallocation opportunities', async () => {
      const result = await reallocationAgent.analyzeAndRecommendReallocation(mockUserId);

      expect(result.opportunities.length).toBeGreaterThan(0);
      
      const overspendingOpportunity = result.opportunities.find(
        opp => opp.type === 'overspending_adjustment'
      );
      expect(overspendingOpportunity).toBeDefined();
      expect(overspendingOpportunity.categoryId).toBe('cat1');
    });

    it('should generate actionable recommendations', async () => {
      const result = await reallocationAgent.analyzeAndRecommendReallocation(mockUserId);

      expect(result.recommendations.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.totalReallocationAmount).toBeGreaterThan(0);
      
      const recommendation = result.recommendations.recommendations[0];
      expect(recommendation).toHaveProperty('id');
      expect(recommendation).toHaveProperty('type');
      expect(recommendation).toHaveProperty('title');
      expect(recommendation).toHaveProperty('description');
      expect(recommendation).toHaveProperty('priority');
    });

    it('should calculate impact projections', async () => {
      const result = await reallocationAgent.analyzeAndRecommendReallocation(mockUserId);

      expect(result.projections).toHaveProperty('budgetEfficiencyImprovement');
      expect(result.projections).toHaveProperty('overspendingReduction');
      expect(result.projections).toHaveProperty('projectedMonthlySavings');
      expect(result.projections).toHaveProperty('confidenceScore');
      
      expect(result.projections.budgetEfficiencyImprovement).toBeGreaterThanOrEqual(0);
      expect(result.projections.projectedMonthlySavings).toBeGreaterThanOrEqual(0);
    });

    it('should create an actionable reallocation plan', async () => {
      const result = await reallocationAgent.analyzeAndRecommendReallocation(mockUserId);

      expect(result.plan).toHaveProperty('immediate');
      expect(result.plan).toHaveProperty('nextCycle');
      expect(result.plan).toHaveProperty('summary');
      
      expect(result.plan.immediate).toHaveProperty('title');
      expect(result.plan.immediate).toHaveProperty('actions');
      expect(result.plan.nextCycle).toHaveProperty('title');
      expect(result.plan.nextCycle).toHaveProperty('actions');
      
      expect(result.plan.summary).toHaveProperty('totalRecommendations');
      expect(result.plan.summary).toHaveProperty('estimatedMonthlySavings');
      expect(result.plan.summary).toHaveProperty('confidenceLevel');
    });

    it('should handle goal-based reallocation requests', async () => {
      const targetGoals = [
        { type: 'emergency_fund', priority: 'high', monthlyRequirement: 200 },
        { type: 'debt_payoff', priority: 'high', monthlyRequirement: 300 }
      ];

      const result = await reallocationAgent.analyzeAndRecommendReallocation(
        mockUserId, 
        'monthly', 
        targetGoals
      );

      expect(result.success).toBe(true);
      
      const goalOpportunities = result.opportunities.filter(
        opp => opp.type === 'goal_based_reallocation'
      );
      expect(goalOpportunities.length).toBeGreaterThan(0);
    });
  });

  describe('gatherReallocationData', () => {
    it('should gather comprehensive financial data', async () => {
      // Mock data
      Category.findAll.mockResolvedValue([{ id: 'cat1', name: 'Test' }]);
      Budget.findAll.mockResolvedValue([{ category_id: 'cat1', goal_amount: 500 }]);
      Transaction.findAll.mockResolvedValue([{ category_id: 'cat1', amount: 100 }]);
      Saving.findAll.mockResolvedValue([]);
      Debt.findAll.mockResolvedValue([]);
      Balance.findOne.mockResolvedValue({ balance: 1000 });

      const result = await reallocationAgent.gatherReallocationData(mockUserId, 'monthly');

      expect(result).toHaveProperty('currentBudgets');
      expect(result).toHaveProperty('actualSpending');
      expect(result).toHaveProperty('historicalSpending');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('savings');
      expect(result).toHaveProperty('debts');
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('timeRanges');

      expect(Budget.findAll).toHaveBeenCalledWith({
        where: { 
          user_id: mockUserId,
          expired: false
        },
        include: [{ model: Category }]
      });
    });
  });

  describe('analyzeSpendingVariances', () => {
    it('should calculate variance analysis correctly', async () => {
      const financialData = {
        currentBudgets: [
          { category_id: 'cat1', goal_amount: 500 },
          { category_id: 'cat2', goal_amount: 200 }
        ],
        actualSpending: [
          { category_id: 'cat1', amount: 600 }, // Overspending
          { category_id: 'cat2', amount: 100 }  // Underspending
        ],
        categories: [
          { id: 'cat1', name: 'Groceries' },
          { id: 'cat2', name: 'Entertainment' }
        ]
      };

      const result = await reallocationAgent.analyzeSpendingVariances(financialData);

      expect(result.totalBudgeted).toBe(700);
      expect(result.totalSpent).toBe(700);
      expect(result.categoryVariances).toHaveLength(2);
      
      const groceriesVariance = result.categoryVariances.find(v => v.categoryId === 'cat1');
      expect(groceriesVariance.variance).toBe(100); // 600 - 500
      expect(groceriesVariance.variancePercent).toBe(20); // (100/500) * 100
      
      const entertainmentVariance = result.categoryVariances.find(v => v.categoryId === 'cat2');
      expect(entertainmentVariance.variance).toBe(-100); // 100 - 200
      expect(entertainmentVariance.variancePercent).toBe(-50); // (-100/200) * 100

      expect(result.overspendingCategories).toHaveLength(1);
      expect(result.underspendingCategories).toHaveLength(1);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      Budget.findAll.mockRejectedValue(new Error('Database connection failed'));

      const result = await reallocationAgent.analyzeAndRecommendReallocation(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.fallbackAdvice).toBeDefined();
      expect(result.fallbackAdvice.basicAdvice).toBeInstanceOf(Array);
    });

    it('should handle missing data gracefully', async () => {
      // Mock empty data
      Category.findAll.mockResolvedValue([]);
      Budget.findAll.mockResolvedValue([]);
      Transaction.findAll.mockResolvedValue([]);
      Saving.findAll.mockResolvedValue([]);
      Debt.findAll.mockResolvedValue([]);
      Balance.findOne.mockResolvedValue(null);

      const result = await reallocationAgent.analyzeAndRecommendReallocation(mockUserId);

      expect(result.success).toBe(true);
      expect(result.analysis.categoryVariances).toHaveLength(0);
      expect(result.opportunities).toHaveLength(0);
    });
  });

  describe('Helper methods', () => {
    it('should determine variance status correctly', () => {
      expect(reallocationAgent.getVarianceStatus(25)).toBe('significant_overspending');
      expect(reallocationAgent.getVarianceStatus(15)).toBe('moderate_overspending');
      expect(reallocationAgent.getVarianceStatus(5)).toBe('on_track');
      expect(reallocationAgent.getVarianceStatus(-15)).toBe('moderate_underspending');
      expect(reallocationAgent.getVarianceStatus(-30)).toBe('significant_underspending');
    });

    it('should calculate variance severity correctly', () => {
      expect(reallocationAgent.getVarianceSeverity(60, 600)).toBe('high');
      expect(reallocationAgent.getVarianceSeverity(30, 300)).toBe('medium');
      expect(reallocationAgent.getVarianceSeverity(10, 100)).toBe('low');
    });

    it('should group spending by category correctly', () => {
      const transactions = [
        { category_id: 'cat1', amount: 100 },
        { category_id: 'cat1', amount: 150 },
        { category_id: 'cat2', amount: 200 }
      ];

      const result = reallocationAgent.groupSpendingByCategory(transactions);

      expect(result).toEqual({
        cat1: 250,
        cat2: 200
      });
    });

    it('should generate time ranges correctly', () => {
      const monthlyRanges = reallocationAgent.getTimeRanges('monthly');
      
      expect(monthlyRanges).toHaveProperty('current');
      expect(monthlyRanges).toHaveProperty('historical');
      expect(monthlyRanges.current).toHaveProperty('start');
      expect(monthlyRanges.current).toHaveProperty('end');
      expect(monthlyRanges.historical).toHaveProperty('start');
      expect(monthlyRanges.historical).toHaveProperty('end');
    });
  });

  describe('Integration with conversation context', () => {
    it('should handle timeframe extraction from user message', async () => {
      const weeklyResult = await reallocationAgent.analyzeAndRecommendReallocation(
        mockUserId, 
        'weekly'
      );
      
      expect(weeklyResult.timeframe).toBe('weekly');
    });

    it('should process target goals for reallocation', async () => {
      const goals = [
        { type: 'emergency_fund', priority: 'high' },
        { type: 'debt_payoff', priority: 'medium' }
      ];

      Category.findAll.mockResolvedValue([]);
      Budget.findAll.mockResolvedValue([]);
      Transaction.findAll.mockResolvedValue([]);
      Saving.findAll.mockResolvedValue([]);
      Debt.findAll.mockResolvedValue([]);
      Balance.findOne.mockResolvedValue({ balance: 1000 });

      const result = await reallocationAgent.analyzeAndRecommendReallocation(
        mockUserId, 
        'monthly', 
        goals
      );

      expect(result.success).toBe(true);
      
      const goalOpportunities = result.opportunities.filter(
        opp => opp.type === 'goal_based_reallocation'
      );
      expect(goalOpportunities.length).toBe(goals.length);
    });
  });
}); 