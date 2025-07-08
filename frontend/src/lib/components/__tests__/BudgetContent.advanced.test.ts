import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';

import BudgetContent from '../BudgetContent.svelte';
import { budgetService, type Budget } from '$lib/services/budgets';
import { categoryService, type Category } from '$lib/services/categories';
import { firebaseUser, loading as authLoading } from '$lib/stores/auth';

// Mock the services
vi.mock('$lib/services/budgets', () => ({
  budgetService: {
    getAllBudgets: vi.fn(),
    createBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
    syncBudgetSpending: vi.fn()
  }
}));

vi.mock('$lib/services/categories', () => ({
  categoryService: {
    getExpenseCategories: vi.fn(),
    createCategory: vi.fn()
  }
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

// Mock Icon component
vi.mock('@iconify/svelte', () => ({
  default: vi.fn().mockImplementation((props) => `<svg data-icon="${props?.icon || 'default'}"></svg>`),
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true,
});

// Test data
const mockCategories: Category[] = [
  { id: 'cat1', name: 'Groceries', type: 'expense' },
  { id: 'cat2', name: 'Entertainment', type: 'expense' },
  { id: 'cat3', name: 'Transportation', type: 'expense' },
  { id: 'cat4', name: 'Utilities', type: 'expense' },
  { id: 'cat5', name: 'Healthcare', type: 'expense' }
];

const createMockBudget = (overrides: Partial<Budget> = {}): Budget => ({
  id: 'budget1',
  user_id: 'test-user-123',
  category_id: 'cat1',
  goal_amount: 500,
  spent: 350,
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  expired: false,
  amount_exceeded: false,
  ...overrides
});

// Helper function to wait for component to finish loading
async function waitForComponentLoad() {
  await tick();
  await waitFor(() => {
    expect(screen.queryByText('Loading budgets...')).not.toBeInTheDocument();
  }, { timeout: 5000 });
}

describe('BudgetContent Advanced Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementations
    vi.mocked(budgetService.getAllBudgets).mockResolvedValue([]);
    vi.mocked(categoryService.getExpenseCategories).mockResolvedValue(mockCategories);
    vi.mocked(budgetService.syncBudgetSpending).mockResolvedValue(undefined);
    vi.mocked(budgetService.createBudget).mockResolvedValue({ id: 'new-budget', spent: 0 });
    vi.mocked(budgetService.updateBudget).mockResolvedValue(undefined);
    vi.mocked(budgetService.deleteBudget).mockResolvedValue(undefined);
    vi.mocked(categoryService.createCategory).mockResolvedValue({ 
      id: 'new-cat', 
      name: 'New Category', 
      type: 'expense' 
    });

    // Setup auth mocks - stores are already mocked at module level

    // Reset window.confirm
    vi.mocked(window.confirm).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================
  // BUDGET INSIGHTS TESTS
  // =====================
  
  describe('Budget Insights', () => {
    it('should show overspending forecast alert', async () => {
      const overspendingBudget = createMockBudget({
        id: 'budget-overspend',
        category_id: 'cat1',
        goal_amount: 1000,
        spent: 800,
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([overspendingBudget]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('Overspending Forecast')).toBeInTheDocument();
        expect(screen.getByText(/At your current pace/)).toBeInTheDocument();
      });
    });

    it('should show budget exceeded alert', async () => {
      const exceededBudget = createMockBudget({
        id: 'budget-exceeded',
        category_id: 'cat1',
        goal_amount: 500,
        spent: 600,
        amount_exceeded: true
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([exceededBudget]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('Budget Exceeded')).toBeInTheDocument();
        expect(screen.getByText(/budget has been exceeded/)).toBeInTheDocument();
      });
    });

    it('should show near limit alert', async () => {
      const nearLimitBudget = createMockBudget({
        id: 'budget-near-limit',
        category_id: 'cat1',
        goal_amount: 1000,
        spent: 850 // 85% of budget
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([nearLimitBudget]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('Budget Alert')).toBeInTheDocument();
        expect(screen.getByText(/budget is at 85% capacity/)).toBeInTheDocument();
      });
    });

    it('should show good progress insight', async () => {
      const goodProgressBudget = createMockBudget({
        id: 'budget-good-progress',
        category_id: 'cat1',
        goal_amount: 1000,
        spent: 200, // 20% spent
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([goodProgressBudget]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText(/Good Progress|Great Progress/)).toBeInTheDocument();
        expect(screen.getByText(/Excellent pacing/)).toBeInTheDocument();
      });
    });

    it('should show reallocation tip', async () => {
      const underutilizedBudget = createMockBudget({
        id: 'budget-underutilized',
        category_id: 'cat1',
        goal_amount: 1000,
        spent: 100 // 10% spent
      });

      const overutilizedBudget = createMockBudget({
        id: 'budget-overutilized',
        category_id: 'cat2',
        goal_amount: 500,
        spent: 450 // 90% spent
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([underutilizedBudget, overutilizedBudget]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('Optimization Tip')).toBeInTheDocument();
        expect(screen.getByText(/Consider reallocating unused funds/)).toBeInTheDocument();
      });
    });

    it('should show all clear when no alerts', async () => {
      const healthyBudget = createMockBudget({
        id: 'budget-healthy',
        category_id: 'cat1',
        goal_amount: 1000,
        spent: 400 // 40% spent
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([healthyBudget]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('All Clear!')).toBeInTheDocument();
        expect(screen.getByText(/No budget alerts at this time/)).toBeInTheDocument();
      });
    });
  });

  // =====================
  // PAGINATION TESTS
  // =====================
  
  describe('Pagination', () => {
    it('should handle pagination with more than 10 budgets', async () => {
      const manyBudgets = Array.from({ length: 25 }, (_, i) => createMockBudget({
        id: `budget-${i}`,
        category_id: `cat${(i % 5) + 1}`,
        goal_amount: 1000 + i * 100,
        spent: 500 + i * 50
      }));

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(manyBudgets);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('Showing 1-10 of 25 budgets')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      });

      // Test next page
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Showing 11-20 of 25 budgets')).toBeInTheDocument();
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
      });

      // Test previous page
      const previousButton = screen.getByText('Previous');
      await user.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText('Showing 1-10 of 25 budgets')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      });
    });

    it('should handle pagination with exact page boundaries', async () => {
      const exactBudgets = Array.from({ length: 20 }, (_, i) => createMockBudget({
        id: `budget-${i}`,
        category_id: `cat${(i % 5) + 1}`,
        goal_amount: 1000 + i * 100,
        spent: 500 + i * 50
      }));

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(exactBudgets);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('Showing 1-10 of 20 budgets')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      });

      // Go to second page
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Showing 11-20 of 20 budgets')).toBeInTheDocument();
        expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
      });

      // Next button should be disabled
      expect(nextButton).toBeDisabled();
    });

    it('should handle direct page navigation', async () => {
      const manyBudgets = Array.from({ length: 15 }, (_, i) => createMockBudget({
        id: `budget-${i}`,
        category_id: `cat${(i % 5) + 1}`,
        goal_amount: 1000 + i * 100,
        spent: 500 + i * 50
      }));

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(manyBudgets);

      render(BudgetContent);
      await waitForComponentLoad();

      // Click on page 2 directly
      const page2Button = screen.getByText('2');
      await user.click(page2Button);

      await waitFor(() => {
        expect(screen.getByText('Showing 11-15 of 15 budgets')).toBeInTheDocument();
        expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // ERROR HANDLING TESTS
  // =====================
  
  describe('Error Handling', () => {
    it('should handle budget service errors gracefully', async () => {
      vi.mocked(budgetService.getAllBudgets).mockRejectedValue(new Error('Network error'));

      render(BudgetContent);
      await tick();

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle category service errors gracefully', async () => {
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([]);
      vi.mocked(categoryService.getExpenseCategories).mockRejectedValue(new Error('Failed to load categories'));

      render(BudgetContent);
      await tick();

      await waitFor(() => {
        expect(screen.getByText('Failed to load categories')).toBeInTheDocument();
      });
    });

    it('should handle create budget errors', async () => {
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([]);
      vi.mocked(budgetService.createBudget).mockRejectedValue(new Error('Failed to create budget'));

      render(BudgetContent);
      await waitForComponentLoad();

      // Open create dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Fill form
      await user.type(screen.getByPlaceholderText('0.00'), '500');
      await user.type(screen.getByDisplayValue('2024-01-01'), '2024-01-01');
      await user.type(screen.getByLabelText('End Date'), '2024-01-31');

      // Submit form
      const submitButton = screen.getByText('Create Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create budget')).toBeInTheDocument();
      });
    });

    it('should handle form validation errors', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open create dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Submit without filling required fields
      const submitButton = screen.getByText('Create Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
      });
    });

    it('should validate end date after start date', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open create dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Fill form with invalid dates
      await user.type(screen.getByPlaceholderText('0.00'), '500');
      await user.clear(screen.getByLabelText('Start Date'));
      await user.type(screen.getByLabelText('Start Date'), '2024-01-31');
      await user.type(screen.getByLabelText('End Date'), '2024-01-01');

      // Submit form
      const submitButton = screen.getByText('Create Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('End date must be after the start date')).toBeInTheDocument();
      });
    });

    it('should validate positive budget amount', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open create dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Fill form with negative amount
      await user.type(screen.getByPlaceholderText('0.00'), '-100');
      await user.type(screen.getByLabelText('End Date'), '2024-01-31');

      // Submit form
      const submitButton = screen.getByText('Create Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Budget amount must be greater than 0')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // CATEGORY MANAGEMENT TESTS
  // =====================
  
  describe('Category Management', () => {
    it('should create new category successfully', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open create budget dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Click add category button
      const addCategoryButton = screen.getByRole('button', { name: '' }); // The + button
      await user.click(addCategoryButton);

      // Fill category name
      await user.type(screen.getByPlaceholderText('Enter category name'), 'New Test Category');

      // Submit category form
      const addButton = screen.getByText('Add');
      await user.click(addButton);

      await waitFor(() => {
        expect(vi.mocked(categoryService.createCategory)).toHaveBeenCalledWith({
          name: 'New Test Category',
          type: 'expense'
        });
      });
    });

    it('should handle category name validation', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open create budget dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Click add category button
      const addCategoryButton = screen.getByRole('button', { name: '' }); // The + button
      await user.click(addCategoryButton);

      // Submit without entering name
      const addButton = screen.getByText('Add');
      await user.click(addButton);

      // Should show validation error visually (categoryNameError state)
      await waitFor(() => {
        const categoryInput = screen.getByPlaceholderText('Enter category name');
        expect(categoryInput).toHaveClass('border-red-500');
      });
    });

    it('should handle category creation errors', async () => {
      vi.mocked(categoryService.createCategory).mockRejectedValue(new Error('Category already exists'));

      render(BudgetContent);
      await waitForComponentLoad();

      // Open create budget dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Click add category button
      const addCategoryButton = screen.getByRole('button', { name: '' }); // The + button
      await user.click(addCategoryButton);

      // Fill category name
      await user.type(screen.getByPlaceholderText('Enter category name'), 'Duplicate Category');

      // Submit category form
      const addButton = screen.getByText('Add');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Category already exists')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // BUDGET CALCULATIONS TESTS
  // =====================
  
  describe('Budget Calculations', () => {
    it('should calculate total budget correctly', async () => {
      const budgets = [
        createMockBudget({ id: 'b1', goal_amount: 1000, spent: 500 }),
        createMockBudget({ id: 'b2', goal_amount: 2000, spent: 1000 }),
        createMockBudget({ id: 'b3', goal_amount: 500, spent: 250 })
      ];

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(budgets);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('$3,500')).toBeInTheDocument(); // Total budget
        expect(screen.getAllByText('$1,750')).toHaveLength(2); // Total spent and remaining
      });
    });

    it('should handle zero and negative budget amounts', async () => {
      const budgets = [
        createMockBudget({ id: 'b1', goal_amount: 0, spent: 0 }),
        createMockBudget({ id: 'b2', goal_amount: 1000, spent: 1200 }) // Over budget
      ];

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(budgets);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('$1,000')).toBeInTheDocument(); // Total budget
        expect(screen.getByText('$1,200')).toBeInTheDocument(); // Total spent
        expect(screen.getByText('-$200')).toBeInTheDocument(); // Negative remaining
      });
    });

    it('should handle null and undefined spent amounts', async () => {
      const budgets = [
        { ...createMockBudget({ id: 'b1', goal_amount: 1000 }), spent: null as any },
        { ...createMockBudget({ id: 'b2', goal_amount: 500 }), spent: undefined as any }
      ];

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(budgets as Budget[]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getAllByText('$1,500')).toHaveLength(2); // Total budget and remaining
        expect(screen.getAllByText('$0')).toHaveLength(1); // Total spent should be 0
      });
    });

    it('should calculate budget status correctly', async () => {
      const budgets = [
        createMockBudget({ id: 'b1', goal_amount: 1000, spent: 500 }), // 50% - On Track
        createMockBudget({ id: 'b2', goal_amount: 1000, spent: 850 }), // 85% - Near Limit
        createMockBudget({ id: 'b3', goal_amount: 1000, spent: 1100 }), // 110% - Over Budget
        createMockBudget({ id: 'b4', goal_amount: 0, spent: 100 }) // No Budget
      ];

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(budgets);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('On Track')).toBeInTheDocument();
        expect(screen.getByText('Near Limit')).toBeInTheDocument();
        expect(screen.getByText('Over Budget')).toBeInTheDocument();
        expect(screen.getByText('No Budget')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // BUDGET CRUD OPERATIONS TESTS
  // =====================
  
  describe('Budget Creation', () => {
    it('should create budget with category successfully', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open create dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Budget')).toBeInTheDocument();
      });

      // Select category
      const categorySelect = screen.getByRole('combobox');
      await user.selectOptions(categorySelect, 'cat1');

      // Fill form
      await user.type(screen.getByPlaceholderText('0.00'), '1500');
      await user.clear(screen.getByLabelText('Start Date'));
      await user.type(screen.getByLabelText('Start Date'), '2024-01-01');
      await user.type(screen.getByLabelText('End Date'), '2024-01-31');

      // Submit form (get the last "Create Budget" button which should be the submit button)
      const submitButtons = screen.getAllByRole('button', { name: /create budget/i });
      const submitButton = submitButtons[submitButtons.length - 1];
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(budgetService.createBudget)).toHaveBeenCalledWith({
          category_id: 'cat1',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          goal_amount: 1500,
          spent: 0
        });
        expect(vi.mocked(budgetService.syncBudgetSpending)).toHaveBeenCalled();
      });
    });

    it('should create budget without category', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open create dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Fill form without selecting category
      await user.type(screen.getByPlaceholderText('0.00'), '800');
      await user.clear(screen.getByLabelText('Start Date'));
      await user.type(screen.getByLabelText('Start Date'), '2024-02-01');
      await user.type(screen.getByLabelText('End Date'), '2024-02-29');

      // Submit form (get the last "Create Budget" button which should be the submit button)
      const submitButtons = screen.getAllByRole('button', { name: /create budget/i });
      const submitButton = submitButtons[submitButtons.length - 1];
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(budgetService.createBudget)).toHaveBeenCalledWith({
          category_id: undefined,
          start_date: '2024-02-01',
          end_date: '2024-02-29',
          goal_amount: 800,
          spent: 0
        });
      });
    });

    it('should show success message after creating budget', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open create dialog and fill form
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      await user.type(screen.getByPlaceholderText('0.00'), '1000');
      await user.type(screen.getByLabelText('End Date'), '2024-12-31');

      const submitButtons = screen.getAllByRole('button', { name: /create budget/i });
      const submitButton = submitButtons[submitButtons.length - 1];
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Budget created successfully')).toBeInTheDocument();
      });
    });

    it('should reset form after successful creation', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open create dialog and fill form
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      const amountInput = screen.getByPlaceholderText('0.00');
      const endDateInput = screen.getByLabelText('End Date');

      await user.type(amountInput, '1000');
      await user.type(endDateInput, '2024-12-31');

      const submitButtons = screen.getAllByRole('button', { name: /create budget/i });
      const submitButton = submitButtons[submitButtons.length - 1];
      await user.click(submitButton);

      // Dialog should close and form should reset
      await waitFor(() => {
        expect(screen.queryByText('Create New Budget')).not.toBeInTheDocument();
      });

      // Reopen dialog to check if form is reset
      await user.click(createButton);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('0.00')).toHaveValue('');
        expect(screen.getByLabelText('End Date')).toHaveValue('');
      });
    });
  });

  describe('Budget Editing', () => {
    it('should open edit dialog with pre-filled data', async () => {
      const budget = createMockBudget({
        id: 'edit-budget',
        category_id: 'cat1',
        goal_amount: 1200,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        spent: 600
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);

      render(BudgetContent);
      await waitForComponentLoad();

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Budget')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2024-01-31')).toBeInTheDocument();
      });
    });

    it('should update budget successfully', async () => {
      const budget = createMockBudget({
        id: 'edit-budget',
        category_id: 'cat1',
        goal_amount: 1200,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        spent: 600
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);

      render(BudgetContent);
      await waitForComponentLoad();

      // Open edit dialog
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Modify budget amount
      const amountInput = screen.getByDisplayValue('1200');
      await user.clear(amountInput);
      await user.type(amountInput, '1500');

      // Modify end date
      const endDateInput = screen.getByDisplayValue('2024-01-31');
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-02-29');

      // Submit changes
      const updateButton = screen.getByRole('button', { name: /update budget/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(vi.mocked(budgetService.updateBudget)).toHaveBeenCalledWith('edit-budget', {
          category_id: 'cat1',
          start_date: '2024-01-01',
          end_date: '2024-02-29',
          goal_amount: 1500
        });
      });
    });

    it('should show success message after updating budget', async () => {
      const budget = createMockBudget({ id: 'edit-budget' });
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);

      render(BudgetContent);
      await waitForComponentLoad();

      // Edit budget
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const updateButton = screen.getByRole('button', { name: /update budget/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Budget updated successfully')).toBeInTheDocument();
      });
    });

    it('should handle edit form validation errors', async () => {
      const budget = createMockBudget({ id: 'edit-budget' });
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);

      render(BudgetContent);
      await waitForComponentLoad();

      // Open edit dialog
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Set invalid dates (end before start)
      const startDateInput = screen.getByDisplayValue('2024-01-01');
      const endDateInput = screen.getByDisplayValue('2024-01-31');

      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-02-01');
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-01-15');

      const updateButton = screen.getByRole('button', { name: /update budget/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('End date must be after the start date')).toBeInTheDocument();
      });
    });

    it('should cancel edit and close dialog', async () => {
      const budget = createMockBudget({ id: 'edit-budget' });
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);

      render(BudgetContent);
      await waitForComponentLoad();

      // Open edit dialog
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Edit Budget')).not.toBeInTheDocument();
      });
    });
  });

  describe('Budget Deletion', () => {
    it('should delete budget with confirmation', async () => {
      const budget = createMockBudget({
        id: 'delete-budget',
        category_id: 'cat1',
        spent: 300
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);
      vi.mocked(window.confirm).mockReturnValue(true);

      render(BudgetContent);
      await waitForComponentLoad();

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete the budget for "Groceries"?'
        );
        expect(vi.mocked(budgetService.deleteBudget)).toHaveBeenCalledWith('delete-budget');
      });
    });

    it('should not delete budget when confirmation is cancelled', async () => {
      const budget = createMockBudget({ id: 'delete-budget' });
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);
      vi.mocked(window.confirm).mockReturnValue(false);

      render(BudgetContent);
      await waitForComponentLoad();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(vi.mocked(budgetService.deleteBudget)).not.toHaveBeenCalled();
      });
    });

    it('should show success message after deletion', async () => {
      const budget = createMockBudget({ id: 'delete-budget' });
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);
      vi.mocked(window.confirm).mockReturnValue(true);

      render(BudgetContent);
      await waitForComponentLoad();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Budget deleted successfully')).toBeInTheDocument();
      });
    });

    it('should handle deletion errors gracefully', async () => {
      const budget = createMockBudget({ id: 'delete-budget' });
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);
      vi.mocked(budgetService.deleteBudget).mockRejectedValue(new Error('Failed to delete budget'));
      vi.mocked(window.confirm).mockReturnValue(true);

      render(BudgetContent);
      await waitForComponentLoad();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete budget')).toBeInTheDocument();
      });
    });

    it('should delete budget from details dialog', async () => {
      const budget = createMockBudget({ id: 'delete-from-details' });
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);
      vi.mocked(window.confirm).mockReturnValue(true);

      render(BudgetContent);
      await waitForComponentLoad();

      // Open details dialog
      const viewDetailsButton = screen.getByText('View Details');
      await user.click(viewDetailsButton);

      // Delete from details dialog
      const deleteFromDetailsButton = screen.getAllByRole('button', { name: /delete/i })[1]; // Second delete button in details
      await user.click(deleteFromDetailsButton);

      await waitFor(() => {
        expect(vi.mocked(budgetService.deleteBudget)).toHaveBeenCalledWith('delete-from-details');
      });
    });
  });

  describe('Form Interactions', () => {
    it('should handle form field changes correctly', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Test amount input
      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '2500.50');
      expect(amountInput).toHaveValue('2500.50');

      // Test date inputs
      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');

      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-03-01');
      expect(startDateInput).toHaveValue('2024-03-01');

      await user.type(endDateInput, '2024-03-31');
      expect(endDateInput).toHaveValue('2024-03-31');
    });

    it('should validate required fields on submit', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      // Try to submit empty form
      const submitButtons = screen.getAllByRole('button', { name: /create budget/i });
      const submitButton = submitButtons[submitButtons.length - 1];
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
      });

      // Should not call create service
      expect(vi.mocked(budgetService.createBudget)).not.toHaveBeenCalled();
    });

    it('should handle decimal amounts correctly', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '1234.56');
      await user.type(screen.getByLabelText('End Date'), '2024-12-31');

      const submitButtons = screen.getAllByRole('button', { name: /create budget/i });
      const submitButton = submitButtons[submitButtons.length - 1];
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(budgetService.createBudget)).toHaveBeenCalledWith(
          expect.objectContaining({ goal_amount: 1234.56 })
        );
      });
    });

    it('should handle large amounts correctly', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      const amountInput = screen.getByPlaceholderText('0.00');
      await user.type(amountInput, '999999.99');
      await user.type(screen.getByLabelText('End Date'), '2024-12-31');

      const submitButtons = screen.getAllByRole('button', { name: /create budget/i });
      const submitButton = submitButtons[submitButtons.length - 1];
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(budgetService.createBudget)).toHaveBeenCalledWith(
          expect.objectContaining({ goal_amount: 999999.99 })
        );
      });
    });
  });

  // =====================
  // DIALOG INTERACTION TESTS
  // =====================
  
  describe('Dialog Interactions', () => {
    it('should open and close create budget dialog', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Open dialog
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Budget')).toBeInTheDocument();
      });

      // Close dialog with escape key
      await user.keyboard('[Escape]');

      await waitFor(() => {
        expect(screen.queryByText('Create New Budget')).not.toBeInTheDocument();
      });
    });

    it('should open and close budget details dialog', async () => {
      const budget = createMockBudget({ id: 'b1', goal_amount: 1000, spent: 500 });
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);

      render(BudgetContent);
      await waitForComponentLoad();

      // Open details dialog
      const viewDetailsButton = screen.getByText('View Details');
      await user.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByText('Budget Details')).toBeInTheDocument();
        expect(screen.getByText('Complete information about this budget')).toBeInTheDocument();
      });

      // Close dialog
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Budget Details')).not.toBeInTheDocument();
      });
    });

    it('should transition from details to edit dialog', async () => {
      const budget = createMockBudget({ id: 'b1', goal_amount: 1000, spent: 500 });
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([budget]);

      render(BudgetContent);
      await waitForComponentLoad();

      // Open details dialog
      const viewDetailsButton = screen.getByText('View Details');
      await user.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByText('Budget Details')).toBeInTheDocument();
      });

      // Click edit from details dialog
      const editFromDetailsButton = screen.getByText('Edit Budget');
      await user.click(editFromDetailsButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Budget')).toBeInTheDocument();
        expect(screen.getByText('Update your budget settings')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // INTEGRATION TESTS
  // =====================
  
  describe('Integration Tests', () => {
    it('should handle complete budget lifecycle', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Create budget
      const createButton = screen.getByText('Create Budget');
      await user.click(createButton);

      await user.type(screen.getByPlaceholderText('0.00'), '1000');
      await user.type(screen.getByLabelText('End Date'), '2024-12-31');

      const submitButton = screen.getByText('Create Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(budgetService.createBudget)).toHaveBeenCalled();
        expect(vi.mocked(budgetService.syncBudgetSpending)).toHaveBeenCalled();
      });
    });

    it('should handle refresh functionality', async () => {
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([]);

      render(BudgetContent);
      await waitForComponentLoad();

      // Click refresh button
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      await waitFor(() => {
        expect(vi.mocked(budgetService.syncBudgetSpending)).toHaveBeenCalled();
      });
    });

    it('should handle authentication state changes', async () => {
      render(BudgetContent);

      // Should load data when auth is ready
      await waitFor(() => {
        expect(vi.mocked(budgetService.getAllBudgets)).toHaveBeenCalled();
      });
    });
  });

  // =====================
  // EDGE CASE TESTS
  // =====================
  
  describe('Edge Cases', () => {
    it('should handle empty budget list', async () => {
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('0 active budgets')).toBeInTheDocument();
        expect(screen.getAllByText('$0')).toHaveLength(3); // Total budget, spent, and remaining
      });
    });

    it('should handle very large budget amounts', async () => {
      const largeBudget = createMockBudget({
        id: 'large-budget',
        goal_amount: 1000000,
        spent: 500000
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([largeBudget]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('$1,000,000')).toBeInTheDocument();
        expect(screen.getAllByText('$500,000')).toHaveLength(2); // Total spent and remaining
      });
    });

    it('should handle budgets with no category', async () => {
      const noCategoryBudget = createMockBudget({
        id: 'no-category',
        category_id: undefined,
        goal_amount: 1000,
        spent: 500
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([noCategoryBudget]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('No Category')).toBeInTheDocument();
      });
    });

    it('should handle budgets with invalid category ID', async () => {
      const invalidCategoryBudget = createMockBudget({
        id: 'invalid-category',
        category_id: 'non-existent-category',
        goal_amount: 1000,
        spent: 500
      });

      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([invalidCategoryBudget]);

      render(BudgetContent);
      await waitForComponentLoad();

      await waitFor(() => {
        expect(screen.getByText('Unknown Category')).toBeInTheDocument();
      });
    });

    it('should handle concurrent operations', async () => {
      render(BudgetContent);
      await waitForComponentLoad();

      // Start multiple operations simultaneously
      const refreshButton = screen.getByText('Refresh');
      const createButton = screen.getByText('Create Budget');

      await user.click(refreshButton);
      await user.click(createButton);

      // Should handle both operations without conflicts
      await waitFor(() => {
        expect(screen.getByText('Create New Budget')).toBeInTheDocument();
      });
    });
  });
}); 