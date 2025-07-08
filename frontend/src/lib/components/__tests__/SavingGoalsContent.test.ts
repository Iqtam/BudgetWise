import { describe, it, expect } from 'vitest';

// Business logic functions extracted from SavingGoalsContent component
function safeParseFloat(value: any): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(numAmount) ? '0.00' : numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getGoalStatus(current: number, target: number) {
  const safeTarget = target || 0;
  const safeCurrent = current || 0;
  
  if (safeTarget <= 0) return { status: "No Target", color: "text-gray-400", bgColor: "bg-gray-500/20" };
  
  const percentage = (safeCurrent / safeTarget) * 100;
  if (percentage >= 100) return { status: "Completed", color: "text-green-400", bgColor: "bg-green-500/20" };
  if (percentage >= 75) return { status: "Almost There", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
  if (percentage >= 25) return { status: "In Progress", color: "text-blue-400", bgColor: "bg-blue-500/20" };
  return { status: "Getting Started", color: "text-gray-400", bgColor: "bg-gray-500/20" };
}

function calculateTotalTargets(goals: any[]): number {
  return goals.reduce((sum, goal) => sum + safeParseFloat(goal.target_amount), 0);
}

function calculateTotalSaved(goals: any[]): number {
  return goals.reduce((sum, goal) => sum + safeParseFloat(goal.start_amount), 0);
}

function calculateOverallProgress(goals: any[]): number {
  const totalTargets = calculateTotalTargets(goals);
  const totalSaved = calculateTotalSaved(goals);
  return totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0;
}

function calculateCompletedGoals(goals: any[]): number {
  return goals.filter((goal) => {
    const startAmount = safeParseFloat(goal.start_amount);
    const targetAmount = safeParseFloat(goal.target_amount);
    return goal.completed || startAmount >= targetAmount;
  }).length;
}

function calculateGoalProgress(startAmount: number, targetAmount: number): number {
  return targetAmount > 0 ? (startAmount / targetAmount) * 100 : 0;
}

function calculateRemainingAmount(startAmount: number, targetAmount: number): number {
  return Math.max(0, targetAmount - startAmount);
}

function isGoalCompleted(goal: any): boolean {
  const startAmount = safeParseFloat(goal.start_amount);
  const targetAmount = safeParseFloat(goal.target_amount);
  return goal.completed || startAmount >= targetAmount;
}

function calculateTimeProgress(startDate: string, endDate: string, currentDate = new Date()): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = currentDate;
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.max(0, Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  return totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
}

function isSavingBehindSchedule(goal: any, currentDate = new Date()): boolean {
  const currentAmount = safeParseFloat(goal.start_amount);
  const targetAmount = safeParseFloat(goal.target_amount);
  
  const progress = calculateGoalProgress(currentAmount, targetAmount);
  const timeProgress = calculateTimeProgress(goal.start_date, goal.end_date, currentDate);
  
  return timeProgress >= 25 && timeProgress > progress + 15;
}

function isDeadlineApproaching(goal: any, currentDate = new Date()): boolean {
  const timeProgress = calculateTimeProgress(goal.start_date, goal.end_date, currentDate);
  const goalProgress = calculateGoalProgress(safeParseFloat(goal.start_amount), safeParseFloat(goal.target_amount));
  const timeRemaining = 100 - timeProgress;
  
  return timeRemaining <= 15 && timeRemaining > 0 && goalProgress < 80;
}

function getPaginatedGoals(goals: any[], currentPage: number, itemsPerPage: number = 10) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGoals = goals.slice(startIndex, endIndex);

  return {
    goals: paginatedGoals,
    totalCount: goals.length,
    totalPages: Math.ceil(goals.length / itemsPerPage),
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, goals.length),
  };
}

function calculateDailyRequired(remainingAmount: number, daysRemaining: number): number {
  return daysRemaining > 0 ? remainingAmount / daysRemaining : remainingAmount;
}

describe('SavingGoalsContent Business Logic', () => {
  const mockGoals = [
    {
      id: 'goal1',
      description: 'Emergency Fund',
      target_amount: 5000,
      start_amount: 2500,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      completed: false
    },
    {
      id: 'goal2',
      description: 'Vacation',
      target_amount: 2000,
      start_amount: 1800,
      start_date: '2024-03-01',
      end_date: '2024-08-01',
      completed: false
    },
    {
      id: 'goal3',
      description: 'New Car',
      target_amount: 3000,
      start_amount: 3000,
      start_date: '2023-06-01',
      end_date: '2024-06-01',
      completed: true
    }
  ];

  describe('safeParseFloat', () => {
    it('should parse number correctly', () => {
      expect(safeParseFloat(123.45)).toBe(123.45);
    });

    it('should parse string numbers correctly', () => {
      expect(safeParseFloat('123.45')).toBe(123.45);
    });

    it('should return 0 for invalid inputs', () => {
      expect(safeParseFloat('invalid')).toBe(0);
      expect(safeParseFloat(null)).toBe(0);
      expect(safeParseFloat(undefined)).toBe(0);
      expect(safeParseFloat(NaN)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers with proper currency format', () => {
      expect(formatCurrency(1234.5)).toBe('1,234.50');
      expect(formatCurrency(1000000)).toBe('1,000,000.00');
    });

    it('should format string numbers', () => {
      expect(formatCurrency('1234.5')).toBe('1,234.50');
    });

    it('should handle invalid inputs', () => {
      expect(formatCurrency('invalid')).toBe('0.00');
      expect(formatCurrency(NaN)).toBe('0.00');
    });
  });

  describe('getGoalStatus', () => {
    it('should return "No Target" when target is 0', () => {
      const result = getGoalStatus(100, 0);
      expect(result.status).toBe('No Target');
      expect(result.color).toBe('text-gray-400');
    });

    it('should return "Completed" when goal is achieved', () => {
      const result = getGoalStatus(1000, 1000);
      expect(result.status).toBe('Completed');
      expect(result.color).toBe('text-green-400');
    });

    it('should return "Almost There" when 75-99% complete', () => {
      const result = getGoalStatus(800, 1000);
      expect(result.status).toBe('Almost There');
      expect(result.color).toBe('text-yellow-400');
    });

    it('should return "In Progress" when 25-74% complete', () => {
      const result = getGoalStatus(500, 1000);
      expect(result.status).toBe('In Progress');
      expect(result.color).toBe('text-blue-400');
    });

    it('should return "Getting Started" when less than 25% complete', () => {
      const result = getGoalStatus(100, 1000);
      expect(result.status).toBe('Getting Started');
      expect(result.color).toBe('text-gray-400');
    });
  });

  describe('calculateTotalTargets', () => {
    it('should calculate correct total targets', () => {
      const result = calculateTotalTargets(mockGoals);
      expect(result).toBe(10000); // 5000 + 2000 + 3000
    });

    it('should handle empty array', () => {
      const result = calculateTotalTargets([]);
      expect(result).toBe(0);
    });

    it('should handle invalid amounts', () => {
      const goalsWithInvalid = [
        { target_amount: null },
        { target_amount: 'invalid' },
        { target_amount: 100 }
      ];
      const result = calculateTotalTargets(goalsWithInvalid);
      expect(result).toBe(100);
    });
  });

  describe('calculateTotalSaved', () => {
    it('should calculate correct total saved', () => {
      const result = calculateTotalSaved(mockGoals);
      expect(result).toBe(7300); // 2500 + 1800 + 3000
    });

    it('should handle empty array', () => {
      const result = calculateTotalSaved([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateOverallProgress', () => {
    it('should calculate correct overall progress', () => {
      const result = calculateOverallProgress(mockGoals);
      expect(result).toBe(73); // (7300/10000) * 100
    });

    it('should return 0 when no targets', () => {
      const goalsWithNoTargets = [{ target_amount: 0, start_amount: 100 }];
      const result = calculateOverallProgress(goalsWithNoTargets);
      expect(result).toBe(0);
    });

    it('should handle empty array', () => {
      const result = calculateOverallProgress([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateCompletedGoals', () => {
    it('should count completed goals correctly', () => {
      const result = calculateCompletedGoals(mockGoals);
      expect(result).toBe(1); // Only goal3 is completed
    });

    it('should count goals where start_amount >= target_amount as completed', () => {
      const goalsWithCompleted = [
        { start_amount: 1000, target_amount: 1000, completed: false },
        { start_amount: 1200, target_amount: 1000, completed: false },
        { start_amount: 500, target_amount: 1000, completed: false }
      ];
      const result = calculateCompletedGoals(goalsWithCompleted);
      expect(result).toBe(2); // First two are effectively completed
    });
  });

  describe('calculateGoalProgress', () => {
    it('should calculate progress percentage correctly', () => {
      const result = calculateGoalProgress(500, 1000);
      expect(result).toBe(50);
    });

    it('should return 0 when target is 0', () => {
      const result = calculateGoalProgress(100, 0);
      expect(result).toBe(0);
    });

    it('should handle over-achievement', () => {
      const result = calculateGoalProgress(1200, 1000);
      expect(result).toBe(120);
    });
  });

  describe('calculateRemainingAmount', () => {
    it('should calculate remaining amount correctly', () => {
      const result = calculateRemainingAmount(300, 1000);
      expect(result).toBe(700);
    });

    it('should return 0 when goal is achieved', () => {
      const result = calculateRemainingAmount(1000, 1000);
      expect(result).toBe(0);
    });

    it('should return 0 when over-achieved', () => {
      const result = calculateRemainingAmount(1200, 1000);
      expect(result).toBe(0);
    });
  });

  describe('isGoalCompleted', () => {
    it('should return true for explicitly completed goals', () => {
      const goal = { completed: true, start_amount: 500, target_amount: 1000 };
      expect(isGoalCompleted(goal)).toBe(true);
    });

    it('should return true when start_amount >= target_amount', () => {
      const goal = { completed: false, start_amount: 1000, target_amount: 1000 };
      expect(isGoalCompleted(goal)).toBe(true);
    });

    it('should return false for incomplete goals', () => {
      const goal = { completed: false, start_amount: 500, target_amount: 1000 };
      expect(isGoalCompleted(goal)).toBe(false);
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

  describe('isSavingBehindSchedule', () => {
    it('should return true when saving is behind time', () => {
      const goal = {
        start_amount: 250, // 25% saved
        target_amount: 1000,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      };
      const currentDate = new Date('2024-07-01'); // ~50% through year
      
      const result = isSavingBehindSchedule(goal, currentDate);
      expect(result).toBe(true); // 50% time passed but only 25% saved (gap > 15%)
    });

    it('should return false when saving is on track', () => {
      const goal = {
        start_amount: 600, // 60% saved
        target_amount: 1000,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      };
      const currentDate = new Date('2024-07-01'); // ~50% through year
      
      const result = isSavingBehindSchedule(goal, currentDate);
      expect(result).toBe(false); // 50% time passed and 60% saved
    });
  });

  describe('isDeadlineApproaching', () => {
    it('should return true when deadline is approaching with low progress', () => {
      const goal = {
        start_amount: 500, // 50% saved
        target_amount: 1000,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      };
      const currentDate = new Date('2024-12-15'); // Close to end of year
      
      const result = isDeadlineApproaching(goal, currentDate);
      expect(result).toBe(true); // <15% time left, <80% progress
    });

    it('should return false when deadline is approaching but progress is high', () => {
      const goal = {
        start_amount: 900, // 90% saved
        target_amount: 1000,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      };
      const currentDate = new Date('2024-12-15'); // Close to end of year
      
      const result = isDeadlineApproaching(goal, currentDate);
      expect(result).toBe(false); // <15% time left but >80% progress
    });
  });

  describe('getPaginatedGoals', () => {
    it('should paginate goals correctly', () => {
      const result = getPaginatedGoals(mockGoals, 1, 2);
      
      expect(result.goals).toHaveLength(2);
      expect(result.totalCount).toBe(3);
      expect(result.totalPages).toBe(2);
      expect(result.startIndex).toBe(1);
      expect(result.endIndex).toBe(2);
    });

    it('should handle last page correctly', () => {
      const result = getPaginatedGoals(mockGoals, 2, 2);
      
      expect(result.goals).toHaveLength(1);
      expect(result.startIndex).toBe(3);
      expect(result.endIndex).toBe(3);
    });

    it('should handle empty goals array', () => {
      const result = getPaginatedGoals([], 1, 10);
      
      expect(result.goals).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('calculateDailyRequired', () => {
    it('should calculate daily required savings correctly', () => {
      const result = calculateDailyRequired(1000, 100);
      expect(result).toBe(10);
    });

    it('should handle zero days remaining', () => {
      const result = calculateDailyRequired(1000, 0);
      expect(result).toBe(1000);
    });

    it('should handle negative days remaining', () => {
      const result = calculateDailyRequired(1000, -10);
      expect(result).toBe(1000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative savings amounts', () => {
      const status = getGoalStatus(-100, 1000);
      expect(status.status).toBe('Getting Started'); // Negative is treated as 0
    });

    it('should handle goals with zero target', () => {
      const progress = calculateGoalProgress(100, 0);
      expect(progress).toBe(0);
    });

    it('should handle invalid date strings', () => {
      const progress = calculateTimeProgress('invalid-date', '2024-12-31');
      expect(progress).toBe(0);
    });

    it('should handle over-saved goals', () => {
      const remaining = calculateRemainingAmount(1500, 1000);
      expect(remaining).toBe(0); // Should not be negative
    });
  });
}); 