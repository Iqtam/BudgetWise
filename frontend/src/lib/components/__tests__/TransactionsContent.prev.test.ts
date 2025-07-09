import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
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
    balance: 1000.00
  });

  async function waitForComponentLoad() {
    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
    });
  }

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock returns
    vi.mocked(transactionService.getAllTransactions).mockResolvedValue([]);
    vi.mocked(categoryService.getCategories).mockResolvedValue([]);
    vi.mocked(balanceService.getBalance).mockResolvedValue(createMockBalance());
    
    // Mock successful create/update operations
    vi.mocked(transactionService.createTransaction).mockResolvedValue({ 
      data: createMockTransaction() 
    } as any);
    vi.mocked(transactionService.updateTransaction).mockResolvedValue({ 
      data: createMockTransaction() 
    } as any);
    vi.mocked(transactionService.deleteTransaction).mockResolvedValue(undefined);
    vi.mocked(categoryService.createCategory).mockResolvedValue(createMockCategory());
    vi.mocked(balanceService.updateBalance).mockResolvedValue(createMockBalance());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================
  // COMPONENT LOADING TESTS
  // =====================
  
  describe('Component Loading', () => {
    it('should show loading state initially', () => {
      render(TransactionsContent);
      expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
    });

    it('should load transactions, categories, and balance data', async () => {
      const mockTransactions = [createMockTransaction()];
      const mockCategories = [createMockCategory()];
      
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(mockTransactions);
      vi.mocked(categoryService.getCategories).mockResolvedValue(mockCategories);

      render(TransactionsContent);
      await waitForComponentLoad();

      expect(vi.mocked(transactionService.getAllTransactions)).toHaveBeenCalled();
      expect(vi.mocked(categoryService.getCategories)).toHaveBeenCalled();
      expect(vi.mocked(balanceService.getBalance)).toHaveBeenCalled();
    });

    it('should display transaction data after loading', async () => {
      const mockTransaction = createMockTransaction({
        description: 'Coffee Purchase',
        amount: -4.50,
        type: 'expense'
      });
      
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([mockTransaction]);

      render(TransactionsContent);
      await waitForComponentLoad();

      expect(screen.getByText('Coffee Purchase')).toBeInTheDocument();
      expect(screen.getByText('$4.50')).toBeInTheDocument();
    });

    it('should display balance information', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      expect(screen.getByText('Balance:')).toBeInTheDocument();
      expect(screen.getByText('$1000.00')).toBeInTheDocument();
    });

    it('should handle loading errors gracefully', async () => {
      vi.mocked(transactionService.getAllTransactions).mockRejectedValue(
        new Error('Network error')
      );

      render(TransactionsContent);
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // TRANSACTION CRUD TESTS
  // =====================
  
  describe('Transaction Creation', () => {
    it('should create expense transaction successfully', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      // Open create dialog
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      // Fill expense form
      await user.type(screen.getByLabelText(/description/i), 'Lunch');
      await user.type(screen.getByLabelText(/amount/i), '12.50');
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(transactionService.createTransaction)).toHaveBeenCalledWith({
          description: 'Lunch',
          amount: -12.50,
          type: 'expense',
          category_id: undefined,
          date: expect.any(String),
          recurrence: undefined
        });
      });
    });

    it('should create income transaction successfully', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      // Open create dialog
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      // Fill income form
      await user.type(screen.getByLabelText(/description/i), 'Salary');
      await user.type(screen.getByLabelText(/amount/i), '2500');
      await user.selectOptions(screen.getByLabelText(/type/i), 'income');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(transactionService.createTransaction)).toHaveBeenCalledWith({
          description: 'Salary',
          amount: 2500,
          type: 'income',
          category_id: undefined,
          date: expect.any(String),
          recurrence: undefined
        });
      });
    });

    it('should create transaction with category', async () => {
      const mockCategory = createMockCategory({ id: 'cat1', name: 'Food' });
      vi.mocked(categoryService.getCategories).mockResolvedValue([mockCategory]);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Open create dialog
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      // Fill form with category
      await user.type(screen.getByLabelText(/description/i), 'Grocery Shopping');
      await user.type(screen.getByLabelText(/amount/i), '45.30');
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');
      await user.selectOptions(screen.getByLabelText(/category/i), 'cat1');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(transactionService.createTransaction)).toHaveBeenCalledWith(
          expect.objectContaining({
            category_id: 'cat1'
          })
        );
      });
    });

    it('should show success message after creating transaction', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      // Create transaction
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      await user.type(screen.getByLabelText(/description/i), 'Test Transaction');
      await user.type(screen.getByLabelText(/amount/i), '10');
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');
      
      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/transaction.*added successfully/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      // Open create dialog
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      // Should not call create service
      expect(vi.mocked(transactionService.createTransaction)).not.toHaveBeenCalled();
    });

    it('should handle creation errors gracefully', async () => {
      vi.mocked(transactionService.createTransaction).mockRejectedValue(
        new Error('Failed to create transaction')
      );

      render(TransactionsContent);
      await waitForComponentLoad();

      // Fill and submit form
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      await user.type(screen.getByLabelText(/description/i), 'Test');
      await user.type(screen.getByLabelText(/amount/i), '10');
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');

      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create transaction')).toBeInTheDocument();
      });
    });
  });

  describe('Transaction Editing', () => {
    it('should open edit dialog with pre-filled data', async () => {
      const mockTransaction = createMockTransaction({
        id: 'tx1',
        description: 'Original Description',
        amount: -25.00,
        type: 'expense'
      });

      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([mockTransaction]);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Original Description')).toBeInTheDocument();
        expect(screen.getByDisplayValue('-25')).toBeInTheDocument();
      });
    });

    it('should update transaction successfully', async () => {
      const mockTransaction = createMockTransaction({ id: 'tx1' });
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([mockTransaction]);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Open edit dialog
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Modify transaction
      const descInput = screen.getByDisplayValue('Test Transaction');
      await user.clear(descInput);
      await user.type(descInput, 'Updated Transaction');

      // Submit changes
      const updateButton = screen.getByRole('button', { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(vi.mocked(transactionService.updateTransaction)).toHaveBeenCalledWith(
          'tx1',
          expect.objectContaining({
            description: 'Updated Transaction'
          })
        );
      });
    });

    it('should show success message after updating', async () => {
      const mockTransaction = createMockTransaction({ id: 'tx1' });
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([mockTransaction]);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Edit and update transaction
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const updateButton = screen.getByRole('button', { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Transaction updated successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Transaction Deletion', () => {
    it('should delete transaction with confirmation', async () => {
      const mockTransaction = createMockTransaction({
        id: 'tx1',
        description: 'To Be Deleted'
      });

      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([mockTransaction]);
      vi.mocked(window.confirm).mockReturnValue(true);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this transaction: "To Be Deleted"?'
        );
        expect(vi.mocked(transactionService.deleteTransaction)).toHaveBeenCalledWith('tx1');
      });
    });

    it('should not delete when confirmation is cancelled', async () => {
      const mockTransaction = createMockTransaction({ id: 'tx1' });
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([mockTransaction]);
      vi.mocked(window.confirm).mockReturnValue(false);

      render(TransactionsContent);
      await waitForComponentLoad();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(vi.mocked(transactionService.deleteTransaction)).not.toHaveBeenCalled();
      });
    });

    it('should show success message after deletion', async () => {
      const mockTransaction = createMockTransaction({ id: 'tx1' });
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([mockTransaction]);
      vi.mocked(window.confirm).mockReturnValue(true);

      render(TransactionsContent);
      await waitForComponentLoad();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Transaction deleted successfully')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // FILTERING AND SEARCH TESTS
  // =====================
  
  describe('Filtering and Search', () => {
    it('should filter transactions by search term', async () => {
      const transactions = [
        createMockTransaction({ id: 'tx1', description: 'Coffee Shop', type: 'expense' }),
        createMockTransaction({ id: 'tx2', description: 'Salary Payment', type: 'income' }),
        createMockTransaction({ id: 'tx3', description: 'Tea Store', type: 'expense' })
      ];

      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(transactions);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Search for "coffee"
      const searchInput = screen.getByPlaceholderText(/search transactions/i);
      await user.type(searchInput, 'coffee');

      await waitFor(() => {
        expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
        expect(screen.queryByText('Tea Store')).not.toBeInTheDocument();
        expect(screen.queryByText('Salary Payment')).not.toBeInTheDocument();
      });
    });

    it('should filter transactions by category', async () => {
      const category1 = createMockCategory({ id: 'cat1', name: 'Food' });
      const category2 = createMockCategory({ id: 'cat2', name: 'Transport' });
      
      const transactions = [
        createMockTransaction({ id: 'tx1', description: 'Lunch', category_id: 'cat1' }),
        createMockTransaction({ id: 'tx2', description: 'Bus Ticket', category_id: 'cat2' }),
        createMockTransaction({ id: 'tx3', description: 'No Category', category_id: undefined })
      ];

      vi.mocked(categoryService.getCategories).mockResolvedValue([category1, category2]);
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(transactions);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Filter by Food category
      const categoryFilter = screen.getByLabelText(/filter by category/i);
      await user.selectOptions(categoryFilter, 'cat1');

      await waitFor(() => {
        expect(screen.getByText('Lunch')).toBeInTheDocument();
        expect(screen.queryByText('Bus Ticket')).not.toBeInTheDocument();
        expect(screen.queryByText('No Category')).not.toBeInTheDocument();
      });
    });

    it('should sort transactions by date', async () => {
      const transactions = [
        createMockTransaction({ id: 'tx1', description: 'Recent', date: '2024-01-03' }),
        createMockTransaction({ id: 'tx2', description: 'Old', date: '2024-01-01' }),
        createMockTransaction({ id: 'tx3', description: 'Medium', date: '2024-01-02' })
      ];

      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(transactions);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Default sort should be by date (newest first)
      const transactionElements = screen.getAllByText(/Recent|Old|Medium/);
      expect(transactionElements[0]).toHaveTextContent('Recent');
      expect(transactionElements[1]).toHaveTextContent('Medium');
      expect(transactionElements[2]).toHaveTextContent('Old');
    });

    it('should sort transactions by amount', async () => {
      const transactions = [
        createMockTransaction({ id: 'tx1', description: 'Small', amount: -5.00 }),
        createMockTransaction({ id: 'tx2', description: 'Large', amount: -100.00 }),
        createMockTransaction({ id: 'tx3', description: 'Medium', amount: -25.00 })
      ];

      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(transactions);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Change sort to amount
      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'amount');

      await waitFor(() => {
        const transactionElements = screen.getAllByText(/Small|Large|Medium/);
        expect(transactionElements[0]).toHaveTextContent('Large');
        expect(transactionElements[1]).toHaveTextContent('Medium');
        expect(transactionElements[2]).toHaveTextContent('Small');
      });
    });
  });

  // =====================
  // PAGINATION TESTS
  // =====================
  
  describe('Pagination', () => {
    it('should paginate transactions correctly', async () => {
      // Create 25 transactions to test pagination (10 per page)
      const transactions = Array.from({ length: 25 }, (_, i) =>
        createMockTransaction({ 
          id: `tx${i + 1}`, 
          description: `Transaction ${i + 1}`,
          type: 'expense'
        })
      );

      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(transactions);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Should show first 10 transactions
      expect(screen.getByText('Transaction 1')).toBeInTheDocument();
      expect(screen.getByText('Transaction 10')).toBeInTheDocument();
      expect(screen.queryByText('Transaction 11')).not.toBeInTheDocument();

      // Should show pagination controls
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      const transactions = Array.from({ length: 15 }, (_, i) =>
        createMockTransaction({ 
          id: `tx${i + 1}`, 
          description: `Transaction ${i + 1}`,
          type: 'expense'
        })
      );

      vi.mocked(transactionService.getAllTransactions).mockResolvedValue(transactions);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Click next page
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Transaction 11')).toBeInTheDocument();
        expect(screen.getByText('Transaction 15')).toBeInTheDocument();
        expect(screen.queryByText('Transaction 1')).not.toBeInTheDocument();
      });
    });
  });

  // =====================
  // CATEGORY MANAGEMENT TESTS
  // =====================
  
  describe('Category Management', () => {
    it('should create new category', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      // Open create transaction dialog
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      // Select transaction type first
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');

      // Click new category button
      const newCategoryButton = screen.getByRole('button', { name: /new category/i });
      await user.click(newCategoryButton);

      // Fill category form
      await user.type(screen.getByLabelText(/category name/i), 'Entertainment');

      // Submit category
      const createCategoryButton = screen.getByRole('button', { name: /create category/i });
      await user.click(createCategoryButton);

      await waitFor(() => {
        expect(vi.mocked(categoryService.createCategory)).toHaveBeenCalledWith({
          name: 'Entertainment',
          type: 'expense'
        });
      });
    });

    it('should auto-select created category', async () => {
      const newCategory = createMockCategory({ id: 'cat-new', name: 'Entertainment' });
      vi.mocked(categoryService.createCategory).mockResolvedValue(newCategory);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Create category through dialog flow
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');

      const newCategoryButton = screen.getByRole('button', { name: /new category/i });
      await user.click(newCategoryButton);

      await user.type(screen.getByLabelText(/category name/i), 'Entertainment');

      const createCategoryButton = screen.getByRole('button', { name: /create category/i });
      await user.click(createCategoryButton);

      await waitFor(() => {
        const categorySelect = screen.getByLabelText(/category/i);
        expect(categorySelect).toHaveValue('cat-new');
      });
    });

    it('should require transaction type before creating category', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      // Try to create category without selecting type
      const newCategoryButton = screen.getByRole('button', { name: /new category/i });
      await user.click(newCategoryButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a transaction type first')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // BALANCE MANAGEMENT TESTS
  // =====================
  
  describe('Balance Management', () => {
    it('should display current balance', async () => {
      const mockBalance = { ...createMockBalance(), balance: 2500.75 };
      vi.mocked(balanceService.getBalance).mockResolvedValue(mockBalance);

      render(TransactionsContent);
      await waitForComponentLoad();

      expect(screen.getByText('Balance:')).toBeInTheDocument();
      expect(screen.getByText('$2500.75')).toBeInTheDocument();
    });

    it('should open balance edit dialog', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      const editBalanceButton = screen.getByRole('button', { name: /edit balance/i });
      await user.click(editBalanceButton);

      await waitFor(() => {
        expect(screen.getByText('Edit Balance')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      });
    });

    it('should update balance successfully', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      // Open edit dialog
      const editBalanceButton = screen.getByRole('button', { name: /edit balance/i });
      await user.click(editBalanceButton);

      // Change balance
      const balanceInput = screen.getByDisplayValue('1000');
      await user.clear(balanceInput);
      await user.type(balanceInput, '1500.50');

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(vi.mocked(balanceService.updateBalance)).toHaveBeenCalledWith(1500.50);
        expect(screen.getByText('Balance updated successfully')).toBeInTheDocument();
      });
    });

    it('should update balance after creating transaction', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      // Create expense transaction
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      await user.type(screen.getByLabelText(/description/i), 'Coffee');
      await user.type(screen.getByLabelText(/amount/i), '5.00');
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');

      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(balanceService.updateBalance)).toHaveBeenCalledWith(995); // 1000 - 5
      });
    });

    it('should update balance after creating income transaction', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      // Create income transaction
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      await user.type(screen.getByLabelText(/description/i), 'Bonus');
      await user.type(screen.getByLabelText(/amount/i), '200.00');
      await user.selectOptions(screen.getByLabelText(/type/i), 'income');

      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(balanceService.updateBalance)).toHaveBeenCalledWith(1200); // 1000 + 200
      });
    });

    it('should update balance after deleting transaction', async () => {
      const mockTransaction = createMockTransaction({
        id: 'tx1',
        amount: -25.00, // expense
        type: 'expense'
      });

      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([mockTransaction]);
      vi.mocked(window.confirm).mockReturnValue(true);

      render(TransactionsContent);
      await waitForComponentLoad();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(vi.mocked(balanceService.updateBalance)).toHaveBeenCalledWith(1025); // 1000 + 25 (reverse expense)
      });
    });
  });

  // =====================
  // OCR RECEIPT PROCESSING TESTS
  // =====================
  
  describe('OCR Receipt Processing', () => {
    it('should process receipt upload', async () => {
      const mockOCRResult: OCRResult = {
        description: 'Starbucks Coffee',
        amount: 4.50,
        type: 'expense',
        category: 'Food & Dining',
        vendor: 'Starbucks',
        date: '2024-01-01T00:00:00Z'
      };

      vi.mocked(ocrService.processReceipt).mockResolvedValue(mockOCRResult);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Open create dialog and switch to OCR tab
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      const ocrTab = screen.getByRole('tab', { name: /receipt/i });
      await user.click(ocrTab);

      // Simulate file upload
      const fileInput = screen.getByLabelText(/upload receipt/i);
      const file = new File(['receipt content'], 'receipt.jpg', { type: 'image/jpeg' });
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(vi.mocked(ocrService.processReceipt)).toHaveBeenCalledWith(file);
        expect(screen.getByText('Starbucks Coffee')).toBeInTheDocument();
        expect(screen.getByText('$4.50')).toBeInTheDocument();
      });
    });

    it('should handle OCR processing errors', async () => {
      vi.mocked(ocrService.processReceipt).mockRejectedValue(
        new Error('OCR processing failed')
      );

      render(TransactionsContent);
      await waitForComponentLoad();

      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      const ocrTab = screen.getByRole('tab', { name: /receipt/i });
      await user.click(ocrTab);

      const fileInput = screen.getByLabelText(/upload receipt/i);
      const file = new File(['content'], 'receipt.jpg', { type: 'image/jpeg' });
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('OCR processing failed')).toBeInTheDocument();
      });
    });

    it('should validate file type for OCR', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      const ocrTab = screen.getByRole('tab', { name: /receipt/i });
      await user.click(ocrTab);

      // Upload invalid file type
      const fileInput = screen.getByLabelText(/upload receipt/i);
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/please select a valid image file/i)).toBeInTheDocument();
      });
    });

    it('should confirm OCR result and create transaction', async () => {
      const mockOCRResult: OCRResult = {
        description: 'Gas Station',
        amount: 35.00,
        type: 'expense',
        category: 'Transportation',
        vendor: 'Shell',
        date: '2024-01-01T00:00:00Z'
      };

      vi.mocked(ocrService.processReceipt).mockResolvedValue(mockOCRResult);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Process OCR
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      const ocrTab = screen.getByRole('tab', { name: /receipt/i });
      await user.click(ocrTab);

      const fileInput = screen.getByLabelText(/upload receipt/i);
      const file = new File(['content'], 'receipt.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, file);

      // Confirm OCR result
      await waitFor(() => {
        expect(screen.getByText('Gas Station')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Should switch to manual tab with pre-filled data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Gas Station')).toBeInTheDocument();
        expect(screen.getByDisplayValue('35')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // CHAT PROCESSING TESTS
  // =====================
  
  describe('Chat Processing', () => {
    it('should process chat message', async () => {
      const mockChatResult: ChatResult = {
        description: 'Lunch at restaurant',
        amount: 18.50,
        type: 'expense',
        category: 'Dining',
        vendor: 'Restaurant ABC',
        date: '2024-01-01T00:00:00Z'
      };

      vi.mocked(ocrService.processChatMessage).mockResolvedValue(mockChatResult);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Open create dialog and switch to chat tab
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      const chatTab = screen.getByRole('tab', { name: /chat/i });
      await user.click(chatTab);

      // Enter chat message
      const chatInput = screen.getByPlaceholderText(/describe your transaction/i);
      await user.type(chatInput, 'I spent $18.50 on lunch at a restaurant today');

      const submitChatButton = screen.getByRole('button', { name: /process/i });
      await user.click(submitChatButton);

      await waitFor(() => {
        expect(vi.mocked(ocrService.processChatMessage)).toHaveBeenCalledWith(
          'I spent $18.50 on lunch at a restaurant today'
        );
        expect(screen.getByText('Lunch at restaurant')).toBeInTheDocument();
        expect(screen.getByText('$18.50')).toBeInTheDocument();
      });
    });

    it('should handle chat processing errors', async () => {
      vi.mocked(ocrService.processChatMessage).mockRejectedValue(
        new Error('Chat processing failed')
      );

      render(TransactionsContent);
      await waitForComponentLoad();

      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      const chatTab = screen.getByRole('tab', { name: /chat/i });
      await user.click(chatTab);

      const chatInput = screen.getByPlaceholderText(/describe your transaction/i);
      await user.type(chatInput, 'Invalid message');

      const submitChatButton = screen.getByRole('button', { name: /process/i });
      await user.click(submitChatButton);

      await waitFor(() => {
        expect(screen.getByText('Chat processing failed')).toBeInTheDocument();
      });
    });

    it('should auto-confirm chat result', async () => {
      const mockChatResult: ChatResult = {
        description: 'Grocery shopping',
        amount: 75.30,
        type: 'expense',
        category: 'Groceries',
        vendor: 'Supermarket',
        date: '2024-01-01T00:00:00Z'
      };

      vi.mocked(ocrService.processChatMessage).mockResolvedValue(mockChatResult);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Process chat message
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      const chatTab = screen.getByRole('tab', { name: /chat/i });
      await user.click(chatTab);

      const chatInput = screen.getByPlaceholderText(/describe your transaction/i);
      await user.type(chatInput, 'Bought groceries for $75.30');

      const submitChatButton = screen.getByRole('button', { name: /process/i });
      await user.click(submitChatButton);

      // Confirm result
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Should automatically create the transaction
      await waitFor(() => {
        expect(vi.mocked(transactionService.createTransaction)).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Grocery shopping',
            amount: -75.30,
            type: 'expense'
          })
        );
      });
    });

    it('should allow editing chat result', async () => {
      const mockChatResult: ChatResult = {
        description: 'Coffee purchase',
        amount: 4.00,
        type: 'expense',
        category: 'Beverages',
        vendor: 'Cafe',
        date: '2024-01-01T00:00:00Z'
      };

      vi.mocked(ocrService.processChatMessage).mockResolvedValue(mockChatResult);

      render(TransactionsContent);
      await waitForComponentLoad();

      // Process chat and edit result
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      const chatTab = screen.getByRole('tab', { name: /chat/i });
      await user.click(chatTab);

      const chatInput = screen.getByPlaceholderText(/describe your transaction/i);
      await user.type(chatInput, 'Coffee for $4');

      const submitChatButton = screen.getByRole('button', { name: /process/i });
      await user.click(submitChatButton);

      await waitFor(() => {
        expect(screen.getByText('Coffee purchase')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Should switch to manual tab with pre-filled data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Coffee purchase')).toBeInTheDocument();
        expect(screen.getByDisplayValue('4')).toBeInTheDocument();
      });
    });
  });

  // =====================
  // RECURRING TRANSACTIONS TESTS
  // =====================
  
  describe('Recurring Transactions', () => {
    it('should create monthly recurring transaction', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      // Fill basic transaction data
      await user.type(screen.getByLabelText(/description/i), 'Monthly Rent');
      await user.type(screen.getByLabelText(/amount/i), '1200');
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');

      // Enable recurring
      const recurringCheckbox = screen.getByLabelText(/recurring/i);
      await user.click(recurringCheckbox);

      // Set recurring options
      await user.type(screen.getByLabelText(/start date/i), '2024-02-01');
      await user.selectOptions(screen.getByLabelText(/recurrence type/i), 'monthly');

      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(transactionService.createTransaction)).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Monthly Rent',
            amount: -1200,
            recurrence: 'monthly'
          })
        );
      });
    });

    it('should validate weekly recurring transaction requires weekday', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      await user.type(screen.getByLabelText(/description/i), 'Weekly Allowance');
      await user.type(screen.getByLabelText(/amount/i), '50');
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');

      // Enable recurring
      const recurringCheckbox = screen.getByLabelText(/recurring/i);
      await user.click(recurringCheckbox);

      // Set weekly recurrence without weekday
      await user.selectOptions(screen.getByLabelText(/recurrence type/i), 'weekly');

      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a day of the week/i)).toBeInTheDocument();
        expect(vi.mocked(transactionService.createTransaction)).not.toHaveBeenCalled();
      });
    });

    it('should validate recurring transaction end date', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      await user.type(screen.getByLabelText(/description/i), 'Test Recurring');
      await user.type(screen.getByLabelText(/amount/i), '100');
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');

      // Enable recurring
      const recurringCheckbox = screen.getByLabelText(/recurring/i);
      await user.click(recurringCheckbox);

      // Set invalid dates (end before start)
      await user.type(screen.getByLabelText(/start date/i), '2024-02-01');
      await user.type(screen.getByLabelText(/end date/i), '2024-01-15');

      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/end date must be after the start date/i)).toBeInTheDocument();
        expect(vi.mocked(transactionService.createTransaction)).not.toHaveBeenCalled();
      });
    });
  });

  // =====================
  // EDGE CASES AND ERROR HANDLING
  // =====================
  
  describe('Edge Cases', () => {
    it('should handle empty transaction list', async () => {
      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([]);

      render(TransactionsContent);
      await waitForComponentLoad();

      expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
    });

    it('should handle negative balance display', async () => {
      const mockBalance = { ...createMockBalance(), balance: -250.50 };
      vi.mocked(balanceService.getBalance).mockResolvedValue(mockBalance);

      render(TransactionsContent);
      await waitForComponentLoad();

      const balanceElement = screen.getByText('$-250.50');
      expect(balanceElement).toHaveClass('text-red-400');
    });

         it('should handle transactions without categories', async () => {
       const transaction = createMockTransaction({
         id: 'tx1',
         description: 'No Category Transaction',
         category_id: undefined
       });

       vi.mocked(transactionService.getAllTransactions).mockResolvedValue([transaction]);

       render(TransactionsContent);
       await waitForComponentLoad();

       expect(screen.getByText('No Category Transaction')).toBeInTheDocument();
       expect(screen.getByText('No Category')).toBeInTheDocument();
     });

    it('should handle very large transaction amounts', async () => {
      const transaction = createMockTransaction({
        id: 'tx1',
        description: 'Large Transaction',
        amount: -999999.99
      });

      vi.mocked(transactionService.getAllTransactions).mockResolvedValue([transaction]);

      render(TransactionsContent);
      await waitForComponentLoad();

      expect(screen.getByText('$999999.99')).toBeInTheDocument();
    });

    it('should handle concurrent operations gracefully', async () => {
      render(TransactionsContent);
      await waitForComponentLoad();

      // Simulate multiple rapid clicks
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await user.click(addButton);

      await user.type(screen.getByLabelText(/description/i), 'Test');
      await user.type(screen.getByLabelText(/amount/i), '10');
      await user.selectOptions(screen.getByLabelText(/type/i), 'expense');

      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      
      // Rapid multiple clicks
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only call create once due to isSaving guard
      await waitFor(() => {
        expect(vi.mocked(transactionService.createTransaction)).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle missing authentication gracefully', async () => {
      // Mock unauthenticated state
      vi.mocked(firebaseUser.subscribe).mockImplementation((callback) => {
        callback(null);
        return () => {};
      });

      render(TransactionsContent);

      await waitFor(() => {
        expect(screen.getByText('User not authenticated')).toBeInTheDocument();
      });
    });
  });
}); 