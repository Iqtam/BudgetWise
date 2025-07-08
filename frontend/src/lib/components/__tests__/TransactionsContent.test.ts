import { describe, it, expect } from 'vitest';

// Business logic functions extracted from TransactionsContent component
function getCategoryById(categories: any[], categoryId: string | null | undefined) {
  if (!categoryId) return null;
  return categories.find((cat) => cat.id.toString() === categoryId.toString());
}

function getCategoryDisplay(categories: any[], categoryId: string | null | undefined) {
  const category = getCategoryById(categories, categoryId);
  return category ? category.name : 'No Category';
}

function getFilteredCategories(categories: any[], type: string): any[] {
  return categories.filter((category) => category.type === type);
}

function filterAndSortTransactions(
  transactions: any[], 
  type: 'income' | 'expense', 
  searchTerm: string = '', 
  filterCategory: string = 'all', 
  sortBy: string = 'date',
  currentPage: number = 1,
  itemsPerPage: number = 10
) {
  if (!transactions.length) {
    return {
      transactions: [],
      totalCount: 0,
      totalPages: 0
    };
  }

  const filtered = transactions
    .filter((transaction) => {
      const matchesType = transaction.type === type;
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'all' ||
        (filterCategory === 'none' && !transaction.category_id) ||
        (filterCategory !== 'none' && transaction.category_id?.toString() === filterCategory);
      return matchesType && matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'amount') {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
      return 0;
    });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    transactions: filtered.slice(startIndex, endIndex),
    totalCount: filtered.length,
    totalPages: Math.ceil(filtered.length / itemsPerPage)
  };
}

function calculateSignedAmount(amount: number, type: 'income' | 'expense'): number {
  return type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
}

function calculateBalanceAfterTransaction(currentBalance: number, amount: number, type: 'income' | 'expense'): number {
  if (type === 'income') {
    return currentBalance + Math.abs(amount);
  } else if (type === 'expense') {
    return currentBalance - Math.abs(amount);
  }
  return currentBalance;
}

function calculateBalanceAfterDelete(currentBalance: number, transaction: any): number {
  if (transaction.type === 'income') {
    // Remove income (subtract from balance)
    return currentBalance - transaction.amount;
  } else if (transaction.type === 'expense') {
    // Remove expense (add back to balance since expense was negative)
    return currentBalance + Math.abs(transaction.amount);
  }
  return currentBalance;
}

function calculateBalanceAfterUpdate(currentBalance: number, oldTransaction: any, newAmount: number, newType: 'income' | 'expense'): number {
  const oldAmount = oldTransaction.amount;
  const newAmountSigned = calculateSignedAmount(newAmount, newType);
  
  // Calculate the difference between old and new transaction
  const balanceDelta = newAmountSigned - oldAmount;
  
  return currentBalance + balanceDelta;
}

function isValidTransactionFile(file: { type: string; size: number }): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Please select a valid image file (JPG, PNG, GIF, WebP)' };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  return { isValid: true };
}

function validateRecurringTransaction(formData: {
  isRecurrent: boolean;
  recurrenceType?: string;
  weekday?: string;
  endDate?: string;
  duration?: string;
  startDate: string;
}): { isValid: boolean; error?: string } {
  if (!formData.isRecurrent) {
    return { isValid: true };
  }

  // Check if weekday is required for weekly recurrence
  if (formData.recurrenceType === 'weekly' && !formData.weekday) {
    return { isValid: false, error: 'Please select a day of the week for weekly recurring transactions' };
  }

  // Check if both end date and duration are provided
  if (formData.endDate && formData.duration) {
    return { isValid: false, error: 'Please choose either an end date OR duration count, not both' };
  }

  // Validate start date vs end date
  if (formData.endDate) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      return { isValid: false, error: 'End date must be after the start date' };
    }
  }

  // Validate start date is not in the past
  const startDate = new Date(formData.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (startDate < today) {
    return { isValid: false, error: 'Start date cannot be in the past' };
  }

  return { isValid: true };
}

function getTotalsByType(transactions: any[], type: 'income' | 'expense'): number {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

function getTransactionsByDateRange(transactions: any[], startDate: string, endDate: string): any[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });
}

describe('TransactionsContent Business Logic', () => {
  const mockCategories = [
    { id: '1', name: 'Food', type: 'expense' },
    { id: '2', name: 'Transportation', type: 'expense' },
    { id: '3', name: 'Salary', type: 'income' },
    { id: '4', name: 'Freelance', type: 'income' }
  ];

  const mockTransactions = [
    {
      id: '1',
      description: 'Grocery Shopping',
      amount: -50.00,
      type: 'expense',
      category_id: '1',
      date: '2024-01-15'
    },
    {
      id: '2',
      description: 'Salary Payment',
      amount: 3000.00,
      type: 'income',
      category_id: '3',
      date: '2024-01-01'
    },
    {
      id: '3',
      description: 'Bus Ticket',
      amount: -5.50,
      type: 'expense',
      category_id: '2',
      date: '2024-01-10'
    },
    {
      id: '4',
      description: 'Freelance Project',
      amount: 500.00,
      type: 'income',
      category_id: '4',
      date: '2024-01-20'
    }
  ];

  describe('getCategoryById', () => {
    it('should return category when found', () => {
      const result = getCategoryById(mockCategories, '1');
      expect(result).toEqual({ id: '1', name: 'Food', type: 'expense' });
    });

    it('should return null when categoryId is null or undefined', () => {
      expect(getCategoryById(mockCategories, null)).toBeNull();
      expect(getCategoryById(mockCategories, undefined)).toBeNull();
    });

    it('should handle string/number ID conversion', () => {
      const result = getCategoryById(mockCategories, 1 as any);
      expect(result).toEqual({ id: '1', name: 'Food', type: 'expense' });
    });
  });

  describe('getCategoryDisplay', () => {
    it('should return category name when found', () => {
      const result = getCategoryDisplay(mockCategories, '1');
      expect(result).toBe('Food');
    });

    it('should return "No Category" when not found', () => {
      const result = getCategoryDisplay(mockCategories, '999');
      expect(result).toBe('No Category');
    });

    it('should return "No Category" when categoryId is null', () => {
      const result = getCategoryDisplay(mockCategories, null);
      expect(result).toBe('No Category');
    });
  });

  describe('getFilteredCategories', () => {
    it('should filter categories by type', () => {
      const expenseCategories = getFilteredCategories(mockCategories, 'expense');
      expect(expenseCategories).toHaveLength(2);
      expect(expenseCategories.every(cat => cat.type === 'expense')).toBe(true);
    });

    it('should filter income categories', () => {
      const incomeCategories = getFilteredCategories(mockCategories, 'income');
      expect(incomeCategories).toHaveLength(2);
      expect(incomeCategories.every(cat => cat.type === 'income')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      const result = getFilteredCategories(mockCategories, 'unknown');
      expect(result).toHaveLength(0);
    });
  });

  describe('filterAndSortTransactions', () => {
    it('should filter transactions by type', () => {
      const result = filterAndSortTransactions(mockTransactions, 'expense');
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions.every(t => t.type === 'expense')).toBe(true);
      expect(result.totalCount).toBe(2);
    });

    it('should filter by search term', () => {
      const result = filterAndSortTransactions(mockTransactions, 'expense', 'grocery');
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].description).toBe('Grocery Shopping');
    });

    it('should filter by category', () => {
      const result = filterAndSortTransactions(mockTransactions, 'expense', '', '1');
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].category_id).toBe('1');
    });

    it('should sort by date (default)', () => {
      const result = filterAndSortTransactions(mockTransactions, 'expense');
      const dates = result.transactions.map(t => new Date(t.date).getTime());
      expect(dates[0]).toBeGreaterThanOrEqual(dates[1]); // Newest first
    });

    it('should sort by amount', () => {
      const result = filterAndSortTransactions(mockTransactions, 'expense', '', 'all', 'amount');
      const amounts = result.transactions.map(t => Math.abs(t.amount));
      expect(amounts[0]).toBeGreaterThanOrEqual(amounts[1]); // Largest first
    });

    it('should handle pagination', () => {
      const result = filterAndSortTransactions(mockTransactions, 'expense', '', 'all', 'date', 1, 1);
      expect(result.transactions).toHaveLength(1);
      expect(result.totalPages).toBe(2);
    });

    it('should return empty result for empty transactions array', () => {
      const result = filterAndSortTransactions([], 'expense');
      expect(result.transactions).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('calculateSignedAmount', () => {
    it('should return negative amount for expenses', () => {
      const result = calculateSignedAmount(100, 'expense');
      expect(result).toBe(-100);
    });

    it('should return positive amount for income', () => {
      const result = calculateSignedAmount(100, 'income');
      expect(result).toBe(100);
    });

    it('should handle negative input for expenses', () => {
      const result = calculateSignedAmount(-100, 'expense');
      expect(result).toBe(-100);
    });

    it('should handle negative input for income', () => {
      const result = calculateSignedAmount(-100, 'income');
      expect(result).toBe(100);
    });
  });

  describe('calculateBalanceAfterTransaction', () => {
    it('should increase balance for income', () => {
      const result = calculateBalanceAfterTransaction(1000, 500, 'income');
      expect(result).toBe(1500);
    });

    it('should decrease balance for expense', () => {
      const result = calculateBalanceAfterTransaction(1000, 200, 'expense');
      expect(result).toBe(800);
    });

    it('should handle negative amounts correctly', () => {
      const incomeResult = calculateBalanceAfterTransaction(1000, -500, 'income');
      expect(incomeResult).toBe(1500); // Should still add absolute value
      
      const expenseResult = calculateBalanceAfterTransaction(1000, -200, 'expense');
      expect(expenseResult).toBe(800); // Should still subtract absolute value
    });
  });

  describe('calculateBalanceAfterDelete', () => {
    it('should decrease balance when deleting income', () => {
      const transaction = { amount: 500, type: 'income' };
      const result = calculateBalanceAfterDelete(1500, transaction);
      expect(result).toBe(1000);
    });

    it('should increase balance when deleting expense', () => {
      const transaction = { amount: -200, type: 'expense' };
      const result = calculateBalanceAfterDelete(800, transaction);
      expect(result).toBe(1000);
    });
  });

  describe('calculateBalanceAfterUpdate', () => {
    it('should calculate correct balance change for expense update', () => {
      const oldTransaction = { amount: -15, type: 'expense' };
      const result = calculateBalanceAfterUpdate(1000, oldTransaction, 35, 'expense');
      expect(result).toBe(980); // 1000 + (-35 - (-15)) = 1000 + (-20) = 980
    });

    it('should calculate correct balance change for income update', () => {
      const oldTransaction = { amount: 100, type: 'income' };
      const result = calculateBalanceAfterUpdate(1000, oldTransaction, 150, 'income');
      expect(result).toBe(1050); // 1000 + (150 - 100) = 1050
    });

    it('should handle type change from expense to income', () => {
      const oldTransaction = { amount: -50, type: 'expense' };
      const result = calculateBalanceAfterUpdate(1000, oldTransaction, 50, 'income');
      expect(result).toBe(1100); // 1000 + (50 - (-50)) = 1100
    });
  });

  describe('isValidTransactionFile', () => {
    it('should accept valid image files', () => {
      const file = { type: 'image/jpeg', size: 1024 * 1024 }; // 1MB
      const result = isValidTransactionFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid file types', () => {
      const file = { type: 'text/plain', size: 1024 };
      const result = isValidTransactionFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid image file');
    });

    it('should reject files that are too large', () => {
      const file = { type: 'image/jpeg', size: 11 * 1024 * 1024 }; // 11MB
      const result = isValidTransactionFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('10MB');
    });
  });

  describe('validateRecurringTransaction', () => {
    it('should validate non-recurring transactions', () => {
      const formData = { isRecurrent: false, startDate: '2024-01-01' };
      const result = validateRecurringTransaction(formData);
      expect(result.isValid).toBe(true);
    });

    it('should require weekday for weekly recurrence', () => {
      const formData = { 
        isRecurrent: true, 
        recurrenceType: 'weekly',
        startDate: '2024-01-01'
      };
      const result = validateRecurringTransaction(formData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('day of the week');
    });

    it('should reject both end date and duration', () => {
      const formData = { 
        isRecurrent: true,
        endDate: '2024-12-31',
        duration: '12',
        startDate: '2024-01-01'
      };
      const result = validateRecurringTransaction(formData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('either an end date OR duration');
    });

    it('should validate end date after start date', () => {
      const formData = { 
        isRecurrent: true,
        startDate: '2024-06-01',
        endDate: '2024-01-01'
      };
      const result = validateRecurringTransaction(formData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('End date must be after');
    });
  });

  describe('getTotalsByType', () => {
    it('should calculate total expenses', () => {
      const result = getTotalsByType(mockTransactions, 'expense');
      expect(result).toBe(55.50); // 50.00 + 5.50
    });

    it('should calculate total income', () => {
      const result = getTotalsByType(mockTransactions, 'income');
      expect(result).toBe(3500); // 3000 + 500
    });

    it('should return 0 for empty transactions', () => {
      const result = getTotalsByType([], 'expense');
      expect(result).toBe(0);
    });
  });

  describe('getTransactionsByDateRange', () => {
    it('should filter transactions by date range', () => {
      const result = getTransactionsByDateRange(mockTransactions, '2024-01-10', '2024-01-20');
      expect(result).toHaveLength(3); // Bus ticket, Grocery, Freelance
    });

    it('should return empty array when no transactions in range', () => {
      const result = getTransactionsByDateRange(mockTransactions, '2024-02-01', '2024-02-28');
      expect(result).toHaveLength(0);
    });

    it('should include transactions on boundary dates', () => {
      const result = getTransactionsByDateRange(mockTransactions, '2024-01-01', '2024-01-01');
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Salary Payment');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty categories array', () => {
      const result = getCategoryDisplay([], '1');
      expect(result).toBe('No Category');
    });

    it('should handle transactions with null category_id', () => {
      const transactionsWithNull = [
        { ...mockTransactions[0], category_id: null }
      ];
      const result = filterAndSortTransactions(transactionsWithNull, 'expense', '', 'none');
      expect(result.transactions).toHaveLength(1);
    });

    it('should handle zero amounts in calculations', () => {
      const result = calculateBalanceAfterTransaction(1000, 0, 'income');
      expect(result).toBe(1000);
    });

    it('should handle invalid dates gracefully', () => {
      const transactionsWithInvalidDate = [
        { ...mockTransactions[0], date: 'invalid-date' }
      ];
      // Should not throw error
      expect(() => filterAndSortTransactions(transactionsWithInvalidDate, 'expense')).not.toThrow();
    });
  });
}); 