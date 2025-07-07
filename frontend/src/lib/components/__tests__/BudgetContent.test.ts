
console.log('✅ BudgetContent test file loaded');

import { describe, it, expect, beforeEach, vi, afterEach, type MockedFunction } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import BudgetContent from '../BudgetContent.svelte';
import type { Budget } from '$lib/services/budgets';
import type { Category } from '$lib/services/categories';

// Mock the services at module level
const mockBudgetService = {
  getAllBudgets: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
  syncBudgetSpending: vi.fn()
};

const mockCategoryService = {
  getExpenseCategories: vi.fn(),
  createCategory: vi.fn()
};

vi.mock('$lib/services/budgets', () => ({
  budgetService: mockBudgetService,
  BudgetService: vi.fn().mockImplementation(() => mockBudgetService)
}));

vi.mock('$lib/services/categories', () => ({
  categoryService: mockCategoryService,
  CategoryService: vi.fn().mockImplementation(() => mockCategoryService)
}));

// Mock Svelte stores
vi.mock('$lib/stores/auth', async () => {
  const { writable } = await vi.importActual<typeof import('svelte/store')>('svelte/store');
  return {
    firebaseUser: writable({ uid: 'test-user-123', email: 'test@example.com' }),
    backendUser: writable({ id: 'test-user-123', email: 'test@example.com', role: 'user' }),
    loading: writable(false)
  };
});

// Mock data
const mockCategories: Category[] = [
  { id: 'cat1', name: 'Groceries', type: 'expense' },
  { id: 'cat2', name: 'Entertainment', type: 'expense' },
  { id: 'cat3', name: 'Transportation', type: 'expense' },
  { id: 'cat4', name: 'Utilities', type: 'expense' }
];

const mockBudgets: Budget[] = [
  {
    id: 'budget1',
    user_id: 'test-user-123',
    category_id: 'cat1',
    goal_amount: 500,
    spent: 350,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    expired: false,
    amount_exceeded: false
  },
  {
    id: 'budget2',
    user_id: 'test-user-123',
    category_id: 'cat2',
    goal_amount: 200,
    spent: 180,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    expired: false,
    amount_exceeded: false
  },
  {
    id: 'budget3',
    user_id: 'test-user-123',
    category_id: 'cat3',
    goal_amount: 300,
    spent: 320,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    expired: false,
    amount_exceeded: true
  },
  {
    id: 'budget4',
    user_id: 'test-user-123',
    category_id: 'cat4',
    goal_amount: 150,
    spent: 75,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    expired: false,
    amount_exceeded: false
  }
];

describe('BudgetContent Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementations
    mockBudgetService.getAllBudgets.mockResolvedValue(mockBudgets);
    mockCategoryService.getExpenseCategories.mockResolvedValue(mockCategories);
    mockBudgetService.syncBudgetSpending.mockResolvedValue(undefined);
    mockBudgetService.createBudget.mockResolvedValue({ id: 'new-budget' });
    mockBudgetService.updateBudget.mockResolvedValue(undefined);
    mockBudgetService.deleteBudget.mockResolvedValue(undefined);
    mockCategoryService.createCategory.mockResolvedValue({ 
      id: 'new-cat', 
      name: 'New Category', 
      type: 'expense' 
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================
  // COMPONENT RENDERING TESTS
  // =====================
  
  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      render(BudgetContent);
      expect(screen.getByText('Loading budgets...')).toBeInTheDocument();
    });

    it('should render budget summary cards after loading', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Total Budget')).toBeInTheDocument();
        expect(screen.getByText('Total Spent')).toBeInTheDocument();
        expect(screen.getByText('Remaining')).toBeInTheDocument();
        expect(screen.getByText('Budgets Near Limit')).toBeInTheDocument();
      });
    });

    it('should display budget list after loading', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Groceries')).toBeInTheDocument();
        expect(screen.getByText('Entertainment')).toBeInTheDocument();
        expect(screen.getByText('Transportation')).toBeInTheDocument();
        expect(screen.getByText('Utilities')).toBeInTheDocument();
      });
    });

    it('should show correct budget status badges', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('On Track')).toBeInTheDocument(); // Groceries: 70%
        expect(screen.getByText('Near Limit')).toBeInTheDocument(); // Entertainment: 90%
        expect(screen.getByText('Over Budget')).toBeInTheDocument(); // Transportation: 107%
      });
    });

    it('should display action buttons', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
        expect(screen.getByText('Refresh Data')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // BUDGET CALCULATIONS TESTS
  // =====================
  
  describe('Budget Calculations', () => {
    it('should display correct budget summary calculations', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        // Total budget: 500 + 200 + 300 + 150 = 1150
        expect(screen.getByText('$1,150.00')).toBeInTheDocument();
        
        // Total spent: 350 + 180 + 320 + 75 = 925
        expect(screen.getByText('$925.00')).toBeInTheDocument();
        
        // Remaining: 1150 - 925 = 225
        expect(screen.getByText('$225.00')).toBeInTheDocument();
        
        // Near limit count: Entertainment (90%) = 1
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should show correct progress bars', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        // Check for progress bars with different values
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });
  });

  // =====================
  // BUDGET CREATION TESTS
  // =====================
  
  describe('Budget Creation', () => {
    it('should open create budget dialog when Add Budget button is clicked', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      
      expect(screen.getByText('Create New Budget')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Budget Amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    it('should create a new budget with valid data', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      // Open dialog
      await user.click(screen.getByText('Add Budget'));
      
      // Fill form
      await user.selectOptions(screen.getByLabelText('Category'), 'cat1');
      await user.type(screen.getByLabelText('Budget Amount'), '600');
      await user.type(screen.getByLabelText('Start Date'), '2024-02-01');
      await user.type(screen.getByLabelText('End Date'), '2024-02-29');
      
      // Submit form
      await user.click(screen.getByText('Create Budget'));
      
      await waitFor(() => {
        expect(mockBudgetService.createBudget).toHaveBeenCalledWith({
          category_id: 'cat1',
          start_date: '2024-02-01',
          end_date: '2024-02-29',
          goal_amount: 600
        });
      });
    });

    it('should show validation error for end date before start date', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      
      // Fill form with invalid dates
      await user.selectOptions(screen.getByLabelText('Category'), 'cat1');
      await user.type(screen.getByLabelText('Budget Amount'), '600');
      await user.type(screen.getByLabelText('Start Date'), '2024-02-29');
      await user.type(screen.getByLabelText('End Date'), '2024-02-01');
      
      await user.click(screen.getByText('Create Budget'));
      
      expect(screen.getByText('End date must be after the start date')).toBeInTheDocument();
      expect(mockBudgetService.createBudget).not.toHaveBeenCalled();
    });

    it('should show validation error for zero or negative budget amount', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      
      // Fill form with invalid amount
      await user.selectOptions(screen.getByLabelText('Category'), 'cat1');
      await user.type(screen.getByLabelText('Budget Amount'), '-100');
      await user.type(screen.getByLabelText('Start Date'), '2024-02-01');
      await user.type(screen.getByLabelText('End Date'), '2024-02-29');
      
      await user.click(screen.getByText('Create Budget'));
      
      expect(screen.getByText('Budget amount must be greater than 0')).toBeInTheDocument();
      expect(mockBudgetService.createBudget).not.toHaveBeenCalled();
    });

    it('should show validation error for missing required fields', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      
      // Submit without filling required fields
      await user.click(screen.getByText('Create Budget'));
      
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
      expect(mockBudgetService.createBudget).not.toHaveBeenCalled();
    });
  });

  // =====================
  // CATEGORY MANAGEMENT TESTS
  // =====================
  
  describe('Category Management', () => {
    it('should open new category dialog', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      await user.click(screen.getByText('Add New Category'));
      
      expect(screen.getByText('Add New Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
    });

    it('should create a new category', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      await user.click(screen.getByText('Add New Category'));
      
      await user.type(screen.getByLabelText('Category Name'), 'New Test Category');
      await user.click(screen.getByText('Create Category'));
      
      await waitFor(() => {
        expect(mockCategoryService.createCategory).toHaveBeenCalledWith({
          name: 'New Test Category',
          type: 'expense'
        });
      });
    });

    it('should show error for empty category name', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      await user.click(screen.getByText('Add New Category'));
      await user.click(screen.getByText('Create Category'));
      
      // Should show visual error indication (red border or similar)
      const input = screen.getByLabelText('Category Name');
      expect(input).toHaveClass(/error|border-red/);
    });
  });

  // =====================
  // BUDGET EDITING TESTS
  // =====================
  
  describe('Budget Editing', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Groceries')).toBeInTheDocument();
      });
      
      // Find and click edit button for first budget
      const editButtons = screen.getAllByLabelText(/edit|pencil/i);
      await user.click(editButtons[0]);
      
      expect(screen.getByText('Edit Budget')).toBeInTheDocument();
      expect(screen.getByDisplayValue('500')).toBeInTheDocument(); // Current budget amount
    });

    it('should update budget with new values', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Groceries')).toBeInTheDocument();
      });
      
      const editButtons = screen.getAllByLabelText(/edit|pencil/i);
      await user.click(editButtons[0]);
      
      // Update budget amount
      const amountInput = screen.getByDisplayValue('500');
      await user.clear(amountInput);
      await user.type(amountInput, '750');
      
      await user.click(screen.getByText('Update Budget'));
      
      await waitFor(() => {
        expect(mockBudgetService.updateBudget).toHaveBeenCalledWith('budget1', {
          category_id: 'cat1',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          goal_amount: 750
        });
      });
    });
  });

  // =====================
  // BUDGET DELETION TESTS
  // =====================
  
  describe('Budget Deletion', () => {
    it('should delete budget after confirmation', async () => {
      // Mock window.confirm
      vi.stubGlobal('confirm', vi.fn(() => true));
      
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Groceries')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByLabelText(/delete|trash/i);
      await user.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(mockBudgetService.deleteBudget).toHaveBeenCalledWith('budget1');
      });
      
      vi.unstubAllGlobals();
    });

    it('should not delete budget if confirmation is cancelled', async () => {
      // Mock window.confirm to return false
      vi.stubGlobal('confirm', vi.fn(() => false));
      
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Groceries')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByLabelText(/delete|trash/i);
      await user.click(deleteButtons[0]);
      
      expect(mockBudgetService.deleteBudget).not.toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });
  });

  // =====================
  // DATA SYNCHRONIZATION TESTS
  // =====================
  
  describe('Data Synchronization', () => {
    it('should sync budget spending when refresh button is clicked', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Refresh Data')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Refresh Data'));
      
      await waitFor(() => {
        expect(mockBudgetService.syncBudgetSpending).toHaveBeenCalled();
        expect(mockBudgetService.getAllBudgets).toHaveBeenCalledTimes(2); // Initial load + refresh
      });
    });

    it('should sync budget spending on component mount', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(mockBudgetService.syncBudgetSpending).toHaveBeenCalled();
        expect(mockBudgetService.getAllBudgets).toHaveBeenCalled();
      });
    });
  });

  // =====================
  // PAGINATION TESTS
  // =====================
  
  describe('Pagination', () => {
    it('should handle pagination correctly with many budgets', async () => {
      // Create more budgets to test pagination
      const manyBudgets = Array.from({ length: 25 }, (_, i) => ({
        id: `budget${i + 1}`,
        user_id: 'test-user-123',
        category_id: 'cat1',
        goal_amount: 100,
        spent: 50,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        expired: false,
        amount_exceeded: false
      }));
      
      mockBudgetService.getAllBudgets.mockResolvedValue(manyBudgets);
      
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText(/Showing 1 to 10 of 25/)).toBeInTheDocument();
      });
      
      // Test next page navigation
      const nextButton = screen.getByText(/Next|>/);
      await user.click(nextButton);
      
      expect(screen.getByText(/Showing 11 to 20 of 25/)).toBeInTheDocument();
    });
  });

  // =====================
  // ERROR HANDLING TESTS
  // =====================
  
  describe('Error Handling', () => {
    it('should display error message when budget loading fails', async () => {
      mockBudgetService.getAllBudgets.mockRejectedValue(new Error('Network error'));
      
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should display error message when budget creation fails', async () => {
      mockBudgetService.createBudget.mockRejectedValue(new Error('Creation failed'));
      
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      
      await user.selectOptions(screen.getByLabelText('Category'), 'cat1');
      await user.type(screen.getByLabelText('Budget Amount'), '600');
      await user.type(screen.getByLabelText('Start Date'), '2024-02-01');
      await user.type(screen.getByLabelText('End Date'), '2024-02-29');
      
      await user.click(screen.getByText('Create Budget'));
      
      await waitFor(() => {
        expect(screen.getByText('Creation failed')).toBeInTheDocument();
      });
    });

    it('should display error message when category creation fails', async () => {
      mockCategoryService.createCategory.mockRejectedValue(new Error('Category creation failed'));
      
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      await user.click(screen.getByText('Add New Category'));
      
      await user.type(screen.getByLabelText('Category Name'), 'Test Category');
      await user.click(screen.getByText('Create Category'));
      
      await waitFor(() => {
        expect(screen.getByText('Category creation failed')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // SUCCESS MESSAGES TESTS
  // =====================
  
  describe('Success Messages', () => {
    it('should show success message after budget creation', async () => {
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      
      await user.selectOptions(screen.getByLabelText('Category'), 'cat1');
      await user.type(screen.getByLabelText('Budget Amount'), '600');
      await user.type(screen.getByLabelText('Start Date'), '2024-02-01');
      await user.type(screen.getByLabelText('End Date'), '2024-02-29');
      
      await user.click(screen.getByText('Create Budget'));
      
      await waitFor(() => {
        expect(screen.getByText('Budget created successfully')).toBeInTheDocument();
      });
    });

    it('should auto-hide success messages after 3 seconds', async () => {
      vi.useFakeTimers();
      
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('Add Budget')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Budget'));
      await user.selectOptions(screen.getByLabelText('Category'), 'cat1');
      await user.type(screen.getByLabelText('Budget Amount'), '600');
      await user.type(screen.getByLabelText('Start Date'), '2024-02-01');
      await user.type(screen.getByLabelText('End Date'), '2024-02-29');
      await user.click(screen.getByText('Create Budget'));
      
      await waitFor(() => {
        expect(screen.getByText('Budget created successfully')).toBeInTheDocument();
      });
      
      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000);
      
      await waitFor(() => {
        expect(screen.queryByText('Budget created successfully')).not.toBeInTheDocument();
      });
      
      vi.useRealTimers();
    });
  });

  // =====================
  // UTILITY FUNCTIONS TESTS
  // =====================
  
  describe('Utility Functions', () => {
    it('should handle missing category gracefully', async () => {
      const budgetWithoutCategory = {
        ...mockBudgets[0],
        category_id: undefined
      };
      
      mockBudgetService.getAllBudgets.mockResolvedValue([budgetWithoutCategory]);
      
      render(BudgetContent);
      
      await waitFor(() => {
        expect(screen.getByText('No Category')).toBeInTheDocument();
      });
    });

    it('should handle null or undefined spent amounts', async () => {
      const budgetWithNullSpent = {
        ...mockBudgets[0],
        spent: null as any
      };
      
      mockBudgetService.getAllBudgets.mockResolvedValue([budgetWithNullSpent]);
      
      render(BudgetContent);
      
      await waitFor(() => {
        // Should default to 0 and not crash
        expect(screen.getByText('$0.00')).toBeInTheDocument();
      });
    });
  });
}); 