import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import TransactionsContent from '../TransactionsContent.svelte';
import { transactionService, type Transaction } from '$lib/services/transactions';
import { categoryService, type Category } from '$lib/services/categories';
import { balanceService, type Balance } from '$lib/services/balance';
import { ocrService, type OCRResult, type ChatResult } from '$lib/services/ocr';
import { firebaseUser, loading as authLoading } from '$lib/stores/auth';

// Mock all services
vi.mock('$lib/services/transactions', () => ({
  transactionService: {
    getAllTransactions: vi.fn(),
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn()
  }
}));

vi.mock('$lib/services/categories', () => ({
  categoryService: {
    getCategories: vi.fn(),
    createCategory: vi.fn()
  }
}));

vi.mock('$lib/services/balance', () => ({
  balanceService: {
    getBalance: vi.fn(),
    updateBalance: vi.fn()
  }
}));

vi.mock('$lib/services/ocr', () => ({
  ocrService: {
    processReceipt: vi.fn(),
    processChatMessage: vi.fn()
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

// // Mock Dialog components
// vi.mock('$lib/components/ui/dialog', () => ({
//   Dialog: vi.fn().mockImplementation(({ children }) => children),
//   DialogTrigger: vi.fn().mockImplementation(({ children }) => children),
//   DialogContent: vi.fn().mockImplementation(({ children }) => children),
//   DialogHeader: vi.fn().mockImplementation(({ children }) => children),
//   DialogTitle: vi.fn().mockImplementation(({ children }) => children),
//   DialogDescription: vi.fn().mockImplementation(({ children }) => children),
// }));

// // Mock UI components
// vi.mock('$lib/components/ui/button', () => ({
//   Button: vi.fn().mockImplementation(({ children }) => children),
// }));

// vi.mock('$lib/components/ui/tabs', () => ({
//   Tabs: vi.fn().mockImplementation(({ children }) => children),
//   TabsList: vi.fn().mockImplementation(({ children }) => children),
//   TabsTrigger: vi.fn().mockImplementation(({ children }) => children),
//   TabsContent: vi.fn().mockImplementation(({ children }) => children),
// }));

// Mock window.confirm
vi.stubGlobal('confirm', vi.fn());

describe('TransactionsContent Component', () => {
  const user = userEvent.setup();

  // Mock data factories
  const createMockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    id: 'tx1',
    user_id: 'test-user-123',
    description: 'Test Transaction',
    amount: -25.50,
    type: 'expense',
    category_id: 'cat1',
    date: '2024-01-01',
    event: undefined,
    recurrence: undefined,
    confirmed: true,
    ...overrides
  });

  const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 'cat1',
    name: 'Groceries',
    type: 'expense',
    ...overrides
  });

  const createMockBalance = (): Balance => ({
    id: 'bal1',
    user_id: 'test-user-123',
    balance: '1000.00'
  });

  async function waitForComponentLoad() {
    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
      expect(screen.queryByText('Authenticating...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset stores to default state
    vi.mocked(firebaseUser).set({ uid: 'test-user-123', email: 'test@example.com' } as any);
    vi.mocked(authLoading).set(false);
    
    // Setup default mock responses
    vi.mocked(transactionService.getAllTransactions).mockResolvedValue([]);
    vi.mocked(categoryService.getCategories).mockResolvedValue([]);
    vi.mocked(balanceService.getBalance).mockResolvedValue(createMockBalance());
    vi.mocked(transactionService.createTransaction).mockResolvedValue({ data: createMockTransaction() } as any);
    vi.mocked(transactionService.updateTransaction).mockResolvedValue({ data: createMockTransaction() } as any);
    vi.mocked(transactionService.deleteTransaction).mockResolvedValue(undefined);
    vi.mocked(categoryService.createCategory).mockResolvedValue(createMockCategory());
    vi.mocked(balanceService.updateBalance).mockResolvedValue(createMockBalance());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render main content after loading', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Find headings by role
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Transaction History');
      
      // Check for descriptive text
      expect(screen.getByText('Manage all your financial transactions')).toBeInTheDocument();
    });

    it('should display balance correctly', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Check for balance label and value
      expect(screen.getByText('Balance:')).toBeInTheDocument();
      expect(screen.getByText('$1000.00')).toBeInTheDocument();
      
      // Check for edit balance button
      const buttons = screen.getAllByRole('button');
      const editButton = buttons.find(button => 
        button.textContent?.includes('Edit')
      );
      expect(editButton).toBeTruthy();
    });

    it('should render Add Transaction button', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // The Add Transaction is inside a div within DialogTrigger
      // Look for the clickable element that contains the text
      const addTransactionElement = screen.getByText('Add Transaction');
      
      expect(addTransactionElement).toBeInTheDocument();
      expect(addTransactionElement).toHaveTextContent('Add Transaction');
      
      // Verify it's clickable (has cursor-pointer class or is clickable)
      expect(addTransactionElement.closest('div')).toHaveClass('cursor-pointer');
    });

    it('should open dialog when Add Transaction button is clicked', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Initially, dialog content should not be visible
      expect(screen.queryByText('Add New Transaction')).not.toBeInTheDocument();
      
      // Find and click the Add Transaction button
      const addTransactionButton = screen.getByText('Add Transaction');
      await user.click(addTransactionButton);
      
      // After clicking, dialog content should appear
      await waitFor(() => {
        expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Record a new income or expense transaction')).toBeInTheDocument();
      expect(screen.getByText('Manual')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getAllByText('Receipt OCR')[0]).toBeInTheDocument();
    });

    it('should render expense and income tabs', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Find tab buttons by role
      const tabs = screen.getAllByRole('tab');
      const expenseTab = tabs.find(tab => tab.textContent?.includes('Expenses'));
      const incomeTab = tabs.find(tab => tab.textContent?.includes('Income'));
      
      expect(expenseTab).toBeTruthy();
      expect(expenseTab).toHaveTextContent('Expenses');
      expect(incomeTab).toBeTruthy();
      expect(incomeTab).toHaveTextContent('Income');
    });

    it('should render filter controls', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Find select elements (comboboxes) for filter controls
      const selects = screen.getAllByRole('combobox');
      
      expect(selects.length).toBeGreaterThanOrEqual(2); // At least category and sort selects
      
      // Verify the select options are present by checking the option text
      expect(screen.getAllByText('All Categories')[0] ).toBeInTheDocument();
      expect(screen.getAllByText('Sort by Date')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Sort by Amount')[0]).toBeInTheDocument();
    });
  });

  describe('Transaction Display', () => {
    it('should display expense transactions', async () => {
      const mockTransactions = [
        createMockTransaction({ 
          id: 'tx1', 
          description: 'Groceries', 
          amount: -50.00, 
          type: 'expense' 
        })
      ];
      
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(mockTransactions);
      
      render(TransactionsContent);
      await waitForComponentLoad();
      
      expect(screen.getAllByText('Groceries')[0]).toBeInTheDocument();
      expect(screen.getAllByText('-$50.00')[0]).toBeInTheDocument();
    });

    it('should display income transactions when income tab is selected', async () => {
      const mockTransactions = [
        createMockTransaction({ 
          id: 'tx1', 
          description: 'Salary', 
          amount: 2000.00, 
          type: 'income' 
        })
      ];
      
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(mockTransactions);
      
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Click income tab
      await user.click(screen.getByText('Income'));
      
      expect(screen.getAllByText('Salary')[0]).toBeInTheDocument();
      // expect(screen.getAllByText('2000.00')[0]).toBeInTheDocument();
    });

    it('should display transaction action buttons when transactions exist', async () => {
      const mockTransactions = [
        createMockTransaction({ 
          id: 'tx1', 
          description: 'Test Transaction', 
          amount: -25.50 
        })
      ];
      
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(mockTransactions);
      
      render(TransactionsContent);
      await waitForComponentLoad();
      
      expect(screen.getAllByText('View Details')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Delete')[0]).toBeInTheDocument();
    });

    it('should display transaction count', async () => {
      const mockTransactions = [
        createMockTransaction({ id: 'tx1', type: 'expense' }),
        createMockTransaction({ id: 'tx2', type: 'expense' })
      ];
      
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(mockTransactions);
      
      render(TransactionsContent);
      await waitForComponentLoad();
      // 4. Click the "Expenses" tab
  const tabs = screen.getAllByRole('tab');
  const expenseTab = tabs.find(tab => tab.textContent?.includes('Expenses'));
  expect(expenseTab).toBeTruthy(); // sanity check
  await user.click(expenseTab!);

  // 5. Wait for updated UI after clicking
  const message = await screen.findAllByText((content, node): boolean => {
    return !!node?.textContent?.includes('2 expense transactions found');
  });
  
  expect(message[0]).toBeInTheDocument();
  
    });

    it('should display empty state when no transactions exist', async () => {
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([]);
      
      render(TransactionsContent);
      await waitForComponentLoad();
      
      expect(screen.getByText('No expense transactions found')).toBeInTheDocument();
    });
  });

  describe('Transaction Actions', () => {
    const mockTransaction = createMockTransaction({ 
      id: 'tx1', 
      description: 'Test Transaction', 
      amount: -25.50 
    });

    beforeEach(() => {
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([mockTransaction]);
    });

    it('should handle transaction deletion', async () => {
      vi.mocked(window.confirm).mockReturnValue(true);
      
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Find delete button by role and text content
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(button => 
        button.textContent?.includes('Delete')
      );
      
      expect(deleteButton).toBeTruthy();
      await user.click(deleteButton!);
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this transaction: "Test Transaction"?'
      );
      expect(transactionService.deleteTransaction).toHaveBeenCalledWith('tx1');
    });

    it('should not delete transaction when cancelled', async () => {
      vi.mocked(window.confirm).mockReturnValue(false);
      
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Find delete button by role and text content
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(button => 
        button.textContent?.includes('Delete')
      );
      
      expect(deleteButton).toBeTruthy();
      await user.click(deleteButton!);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(transactionService.deleteTransaction).not.toHaveBeenCalled();
    });

    it('should handle view details action', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();
      
      const viewButton = screen.getAllByText('View Details')[0];
      expect(viewButton).toBeInTheDocument();
      
      // Just verify the button exists and is clickable
      await user.click(viewButton);
    });

    // it('should handle edit transaction action', async () => {
    //   render(TransactionsContent);
    //   await waitForComponentLoad();
      
    //   const editButton = await screen.getAllByText('Edit')[0];
    //   expect(editButton).toBeInTheDocument();
      
    //   // Just verify the button exists and is clickable
    //   await user.click(editButton);
    // });
  });

  // describe('Add Transaction Dialog', () => {
  //   // it('should open add transaction dialog', async () => {
  //   //   render(TransactionsContent);
  //   //   await waitForComponentLoad();
      
  //   //   const addButton = screen.getByText('Add Transaction');
  //   //   await user.click(addButton);
      
  //   //   expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
  //   //   expect(screen.getByText('Record a new income or expense transaction')).toBeInTheDocument();
  //   // });

  //   it('should show manual, chat, and OCR tabs', async () => {
  //     render(TransactionsContent);
  //     await waitForComponentLoad();
      
  //     const addButton = screen.getByText('Add Transaction');
  //     await user.click(addButton);
      
  //     expect(screen.getByText('Manual')).toBeInTheDocument();
  //     expect(screen.getByText('Chat')).toBeInTheDocument();
  //     expect(screen.getAllByText('Receipt OCR')[0]).toBeInTheDocument();
  //   });

  //   it('should switch between tabs', async () => {
  //     render(TransactionsContent);
  //     await waitForComponentLoad();
      
  //     const addButton = screen.getByText('Add Transaction');
  //     await user.click(addButton);
      
  //     // Switch to chat tab
  //     await user.click(screen.getByText('Chat'));
      
  //     // Switch to OCR tab
  //     await user.click(screen.getAllByText('Receipt OCR')[0]);
      
  //     // Switch back to manual tab
  //     await user.click(screen.getByText('Manual'));
  //   });
  // });

  describe('Authentication', () => {
    it('should show loading state when authentication is loading', async () => {
      vi.mocked(authLoading).set(true);
      
      render(TransactionsContent);
      
      expect(screen.getByText('Authenticating...')).toBeInTheDocument();
    });

    it('should not load data when authentication is loading', async () => {
      vi.mocked(authLoading).set(true);
      
      render(TransactionsContent);
      
      // Should not call services while loading
      expect(transactionService.getAllTransactions).not.toHaveBeenCalled();
      expect(categoryService.getCategories).not.toHaveBeenCalled();
      expect(balanceService.getBalance).not.toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    it('should call services on load', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Services should be called during component load
      expect(transactionService.getAllTransactions).toHaveBeenCalled();
      expect(categoryService.getCategories).toHaveBeenCalled();
      expect(balanceService.getBalance).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(transactionService.getAllTransactions).mockRejectedValue(new Error('Network error'));
      
      render(TransactionsContent);
      
      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  // describe('Tab Navigation', () => {
  //   // it('should switch between expense and income tabs', async () => {
  //   //   render(TransactionsContent);
  //   //   await waitForComponentLoad();
      
  //   //   // Should show expense tab by default
  //   //   const incomeTab = screen.getAllByRole('tab', { name: /income/i })[0];
  //   //   const expenseTab = screen.getAllByRole('tab', { name: /expense/i })[0];
      
  //   //   expect(expenseTab).toBeInTheDocument();
  //   //   expect(incomeTab).toBeInTheDocument();
      
  //   //   // Switch back to expense tab
  //   //   await user.click(expenseTab);
  //   //   // Switch to income tab
  //   //   await user.click(incomeTab);
      
      
  //   // });

  //   it('should show different content for expense and income tabs', async () => {
  //     const mockTransactions = [
  //       createMockTransaction({ id: 'tx1', type: 'expense', description: 'Expense Transaction' }),
  //       createMockTransaction({ id: 'tx2', type: 'income', description: 'Income Transaction' })
  //     ];
      
  //     vi.mocked(transactionService.getAllTransactions).mockResolvedValue(mockTransactions);
      
  //     render(TransactionsContent);
  //     await waitForComponentLoad();
      
  //     // Should show expense tab content by default
  //     expect(screen.getByText('Expenses')).toBeInTheDocument();
      
  //     const incomeTab = await screen.getAllByRole('tab', { name: /income/i });
  // await user.click(incomeTab[0]);

  // // Wait for content related to the Income tab to appear
  // await screen.findByText('Income'); // Adjust if you have a more specific heading or label

  // // Assert that the tab is selected (if using ARIA properly)
  // expect(incomeTab[0]).toHaveAttribute('aria-selected', 'true');

  // // Optionally, assert that the correct content is shown
 
  //   });
  // });

  describe('Basic Interactions', () => {
    
    it('should render all required UI elements', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();
      
      // Check for main UI elements
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
      expect(screen.getByText('Manage all your financial transactions')).toBeInTheDocument();
      expect(screen.getByText('Balance:')).toBeInTheDocument();
      expect(screen.getByText('Add Transaction')).toBeInTheDocument();
      expect(screen.getByText('Expenses')).toBeInTheDocument();
      expect(screen.getByText('Income')).toBeInTheDocument();
    });
  });
}); 