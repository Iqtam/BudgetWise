import { describe, it, expect } from 'vitest';

// Business logic functions extracted from BudgetContent component
function getSpentAmount(budget: any): number {
  if (budget.spent !== null && budget.spent !== undefined) {
    return parseFloat(String(budget.spent));
  }
  return 0;
}

function getBudgetStatus(spent: number, budgetAmount: number) {
  if (budgetAmount <= 0) return { status: "No Budget", color: "text-gray-400", bgColor: "bg-gray-500/20" };
  const percentage = (spent / budgetAmount) * 100;
  if (percentage >= 100) return { status: "Over Budget", color: "text-red-400", bgColor: "bg-red-500/20" };
  if (percentage >= 80) return { status: "Near Limit", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
  return { status: "On Track", color: "text-green-400", bgColor: "bg-green-500/20" };
}

function calculateBudgetTotals(budgets: any[]) {
  const totalBudget = budgets.reduce((sum, budget) => {
    return sum + parseFloat(String(budget.goal_amount || '0'));
  }, 0);
  
  const totalSpent = budgets.reduce((sum, budget) => {
    return sum + getSpentAmount(budget);
  }, 0);
  
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    overallProgress
  };
}

function getBudgetsNearLimit(budgets: any[]): number {
  return budgets.filter(budget => {
    const spent = getSpentAmount(budget);
    const goalAmount = parseFloat(String(budget.goal_amount || '0'));
    const percentage = goalAmount > 0 ? (spent / goalAmount) * 100 : 0;
    return percentage >= 80 && percentage < 100;
  }).length;
}

describe('BudgetContent Business Logic', () => {
  const mockBudgets = [
    {
      id: 'budget1',
      category_id: 'cat1',
      goal_amount: 500,
      spent: 350,
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    },
    {
      id: 'budget2',
      category_id: 'cat2',
      goal_amount: 200,
      spent: 180,
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    },
    {
      id: 'budget3',
      category_id: 'cat3',
      goal_amount: 300,
      spent: 320,
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    }
  ];

  describe('getSpentAmount', () => {
    it('should return the spent amount when available', () => {
      const budget = { spent: 150.50 };
      expect(getSpentAmount(budget)).toBe(150.50);
    });

    it('should return 0 when spent is null', () => {
      const budget = { spent: null };
      expect(getSpentAmount(budget)).toBe(0);
    });

    it('should return 0 when spent is undefined', () => {
      const budget = { spent: undefined };
      expect(getSpentAmount(budget)).toBe(0);
    });

    it('should parse string amounts correctly', () => {
      const budget = { spent: '250.75' };
      expect(getSpentAmount(budget)).toBe(250.75);
    });
  });

  describe('getBudgetStatus', () => {
    it('should return "No Budget" when budget amount is 0', () => {
      const result = getBudgetStatus(100, 0);
      expect(result.status).toBe('No Budget');
      expect(result.color).toBe('text-gray-400');
    });

    it('should return "Over Budget" when spent exceeds budget', () => {
      const result = getBudgetStatus(120, 100);
      expect(result.status).toBe('Over Budget');
      expect(result.color).toBe('text-red-400');
    });

    it('should return "Near Limit" when spent is 80-99% of budget', () => {
      const result = getBudgetStatus(85, 100);
      expect(result.status).toBe('Near Limit');
      expect(result.color).toBe('text-yellow-400');
    });

    it('should return "On Track" when spent is less than 80% of budget', () => {
      const result = getBudgetStatus(70, 100);
      expect(result.status).toBe('On Track');
      expect(result.color).toBe('text-green-400');
    });
  });

  describe('calculateBudgetTotals', () => {
    it('should calculate correct totals', () => {
      const result = calculateBudgetTotals(mockBudgets);
      
      expect(result.totalBudget).toBe(1000); // 500 + 200 + 300
      expect(result.totalSpent).toBe(850);   // 350 + 180 + 320
      expect(result.totalRemaining).toBe(150); // 1000 - 850
      expect(result.overallProgress).toBe(85); // (850/1000) * 100
    });

    it('should handle empty budget array', () => {
      const result = calculateBudgetTotals([]);
      
      expect(result.totalBudget).toBe(0);
      expect(result.totalSpent).toBe(0);
      expect(result.totalRemaining).toBe(0);
      expect(result.overallProgress).toBe(0);
    });

    it('should handle budgets with missing amounts', () => {
      const budgetsWithMissing = [
        { goal_amount: null, spent: null },
        { goal_amount: 100, spent: 50 }
      ];
      
      const result = calculateBudgetTotals(budgetsWithMissing);
      
      expect(result.totalBudget).toBe(100);
      expect(result.totalSpent).toBe(50);
    });
  });

  describe('getBudgetsNearLimit', () => {
    it('should count budgets between 80-99% usage', () => {
      const result = getBudgetsNearLimit(mockBudgets);
      
      // budget2: 180/200 = 90% (near limit)
      // budget1: 350/500 = 70% (on track)
      // budget3: 320/300 = 107% (over budget)
      expect(result).toBe(1);
    });

    it('should return 0 when no budgets are near limit', () => {
      const safeBudgets = [
        { goal_amount: 1000, spent: 500 }, // 50%
        { goal_amount: 200, spent: 100 }   // 50%
      ];
      
      const result = getBudgetsNearLimit(safeBudgets);
      expect(result).toBe(0);
    });

    it('should handle budgets with zero goal amounts', () => {
      const budgetsWithZero = [
        { goal_amount: 0, spent: 100 },
        { goal_amount: 100, spent: 85 } // 85% - near limit
      ];
      
      const result = getBudgetsNearLimit(budgetsWithZero);
      expect(result).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative spent amounts', () => {
      const budget = { spent: -50 };
      expect(getSpentAmount(budget)).toBe(-50);
      
      const status = getBudgetStatus(-50, 100);
      expect(status.status).toBe('On Track');
    });

    it('should handle very large numbers', () => {
      const largeBudget = { goal_amount: 1000000, spent: 999999 };
      const status = getBudgetStatus(getSpentAmount(largeBudget), largeBudget.goal_amount);
      expect(status.status).toBe('Near Limit');
    });

    it('should handle decimal precision', () => {
      const budget = { spent: 99.99 };
      const status = getBudgetStatus(getSpentAmount(budget), 100.00);
      expect(status.status).toBe('Near Limit'); // 99.99%
    });
  });
}); 