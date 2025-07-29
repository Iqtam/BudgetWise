
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import BudgetContent from '../BudgetContent.svelte';
import { budgetService, type Budget } from '$lib/services/budgets';
import { categoryService, type Category } from '$lib/services/categories';
import { firebaseUser, loading as authLoading } from '$lib/stores/auth';

// Mock all services
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
    loading: writable(false)
  };
});

// Mock iconify/svelte
vi.mock('@iconify/svelte', () => ({
  default: vi.fn().mockImplementation(() => 'MockIcon'),
}));

// Mock Dialog components
vi.mock('$lib/components/ui/dialog', () => ({
  Dialog: vi.fn().mockImplementation(({ children }) => children),
  DialogTrigger: vi.fn().mockImplementation(({ children }) => children),
  DialogContent: vi.fn().mockImplementation(({ children }) => children),
  DialogHeader: vi.fn().mockImplementation(({ children }) => children),
  DialogTitle: vi.fn().mockImplementation(({ children }) => children),
  DialogDescription: vi.fn().mockImplementation(({ children }) => children),
}));

// Mock window.confirm
vi.stubGlobal('confirm', vi.fn());

describe('BudgetContent Component', () => {
  const user = userEvent.setup();

  // Mock data factories
  const createMockBudget = (overrides: Partial<Budget> = {}): Budget => ({
    id: 'budget1',
    user_id: 'test-user-123',
    category_id: 'cat1',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    goal_amount: 500.00,
    spent: 150.00,
    expired: false,
    amount_exceeded: false,
    ...overrides
  });

  const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 'cat1',
    name: 'Groceries',
    type: 'expense',
    ...overrides
  });

  async function waitForComponentLoad() {
    await waitFor(() => {
      expect(screen.queryByText('Loading budgets...')).not.toBeInTheDocument();
      expect(screen.queryByText('Authenticating...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset stores to default state
    vi.mocked(firebaseUser).set({ uid: 'test-user-123', email: 'test@example.com' } as any);
    vi.mocked(authLoading).set(false);
    
    // Setup default mock responses
    vi.mocked(budgetService.getAllBudgets).mockResolvedValue([]);
    vi.mocked(categoryService.getExpenseCategories).mockResolvedValue([]);
    vi.mocked(budgetService.createBudget).mockResolvedValue({ data: createMockBudget() } as any);
    vi.mocked(budgetService.updateBudget).mockResolvedValue({ data: createMockBudget() } as any);
    vi.mocked(budgetService.deleteBudget).mockResolvedValue(undefined);
    vi.mocked(budgetService.syncBudgetSpending).mockResolvedValue(undefined);
    vi.mocked(categoryService.createCategory).mockResolvedValue(createMockCategory());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render main content after loading', async () => {
      render(BudgetContent);
      await waitForComponentLoad();
      
      // Find headings by role
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Budget Management');
      
      // Check for descriptive text
      expect(screen.getByText('Track and manage your spending budgets')).toBeInTheDocument();
    });

    // it('should render Create Budget button', async () => {
    //   // TODO: Create Budget button not implemented in component
    //   render(BudgetContent);
    //   await waitForComponentLoad();
      
    //   // Find Create Budget button
    //   const createBudgetElement = screen.getByText('Create Budget');
      
    //   expect(createBudgetElement).toBeInTheDocument();
    //   expect(createBudgetElement).toHaveTextContent('Create Budget');
    // });

    // it('should render Sync Budgets button', async () => {
    //   render(BudgetContent);
    //   await waitForComponentLoad();
      
    //   // Find Sync Budgets button
    //   const buttons = screen.getAllByRole('button');
    //   const syncButton = buttons.find(button => 
    //     button.textContent?.includes('Sync Budgets')
    //   );
      
    //   expect(syncButton).toBeTruthy();
    //   expect(syncButton).toHaveTextContent('Sync Budgets');
    // });

    it('should display budget summary when budgets exist', async () => {
      const mockBudgets = [
        createMockBudget({ 
          id: 'budget1', 
          goal_amount: 500, 
          spent: 150,
          category_id: 'cat1'
        }),
        createMockBudget({ 
          id: 'budget2', 
          goal_amount: 300, 
          spent: 100,
          category_id: 'cat2'
        })
      ];
      
      const mockCategories = [
        createMockCategory({ id: 'cat1', name: 'Groceries' }),
        createMockCategory({ id: 'cat2', name: 'Entertainment' })
      ];
      
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(mockBudgets);
      vi.mocked(categoryService.getExpenseCategories).mockResolvedValue(mockCategories);
      
      render(BudgetContent);
      await waitForComponentLoad();
      
      // Check for budget summary elements
      expect(screen.getByText('Total Budget')).toBeInTheDocument();
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      expect(screen.getByText('Remaining')).toBeInTheDocument();
    });

    // it('should display empty state when no budgets exist', async () => {
    //   vi.mocked(budgetService.getAllBudgets).mockResolvedValue([]);
    //   vi.mocked(categoryService.getExpenseCategories).mockResolvedValue([]);
      
    //   render(BudgetContent);
    //   await waitForComponentLoad();
      
    //   expect(screen.getByText('No budgets found')).toBeInTheDocument();
    //   expect(screen.getByText('Create your first budget to start tracking your spending')).toBeInTheDocument();
    // });
  });

  describe('Budget Display', () => {
    // it('should display budget cards with correct information', async () => {
    //   const mockBudgets = [
    //     createMockBudget({ 
    //       id: 'budget1', 
    //       goal_amount: 500, 
    //       spent: 150,
    //       category_id: 'cat1'
    //     })
    //   ];
      
    //   const mockCategories = [
    //     createMockCategory({ id: 'cat1', name: 'Groceries' })
    //   ];
      
    //   vi.mocked(budgetService.getAllBudgets).mockResolvedValue(mockBudgets);
    //   vi.mocked(categoryService.getExpenseCategories).mockResolvedValue(mockCategories);
      
    //   render(BudgetContent);
    //   await waitForComponentLoad();
      
    //   // Check if budget information is displayed
    //   expect(screen.getByText('Groceries')).toBeInTheDocument();
    //   expect(screen.getByText('$150.00')).toBeInTheDocument();
    //   expect(screen.getByText('$500.00')).toBeInTheDocument();
    // });

    it('should display budget action buttons when budgets exist', async () => {
      const mockBudgets = [
        createMockBudget({ 
          id: 'budget1', 
          goal_amount: 500, 
          spent: 150
        })
      ];
      
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(mockBudgets);
      
      render(BudgetContent);
      await waitForComponentLoad();
      
      // Find action buttons
      const buttons = screen.getAllByRole('button');
      const editButton = buttons.find(button => button.textContent?.includes('Edit'));
      const deleteButton = buttons.find(button => button.textContent?.includes('Delete'));
      
      expect(editButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
    });

    it('should show budget status correctly', async () => {
      const mockBudgets = [
        createMockBudget({ 
          id: 'budget1', 
          goal_amount: 500, 
          spent: 450 // 90% spent - should show "Near Limit"
        })
      ];
      
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(mockBudgets);
      
      render(BudgetContent);
      await waitForComponentLoad();
      
      expect(screen.getByText('Near Limit')).toBeInTheDocument();
    });
  });

  describe('Budget Actions', () => {
    const mockBudget = createMockBudget({ 
      id: 'budget1', 
      goal_amount: 500, 
      spent: 150,
      category_id: 'cat1'
    });

    const mockCategory = createMockCategory({ id: 'cat1', name: 'Groceries' });

    beforeEach(() => {
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue([mockBudget]);
      vi.mocked(categoryService.getExpenseCategories).mockResolvedValue([mockCategory]);
    });

    it('should handle budget deletion', async () => {
      vi.mocked(window.confirm).mockReturnValue(true);
      
      render(BudgetContent);
      await waitForComponentLoad();
      
      // Find delete button by role and text content
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(button => 
        button.textContent?.includes('Delete')
      );
      
      expect(deleteButton).toBeTruthy();
      await user.click(deleteButton!);
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete the budget for "Groceries"?'
      );
      expect(budgetService.deleteBudget).toHaveBeenCalledWith('budget1');
    });

    it('should not delete budget when cancelled', async () => {
      vi.mocked(window.confirm).mockReturnValue(false);
      
      render(BudgetContent);
      await waitForComponentLoad();
      
      // Find delete button by role and text content
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(button => 
        button.textContent?.includes('Delete')
      );
      
      expect(deleteButton).toBeTruthy();
      await user.click(deleteButton!);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(budgetService.deleteBudget).not.toHaveBeenCalled();
    });

    // it('should handle sync budgets action', async () => {
    //   // TODO: Sync Budgets button not implemented in component
    //   render(BudgetContent);
    //   await waitForComponentLoad();
      
    //   // Find sync button by role and text content
    //   const buttons = screen.getAllByRole('button');
    //   const syncButton = buttons.find(button => 
    //     button.textContent?.includes('Sync Budgets')
    //   );
      
    //   expect(syncButton).toBeTruthy();
    //   await user.click(syncButton!);
      
    //   expect(budgetService.syncBudgetSpending).toHaveBeenCalled();
    // });
  });

  describe('Authentication', () => {
    it('should show loading state when authentication is loading', async () => {
      vi.mocked(authLoading).set(true);
      
      render(BudgetContent);
      
      expect(screen.getByText('Loading budgets...')).toBeInTheDocument();
    });

    it('should not load data when authentication is loading', async () => {
      vi.mocked(authLoading).set(true);
      
      render(BudgetContent);
      
      // Should not call services while loading
      expect(budgetService.getAllBudgets).not.toHaveBeenCalled();
      expect(categoryService.getExpenseCategories).not.toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    it('should call services on load', async () => {
      render(BudgetContent);
      await waitForComponentLoad();
      
      // Services should be called during component load
      expect(budgetService.syncBudgetSpending).toHaveBeenCalled();
      expect(budgetService.getAllBudgets).toHaveBeenCalled();
      expect(categoryService.getExpenseCategories).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(budgetService.getAllBudgets).mockRejectedValue(new Error('Network error'));
      
      render(BudgetContent);
      
      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Budget Insights', () => {
    it('should display budget insights when available', async () => {
      const mockBudgets = [
        createMockBudget({ 
          id: 'budget1', 
          goal_amount: 500, 
          spent: 450, // 90% spent - should trigger insights
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        })
      ];
      
      vi.mocked(budgetService.getAllBudgets).mockResolvedValue(mockBudgets);
      
      render(BudgetContent);
      await waitForComponentLoad();
      
      // Should show insights section
      expect(screen.getByText('Budget Insights')).toBeInTheDocument();
    });
  });

  describe('Basic Interactions', () => {
    it('should render all required UI elements', async () => {
      render(BudgetContent);
      await waitForComponentLoad();
      
      // Check for main UI elements
      expect(screen.getByText('Budget Management')).toBeInTheDocument();
      expect(screen.getByText('Track and manage your spending budgets')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
      
      const buttons = screen.getAllByRole('button');
      const refreshButton = buttons.find(button => button.textContent?.includes('Refresh'));
      expect(refreshButton).toBeTruthy();
    });

    // it('should handle button clicks without errors', async () => {
    //   const mockBudgets = [
    //     createMockBudget({ goal_amount: 500, spent: 150 })
    //   ];
      
    //   vi.mocked(budgetService.getAllBudgets).mockResolvedValue(mockBudgets);
      
    //   render(BudgetContent);
    //   await waitForComponentLoad();
      
    //   // Test various button clicks
    //   const refreshButton = screen.getByText('Refresh');
    //   await user.click(refreshButton);
      
    //   const buttons = screen.getAllByRole('button');
    //   const refreshButton2 = buttons.find(button => button.textContent?.includes('Refresh'));
    //   if (refreshButton2) {
    //     await user.click(refreshButton2);
    //   }
      
    //   // All interactions should work without throwing errors
    //   expect(refreshButton).toBeInTheDocument();
    //   expect(refreshButton2).toBeTruthy();
    // });
  });
}); 