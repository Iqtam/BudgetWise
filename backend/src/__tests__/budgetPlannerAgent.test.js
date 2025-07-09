const BudgetPlannerAgent = require('../services/budgetPlannerAgent');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Balance = require('../models/Balance');
const Debt = require('../models/Debt');
const Saving = require('../models/Saving');
const Category = require('../models/Category');

// Mock all database models
jest.mock('../models/Transaction');
jest.mock('../models/Budget');
jest.mock('../models/Balance');
jest.mock('../models/Debt');
jest.mock('../models/Saving');
jest.mock('../models/Category');
jest.mock('../models/User');
jest.mock('../models/ChatInteraction');

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn()
    })
  }))
}));

describe('BudgetPlannerAgent', () => {
  let budgetPlannerAgent;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    budgetPlannerAgent = new BudgetPlannerAgent();
    jest.clearAllMocks();
  });

  describe('gatherFinancialSnapshot', () => {
    it('should gather complete financial data for user', async () => {
      // Mock data
      const mockTransactions = [
        { id: '1', type: 'income', amount: 5000, date: new Date('2024-01-15') },
        { id: '2', type: 'expense', amount: 1500, date: new Date('2024-01-20') }
      ];
      const mockBudgets = [{ id: '1', goal_amount: 2000, spent: 1500 }];
      const mockBalance = { balance: 10000 };
      const mockDebts = [{ id: '1', amount: 5000, interest_rate: 18.5 }];
      const mockSavings = [{ id: '1', target_amount: 10000, start_amount: 2000 }];
      const mockCategories = [{ id: '1', name: 'Food', type: 'expense' }];

      // Setup mocks
      Transaction.findAll.mockResolvedValue(mockTransactions);
      Budget.findAll.mockResolvedValue(mockBudgets);
      Balance.findOne.mockResolvedValue(mockBalance);
      Debt.findAll.mockResolvedValue(mockDebts);
      Saving.findAll.mockResolvedValue(mockSavings);
      Category.findAll.mockResolvedValue(mockCategories);

      const result = await budgetPlannerAgent.gatherFinancialSnapshot(mockUserId);

      expect(result).toHaveProperty('transactions', mockTransactions);
      expect(result).toHaveProperty('currentBudgets', mockBudgets);
      expect(result).toHaveProperty('balance', mockBalance);
      expect(result).toHaveProperty('debts', mockDebts);
      expect(result).toHaveProperty('savings', mockSavings);
      expect(result).toHaveProperty('categories', mockCategories);
      expect(result).toHaveProperty('snapshotDate');
    });

    it('should handle missing balance record', async () => {
      Transaction.findAll.mockResolvedValue([]);
      Budget.findAll.mockResolvedValue([]);
      Balance.findOne.mockResolvedValue(null);
      Debt.findAll.mockResolvedValue([]);
      Saving.findAll.mockResolvedValue([]);
      Category.findAll.mockResolvedValue([]);

      const result = await budgetPlannerAgent.gatherFinancialSnapshot(mockUserId);

      expect(result.balance).toEqual({ balance: 0 });
    });
  });

  // describe('analyzeIncomePatterns', () => {
  //   it('should analyze income patterns correctly', () => {
  //     const mockTransactions = [
  //       { type: 'income', amount: 5000, date: new Date('2024-01-15'), description: 'Salary' },
  //       { type: 'income', amount: 5000, date: new Date('2024-02-15'), description: 'Salary' },
  //       { type: 'income', amount: 5000, date: new Date('2024-03-15'), description: 'Salary' },
  //       { type: 'expense', amount: 1500, date: new Date('2024-01-20'), description: 'Groceries' }
  //     ];

  //     const result = budgetPlannerAgent.analyzeIncomePatterns(mockTransactions);

  //     expect(result).toHaveProperty('averageMonthlyIncome');
  //     expect(result).toHaveProperty('incomeStability');
  //     expect(result).toHaveProperty('trend');
  //     expect(result).toHaveProperty('recurringIncome');
  //     expect(result.averageMonthlyIncome).toBe(5000);
  //     expect(result.incomeStability).toBeGreaterThan(0.9); // Very stable income
  //     expect(result.trend).toBe('stable');
  //   });

  //   it('should handle no income transactions', () => {
  //     const mockTransactions = [
  //       { type: 'expense', amount: 1500, date: new Date('2024-01-20'), description: 'Groceries' }
  //     ];

  //     const result = budgetPlannerAgent.analyzeIncomePatterns(mockTransactions);

  //     expect(result.averageMonthlyIncome).toBe(0);
  //     expect(result.incomeStability).toBe(0);
  //     expect(result.trend).toBe('unknown');
  //   });

  //   it('should detect income trends', () => {
  //     const mockTransactions = [
  //       { type: 'income', amount: 3000, date: new Date('2024-01-15'), description: 'Salary' },
  //       { type: 'income', amount: 4000, date: new Date('2024-02-15'), description: 'Salary' },
  //       { type: 'income', amount: 5000, date: new Date('2024-03-15'), description: 'Salary' }
  //     ];

  //     const result = budgetPlannerAgent.analyzeIncomePatterns(mockTransactions);

  //     expect(result.trend).toBe('increasing');
  //   });
  // });

  // describe('analyzeSpendingPatterns', () => {
  //   it('should analyze spending patterns by category', () => {
  //     const mockTransactions = [
  //       { type: 'expense', amount: 500, date: new Date('2024-01-15'), category_id: 'cat1' },
  //       { type: 'expense', amount: 600, date: new Date('2024-02-15'), category_id: 'cat1' },
  //       { type: 'expense', amount: 300, date: new Date('2024-01-20'), category_id: 'cat2' }
  //     ];
  //     const mockCategories = [
  //       { id: 'cat1', name: 'Food' },
  //       { id: 'cat2', name: 'Entertainment' }
  //     ];

  //     const result = budgetPlannerAgent.analyzeSpendingPatterns(mockTransactions, mockCategories);

  //     expect(result).toHaveProperty('totalMonthlySpending');
  //     expect(result).toHaveProperty('categoryBreakdown');
  //     expect(result.categoryBreakdown).toHaveProperty('cat1');
  //     expect(result.categoryBreakdown).toHaveProperty('cat2');
  //     expect(result.categoryBreakdown.cat1.name).toBe('Food');
  //   });

  //   it('should handle no expense transactions', () => {
  //     const mockTransactions = [
  //       { type: 'income', amount: 5000, date: new Date('2024-01-15') }
  //     ];

  //     const result = budgetPlannerAgent.analyzeSpendingPatterns(mockTransactions, []);

  //     expect(result.totalMonthlySpending).toBe(0);
  //     expect(Object.keys(result.categoryBreakdown)).toHaveLength(0);
  //   });
  // });

  // describe('selectBudgetFramework', () => {
  //   it('should select ENVELOPE_SYSTEM for low income', () => {
  //     const incomeAnalysis = { averageMonthlyIncome: 25000 };
  //     const debtAnalysis = { totalDebt: 0, highInterestDebt: 0 };
  //     const savingsGoals = [];

  //     const framework = budgetPlannerAgent.selectBudgetFramework(
  //       incomeAnalysis, 
  //       debtAnalysis, 
  //       savingsGoals
  //     );

  //     expect(framework).toBe('ENVELOPE_SYSTEM');
  //   });

  //   it('should select DEBT_AVALANCHE_BUDGET for high interest debt', () => {
  //     const incomeAnalysis = { averageMonthlyIncome: 50000, incomeStability: 0.8 };
  //     const debtAnalysis = { totalDebt: 20000, highInterestDebt: 18000 };
  //     const savingsGoals = [];

  //     const framework = budgetPlannerAgent.selectBudgetFramework(
  //       incomeAnalysis, 
  //       debtAnalysis, 
  //       savingsGoals
  //     );

  //     expect(framework).toBe('DEBT_AVALANCHE_BUDGET');
  //   });

  //   it('should select 50_30_20_RULE for stable high income', () => {
  //     const incomeAnalysis = { averageMonthlyIncome: 60000, incomeStability: 0.9 };
  //     const debtAnalysis = { totalDebt: 5000, highInterestDebt: 0 };
  //     const savingsGoals = [];

  //     const framework = budgetPlannerAgent.selectBudgetFramework(
  //       incomeAnalysis, 
  //       debtAnalysis, 
  //       savingsGoals
  //     );

  //     expect(framework).toBe('50_30_20_RULE');
  //   });
  // });

  // describe('calculate50_30_20Budget', () => {
  //   it('should calculate budget allocation correctly', () => {
  //     const monthlyIncome = 6000;

  //     const result = budgetPlannerAgent.calculate50_30_20Budget(monthlyIncome);

  //     expect(result.needs).toBe(3000); // 50%
  //     expect(result.wants).toBe(1800); // 30%
  //     expect(result.savingsAndDebt).toBe(1200); // 20%
  //     expect(result.framework).toBe('50_30_20_RULE');
  //   });
  // });

  // describe('analyzeDebtSituation', () => {
  //   it('should analyze debt situation correctly', () => {
  //     const debts = [
  //       { amount: 5000, interest_rate: 15.5 },
  //       { amount: 2000, interest_rate: 8.0 },
  //       { amount: 1000, interest_rate: 22.0 }
  //     ];

  //     const result = budgetPlannerAgent.analyzeDebtSituation(debts);

  //     expect(result.totalDebt).toBe(8000);
  //     expect(result.highInterestDebt).toBe(6000); // 15.5% and 22% are > 10%
  //     expect(result.minimumPayments).toBe(160); // 2% of total debt
  //     expect(result.recommendedStrategy).toBe('avalanche');
  //   });

  //   it('should handle no debts', () => {
  //     const result = budgetPlannerAgent.analyzeDebtSituation([]);

  //     expect(result.totalDebt).toBe(0);
  //     expect(result.highInterestDebt).toBe(0);
  //     expect(result.minimumPayments).toBe(0);
  //     expect(result.recommendedStrategy).toBe('none');
  //   });

  //   it('should recommend snowball for many small debts', () => {
  //     const debts = [
  //       { amount: 500, interest_rate: 15.5 },
  //       { amount: 600, interest_rate: 18.0 },
  //       { amount: 700, interest_rate: 12.0 },
  //       { amount: 400, interest_rate: 20.0 },
  //       { amount: 300, interest_rate: 14.0 },
  //       { amount: 800, interest_rate: 16.0 }
  //     ];

  //     const result = budgetPlannerAgent.analyzeDebtSituation(debts);

  //     expect(result.recommendedStrategy).toBe('snowball');
  //   });
  // });

  // describe('isEssentialCategory', () => {
  //   it('should identify essential categories', () => {
  //     expect(budgetPlannerAgent.isEssentialCategory('Groceries')).toBe(true);
  //     expect(budgetPlannerAgent.isEssentialCategory('Rent')).toBe(true);
  //     expect(budgetPlannerAgent.isEssentialCategory('Utilities')).toBe(true);
  //     expect(budgetPlannerAgent.isEssentialCategory('Transportation')).toBe(true);
  //   });

  //   it('should identify non-essential categories', () => {
  //     expect(budgetPlannerAgent.isEssentialCategory('Entertainment')).toBe(false);
  //     expect(budgetPlannerAgent.isEssentialCategory('Dining Out')).toBe(false);
  //     expect(budgetPlannerAgent.isEssentialCategory('Hobbies')).toBe(false);
  //   });
  // });

  // describe('createBudgetPlan', () => {
  //   it('should create a complete budget plan', async () => {
  //     // Setup extensive mocks for the full flow
  //     const mockTransactions = [
  //       { type: 'income', amount: 5000, date: new Date('2024-01-15') },
  //       { type: 'expense', amount: 1500, date: new Date('2024-01-20'), category_id: 'cat1' }
  //     ];
  //     const mockCategories = [{ id: 'cat1', name: 'Food' }];

  //     Transaction.findAll.mockResolvedValue(mockTransactions);
  //     Budget.findAll.mockResolvedValue([]);
  //     Balance.findOne.mockResolvedValue({ balance: 10000 });
  //     Debt.findAll.mockResolvedValue([]);
  //     Saving.findAll.mockResolvedValue([]);
  //     Category.findAll.mockResolvedValue(mockCategories);

  //     // Mock LLM response
  //     const mockLLMResponse = {
  //       response: {
  //         text: () => 'Here is your personalized budget plan...'
  //       }
  //     };
  //     budgetPlannerAgent.model.generateContent.mockResolvedValue(mockLLMResponse);

  //     const result = await budgetPlannerAgent.createBudgetPlan(mockUserId);

  //     expect(result.success).toBe(true);
  //     expect(result).toHaveProperty('conversationalResponse');
  //     expect(result).toHaveProperty('budgetSummary');
  //     expect(result).toHaveProperty('budgetPlan');
  //     expect(result).toHaveProperty('actionItems');
  //     expect(result).toHaveProperty('insights');
  //     expect(result.budgetPlan.framework).toBe('50_30_20_RULE');
  //   });

  //   it('should handle errors gracefully', async () => {
  //     Transaction.findAll.mockRejectedValue(new Error('Database error'));

  //     const result = await budgetPlannerAgent.createBudgetPlan(mockUserId);

  //     expect(result.success).toBe(false);
  //     expect(result.error).toBe('Database error');
  //   });
  // });

  // describe('generateActionItems', () => {
  //   it('should generate appropriate action items for 50-30-20 budget', () => {
  //     const budgetPlan = {
  //       framework: '50_30_20_RULE',
  //       needs: 3000,
  //       wants: 1800,
  //       savingsAndDebt: 1200
  //     };

  //     const actionItems = budgetPlannerAgent.generateActionItems(budgetPlan);

  //     expect(actionItems).toHaveLength(2);
  //     expect(actionItems[0].title).toBe('Review Category Allocations');
  //     expect(actionItems[1].title).toBe('Set Up Budget Tracking');
  //   });

  //   it('should include debt-specific action for debt avalanche budget', () => {
  //     const budgetPlan = {
  //       framework: 'DEBT_AVALANCHE_BUDGET',
  //       essentials: 2000,
  //       minimumDebtPayments: 400,
  //       extraDebtPayment: 800
  //     };

  //     const actionItems = budgetPlannerAgent.generateActionItems(budgetPlan);

  //     expect(actionItems.some(item => item.title.includes('High-Interest Debt'))).toBe(true);
  //   });

  //   it('should include savings automation for plans with savings allocation', () => {
  //     const budgetPlan = {
  //       framework: '50_30_20_RULE',
  //       savingsAllocation: 800
  //     };

  //     const actionItems = budgetPlannerAgent.generateActionItems(budgetPlan);

  //     expect(actionItems.some(item => item.title.includes('Automate Savings'))).toBe(true);
  //   });
  // });

  // describe('generateInsights', () => {
  //   it('should generate insights for variable income', () => {
  //     const financialSnapshot = {
  //       incomeAnalysis: { incomeStability: 0.5 },
  //       spendingAnalysis: { categoryBreakdown: {}, volatileCategories: [] }
  //     };

  //     const insights = budgetPlannerAgent.generateInsights(financialSnapshot, {});

  //     expect(insights.some(insight => insight.title.includes('Variable Income'))).toBe(true);
  //   });

  //   it('should generate insights for high category spending', () => {
  //     const financialSnapshot = {
  //       incomeAnalysis: { incomeStability: 0.8 },
  //       spendingAnalysis: {
  //         categoryBreakdown: {
  //           'cat1': { name: 'Food', percentage: 45, averageMonthly: 2250 }
  //         },
  //         volatileCategories: []
  //       }
  //     };

  //     const insights = budgetPlannerAgent.generateInsights(financialSnapshot, {});

  //     expect(insights.some(insight => insight.title.includes('Food Spending'))).toBe(true);
  //   });
  // });
});

// describe('BudgetPlannerAgent Integration', () => {
//   let budgetPlannerAgent;

//   beforeEach(() => {
//     budgetPlannerAgent = new BudgetPlannerAgent();
//   });

//   describe('End-to-end budget planning scenarios', () => {
//     it('should handle user with stable income and moderate debt', async () => {
//       // Mock realistic financial data
//       const mockTransactions = [
//         // Income
//         { type: 'income', amount: 5000, date: new Date('2024-01-01'), description: 'Salary' },
//         { type: 'income', amount: 5000, date: new Date('2024-02-01'), description: 'Salary' },
//         { type: 'income', amount: 5000, date: new Date('2024-03-01'), description: 'Salary' },
//         // Expenses
//         { type: 'expense', amount: 1200, date: new Date('2024-01-05'), category_id: 'rent' },
//         { type: 'expense', amount: 400, date: new Date('2024-01-10'), category_id: 'food' },
//         { type: 'expense', amount: 200, date: new Date('2024-01-15'), category_id: 'transport' }
//       ];

//       const mockDebts = [
//         { amount: 10000, interest_rate: 15.5, type: 'personal' }
//       ];

//       const mockCategories = [
//         { id: 'rent', name: 'Rent' },
//         { id: 'food', name: 'Food' },
//         { id: 'transport', name: 'Transportation' }
//       ];

//       // Setup mocks
//       Transaction.findAll.mockResolvedValue(mockTransactions);
//       Budget.findAll.mockResolvedValue([]);
//       Balance.findOne.mockResolvedValue({ balance: 5000 });
//       Debt.findAll.mockResolvedValue(mockDebts);
//       Saving.findAll.mockResolvedValue([]);
//       Category.findAll.mockResolvedValue(mockCategories);

//       // Mock LLM response
//       budgetPlannerAgent.model.generateContent.mockResolvedValue({
//         response: {
//           text: () => 'Based on your stable income and moderate debt, I recommend the 50-30-20 approach with extra focus on debt repayment...'
//         }
//       });

//       const result = await budgetPlannerAgent.createBudgetPlan('user-123');

//       expect(result.success).toBe(true);
//       expect(result.budgetPlan.framework).toBe('50_30_20_RULE');
//       expect(result.financialSnapshot.income).toBe(5000);
//       expect(result.actionItems.length).toBeGreaterThan(0);
//     });
//   });
// }); 