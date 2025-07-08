import { describe, it, expect } from 'vitest';

// Business logic functions extracted from DebtContent component
function calculateTotalDebt(debts: any[]): number {
  return debts.filter(debt => !debt.is_fully_paid).reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
}

function getEarliestDeadline(debts: any[]): string | { description: string; date: string; formatted: string } {
  if (debts.length === 0) return 'No debts';
  
  // Filter out fully paid debts
  const activeDebts = debts.filter(debt => !debt.is_fully_paid);
  
  if (activeDebts.length === 0) {
    return 'All debts paid';
  }
  
  const sortedDebts = [...activeDebts]
    .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());
  
  const earliestDebt = sortedDebts[0];
  return {
    description: earliestDebt.description,
    date: new Date(earliestDebt.expiration_date).toLocaleDateString(),
    formatted: `${earliestDebt.description} - ${new Date(earliestDebt.expiration_date).toLocaleDateString()}`
  };
}

function getDebtStatus(amount: number, originalAmount: number) {
  if (originalAmount <= 0) return { status: "No Debt", color: "text-gray-400", bgColor: "bg-gray-500/20" };
  const percentage = ((originalAmount - amount) / originalAmount) * 100;
  if (percentage >= 100) return { status: "Paid Off", color: "text-green-400", bgColor: "bg-green-500/20" };
  if (percentage >= 75) return { status: "Almost Done", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
  if (percentage >= 25) return { status: "In Progress", color: "text-blue-400", bgColor: "bg-blue-500/20" };
  return { status: "Getting Started", color: "text-red-400", bgColor: "bg-red-500/20" };
}

function getRemainingTime(debt: any) {
  // If debt is fully paid, show "Fully paid" with the date
  if (debt.is_fully_paid && debt.fully_paid_date) {
    const paidDate = new Date(debt.fully_paid_date).toLocaleDateString();
    return { formatted: `Fully paid (${paidDate})`, isOverdue: false, isFullyPaid: true };
  }

  const now = new Date();
  const expiry = new Date(debt.expiration_date);
  const timeDiff = expiry.getTime() - now.getTime();
  
  if (timeDiff <= 0) {
    return { formatted: "Overdue", isOverdue: true, isFullyPaid: false };
  }
  
  const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;
  
  let parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (days > 0 || parts.length === 0) parts.push(`${days}d`);
  
  return { formatted: parts.join(' '), isOverdue: false, isFullyPaid: false };
}

function calculatePaymentProgress(currentAmount: number, originalAmount: number): number {
  if (originalAmount <= 0) return 0;
  const paidAmount = originalAmount - currentAmount;
  return (paidAmount / originalAmount) * 100;
}

function calculateTimeProgress(startDate: string, expirationDate: string, currentDate = new Date()): number {
  const start = new Date(startDate);
  const expiry = new Date(expirationDate);
  const current = currentDate;
  
  const totalDays = Math.ceil((expiry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.max(0, Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  return totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
}

function isPaymentBehindSchedule(debt: any, currentDate = new Date()): boolean {
  const currentAmount = parseFloat(debt.amount) || 0;
  const originalAmount = debt.original_amount ? parseFloat(debt.original_amount.toString()) : currentAmount;
  
  const paymentProgress = calculatePaymentProgress(currentAmount, originalAmount);
  const timeProgress = calculateTimeProgress(debt.start_date, debt.expiration_date, currentDate);
  
  return timeProgress >= 50 && paymentProgress < 50;
}

function isDeadlineApproaching(debt: any, currentDate = new Date()): boolean {
  const timeProgress = calculateTimeProgress(debt.start_date, debt.expiration_date, currentDate);
  const timeRemaining = 100 - timeProgress;
  
  return timeRemaining <= 10 && timeRemaining > 0;
}

function getPaginatedDebts(debts: any[], currentPage: number, itemsPerPage: number = 10) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDebts = debts.slice(startIndex, endIndex);

  return {
    debts: paginatedDebts,
    totalCount: debts.length,
    totalPages: Math.ceil(debts.length / itemsPerPage),
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, debts.length),
  };
}

describe('DebtContent Business Logic', () => {
  const mockDebts = [
    {
      id: 'debt1',
      description: 'Credit Card',
      amount: 1500,
      original_amount: 2000,
      interest_rate: 18.5,
      start_date: '2024-01-01',
      expiration_date: '2024-12-31',
      is_fully_paid: false,
      type: 'bank',
      taken_from: 'Chase Bank'
    },
    {
      id: 'debt2',
      description: 'Student Loan',
      amount: 5000,
      original_amount: 10000,
      interest_rate: 5.5,
      start_date: '2023-01-01',
      expiration_date: '2025-01-01',
      is_fully_paid: false,
      type: 'bank',
      taken_from: 'Federal'
    },
    {
      id: 'debt3',
      description: 'Personal Loan',
      amount: 0,
      original_amount: 3000,
      interest_rate: 12.0,
      start_date: '2023-06-01',
      expiration_date: '2024-06-01',
      is_fully_paid: true,
      fully_paid_date: '2024-01-15',
      type: 'personal',
      taken_from: 'John Doe'
    }
  ];

  describe('calculateTotalDebt', () => {
    it('should calculate total debt excluding fully paid debts', () => {
      const result = calculateTotalDebt(mockDebts);
      expect(result).toBe(6500); // 1500 + 5000 (excluding paid debt)
    });

    it('should return 0 when all debts are paid', () => {
      const paidDebts = mockDebts.map(debt => ({ ...debt, is_fully_paid: true }));
      const result = calculateTotalDebt(paidDebts);
      expect(result).toBe(0);
    });

    it('should handle empty debt array', () => {
      const result = calculateTotalDebt([]);
      expect(result).toBe(0);
    });

    it('should handle debts with invalid amounts', () => {
      const debtsWithInvalidAmounts = [
        { amount: null, is_fully_paid: false },
        { amount: 'invalid', is_fully_paid: false },
        { amount: 100, is_fully_paid: false }
      ];
      const result = calculateTotalDebt(debtsWithInvalidAmounts);
      expect(result).toBe(100);
    });
  });

  describe('getEarliestDeadline', () => {
    it('should return "No debts" for empty array', () => {
      const result = getEarliestDeadline([]);
      expect(result).toBe('No debts');
    });

    it('should return "All debts paid" when all debts are fully paid', () => {
      const paidDebts = mockDebts.map(debt => ({ ...debt, is_fully_paid: true }));
      const result = getEarliestDeadline(paidDebts);
      expect(result).toBe('All debts paid');
    });

    it('should return earliest deadline debt info', () => {
      const result = getEarliestDeadline(mockDebts);
      expect(typeof result).toBe('object');
      if (typeof result === 'object') {
        expect(result.description).toBe('Credit Card'); // Expires Dec 31, 2024
        expect(result.date).toBe(new Date('2024-12-31').toLocaleDateString());
      }
    });

    it('should ignore fully paid debts when finding earliest deadline', () => {
      const mixedDebts = [
        { ...mockDebts[2], expiration_date: '2024-01-01', is_fully_paid: true }, // Earlier but paid
        { ...mockDebts[0], expiration_date: '2024-06-01', is_fully_paid: false }  // Later but active
      ];
      const result = getEarliestDeadline(mixedDebts);
      expect(typeof result).toBe('object');
      if (typeof result === 'object') {
        expect(result.description).toBe('Credit Card');
      }
    });
  });

  describe('getDebtStatus', () => {
    it('should return "No Debt" when original amount is 0', () => {
      const result = getDebtStatus(0, 0);
      expect(result.status).toBe('No Debt');
      expect(result.color).toBe('text-gray-400');
    });

    it('should return "Paid Off" when fully paid', () => {
      const result = getDebtStatus(0, 1000);
      expect(result.status).toBe('Paid Off');
      expect(result.color).toBe('text-green-400');
    });

    it('should return "Almost Done" when 75-99% paid', () => {
      const result = getDebtStatus(200, 1000); // 80% paid
      expect(result.status).toBe('Almost Done');
      expect(result.color).toBe('text-yellow-400');
    });

    it('should return "In Progress" when 25-74% paid', () => {
      const result = getDebtStatus(600, 1000); // 40% paid
      expect(result.status).toBe('In Progress');
      expect(result.color).toBe('text-blue-400');
    });

    it('should return "Getting Started" when less than 25% paid', () => {
      const result = getDebtStatus(900, 1000); // 10% paid
      expect(result.status).toBe('Getting Started');
      expect(result.color).toBe('text-red-400');
    });
  });

  describe('getRemainingTime', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 100);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    it('should return "Fully paid" for paid debts', () => {
      const paidDebt = {
        is_fully_paid: true,
        fully_paid_date: '2024-01-15',
        expiration_date: futureDate.toISOString()
      };
      const result = getRemainingTime(paidDebt);
      expect(result.isFullyPaid).toBe(true);
      expect(result.formatted).toContain('Fully paid');
    });

    it('should return "Overdue" for past expiration dates', () => {
      const overdueDebt = {
        is_fully_paid: false,
        expiration_date: pastDate.toISOString()
      };
      const result = getRemainingTime(overdueDebt);
      expect(result.isOverdue).toBe(true);
      expect(result.formatted).toBe('Overdue');
    });

    it('should format remaining time correctly', () => {
      const futureDebt = {
        is_fully_paid: false,
        expiration_date: futureDate.toISOString()
      };
      const result = getRemainingTime(futureDebt);
      expect(result.isOverdue).toBe(false);
      expect(result.isFullyPaid).toBe(false);
      expect(result.formatted).toMatch(/\d+d/); // Should contain days
    });
  });

  describe('calculatePaymentProgress', () => {
    it('should calculate payment progress correctly', () => {
      const progress = calculatePaymentProgress(600, 1000); // Paid 400 out of 1000
      expect(progress).toBe(40);
    });

    it('should return 0 when original amount is 0', () => {
      const progress = calculatePaymentProgress(0, 0);
      expect(progress).toBe(0);
    });

    it('should handle fully paid debts', () => {
      const progress = calculatePaymentProgress(0, 1000);
      expect(progress).toBe(100);
    });
  });

  describe('calculateTimeProgress', () => {
    it('should calculate time progress correctly', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const currentDate = new Date('2024-07-01'); // Halfway through the year
      
      const progress = calculateTimeProgress(startDate, endDate, currentDate);
      expect(progress).toBeGreaterThan(40);
      expect(progress).toBeLessThan(60);
    });

    it('should return 0 when current date is before start date', () => {
      const startDate = '2024-06-01';
      const endDate = '2024-12-31';
      const currentDate = new Date('2024-01-01');
      
      const progress = calculateTimeProgress(startDate, endDate, currentDate);
      expect(progress).toBe(0);
    });

    it('should handle same start and end dates', () => {
      const startDate = '2024-06-01';
      const endDate = '2024-06-01';
      const currentDate = new Date('2024-06-01');
      
      const progress = calculateTimeProgress(startDate, endDate, currentDate);
      expect(progress).toBe(0);
    });
  });

  describe('isPaymentBehindSchedule', () => {
    it('should return true when payment is behind time', () => {
      const debt = {
        amount: 750, // 25% paid (250 out of 1000)
        original_amount: 1000,
        start_date: '2024-01-01',
        expiration_date: '2024-12-31'
      };
      const currentDate = new Date('2024-08-01'); // ~60% through year
      
      const result = isPaymentBehindSchedule(debt, currentDate);
      expect(result).toBe(true); // 60% time passed but only 25% paid
    });

    it('should return false when payment is on track', () => {
      const debt = {
        amount: 400, // 60% paid
        original_amount: 1000,
        start_date: '2024-01-01',
        expiration_date: '2024-12-31'
      };
      const currentDate = new Date('2024-07-01'); // ~50% through year
      
      const result = isPaymentBehindSchedule(debt, currentDate);
      expect(result).toBe(false); // 50% time passed and 60% paid
    });
  });

  describe('isDeadlineApproaching', () => {
    it('should return true when deadline is approaching', () => {
      const debt = {
        start_date: '2024-01-01',
        expiration_date: '2024-12-31'
      };
      const currentDate = new Date('2024-12-15'); // Close to end of year
      
      const result = isDeadlineApproaching(debt, currentDate);
      expect(result).toBe(true);
    });

    it('should return false when deadline is not approaching', () => {
      const debt = {
        start_date: '2024-01-01',
        expiration_date: '2024-12-31'
      };
      const currentDate = new Date('2024-06-01'); // Middle of year
      
      const result = isDeadlineApproaching(debt, currentDate);
      expect(result).toBe(false);
    });
  });

  describe('getPaginatedDebts', () => {
    it('should paginate debts correctly', () => {
      const result = getPaginatedDebts(mockDebts, 1, 2);
      
      expect(result.debts).toHaveLength(2);
      expect(result.totalCount).toBe(3);
      expect(result.totalPages).toBe(2);
      expect(result.startIndex).toBe(1);
      expect(result.endIndex).toBe(2);
    });

    it('should handle last page correctly', () => {
      const result = getPaginatedDebts(mockDebts, 2, 2);
      
      expect(result.debts).toHaveLength(1);
      expect(result.startIndex).toBe(3);
      expect(result.endIndex).toBe(3);
    });

    it('should handle empty debt array', () => {
      const result = getPaginatedDebts([], 1, 10);
      
      expect(result.debts).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative debt amounts', () => {
      const status = getDebtStatus(-100, 1000);
      expect(status.status).toBe('Paid Off'); // More than 100% paid
    });

    it('should handle invalid date strings', () => {
      const progress = calculateTimeProgress('invalid-date', '2024-12-31');
      expect(progress).toBe(0);
    });
  });
}); 