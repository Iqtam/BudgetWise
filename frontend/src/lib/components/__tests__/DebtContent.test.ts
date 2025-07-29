import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import DebtContent from '../DebtContent.svelte';
import { debtService, type Debt } from '$lib/services/debts';
import { balanceService, type Balance } from '$lib/services/balance';
import { firebaseUser, loading as authLoading } from '$lib/stores/auth';

// Mock all services
vi.mock('$lib/services/debts', () => ({
  debtService: {
    getAllDebts: vi.fn(),
    createDebt: vi.fn(),
    updateDebt: vi.fn(),
    deleteDebt: vi.fn(),
    makePayment: vi.fn()
  }
}));

vi.mock('$lib/services/balance', () => ({
  balanceService: {
    getBalance: vi.fn(),
    updateBalance: vi.fn()
  }
}));

// Mock Svelte stores - using Svelte 4 pattern like other test files
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

// Mock Select components
vi.mock('$lib/components/ui/select', () => ({
  Select: vi.fn().mockImplementation(({ children }) => children),
  SelectContent: vi.fn().mockImplementation(({ children }) => children),
  SelectItem: vi.fn().mockImplementation(({ children }) => children),
  SelectTrigger: vi.fn().mockImplementation(({ children }) => children),
}));

// Mock window.confirm
vi.stubGlobal('confirm', vi.fn());

describe('DebtContent Component', () => {
  const user = userEvent.setup();

  // Mock data factories
  const createMockDebt = (overrides: Partial<Debt> = {}): Debt => ({
    id: 'debt1',
    user_id: 'test-user-123',
    description: 'Student Loan',
    type: 'bank',
    start_date: '2024-01-01',
    expiration_date: '2025-01-01',
    interest_rate: 5.5,
    amount: 10000.00,
    original_amount: 10000.00,
    taken_from: 'Bank of America',
    is_fully_paid: false,
    fully_paid_date: undefined,
    last_payment_date: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  });

  const createMockBalance = (): Balance => ({
    id: 'bal1',
    user_id: 'test-user-123',
    balance: '5000.00'
  });

  async function waitForComponentLoad() {
    await waitFor(() => {
      expect(screen.queryByText('Loading debts...')).not.toBeInTheDocument();
      expect(screen.queryByText('Authenticating...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset stores to default state
    vi.mocked(firebaseUser).set({ uid: 'test-user-123', email: 'test@example.com' } as any);
    vi.mocked(authLoading).set(false);
    
    // Setup default mock responses
    vi.mocked(debtService.getAllDebts).mockResolvedValue([]);
    vi.mocked(balanceService.getBalance).mockResolvedValue(createMockBalance());
    vi.mocked(debtService.createDebt).mockResolvedValue({ data: createMockDebt() } as any);
    vi.mocked(debtService.updateDebt).mockResolvedValue({ data: createMockDebt() } as any);
    vi.mocked(debtService.deleteDebt).mockResolvedValue(undefined);
    vi.mocked(debtService.makePayment).mockResolvedValue({ data: createMockDebt() } as any);
    vi.mocked(balanceService.updateBalance).mockResolvedValue(createMockBalance());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', async () => {
      render(DebtContent);
      
      expect(screen.getByText('Loading debts...')).toBeInTheDocument();
    });

    it('should render main content after loading', async () => {
      render(DebtContent);
      await waitForComponentLoad();
      
      // Find headings by role
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Debt Management');
      
      // Check for descriptive text
      expect(screen.getByText('Track and manage your debt payments')).toBeInTheDocument();
    });

    it('should display account balance correctly', async () => {
      render(DebtContent);
      await waitForComponentLoad();
      
      // Check for balance label and value
      expect(screen.getByText('Account Balance')).toBeInTheDocument();
      expect(screen.getByText('$5000.00')).toBeInTheDocument();
    });

    // it('should render Add Debt button', async () => {
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   const addDebtElement = screen.getByText('Add Debt');
    //   expect(addDebtElement).toBeInTheDocument();
    //   expect(addDebtElement).toHaveTextContent('Add Debt');
    // });

    it('should display debt summary cards when debts exist', async () => {
      const mockDebts = [
        createMockDebt({ 
          id: 'debt1', 
          description: 'Student Loan',
          amount: 10000.00,
          type: 'bank'
        }),
        createMockDebt({ 
          id: 'debt2', 
          description: 'Credit Card',
          amount: 5000.00,
          type: 'personal'
        })
      ];
      
      vi.mocked(debtService.getAllDebts).mockResolvedValue(mockDebts);
      
      render(DebtContent);
      await waitForComponentLoad();
      
      // Check for debt summary elements
      expect(screen.getByText('Total Debt')).toBeInTheDocument();
      expect(screen.getByText('Account Balance')).toBeInTheDocument();
      expect(screen.getByText('Earliest Deadline')).toBeInTheDocument();
    });

    it('should display empty state when no debts exist', async () => {
      vi.mocked(debtService.getAllDebts).mockResolvedValue([]);
      
      render(DebtContent);
      await waitForComponentLoad();
      
      // When no debts exist, the component shows "No debts" in the earliest deadline card
      expect(screen.getByText('No debts')).toBeInTheDocument();
      expect(screen.getByText('No active debts')).toBeInTheDocument();
    });
  });

  describe('Debt Display', () => {
    // it('should display debt cards with correct information', async () => {
    //   const mockDebts = [
    //     createMockDebt({ 
    //       id: 'debt1', 
    //       description: 'Student Loan',
    //       amount: 10000.00,
    //       type: 'bank',
    //       interest_rate: 5.5,
    //       taken_from: 'Bank of America'
    //     })
    //   ];
      
    //   vi.mocked(debtService.getAllDebts).mockResolvedValue(mockDebts);
      
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Check if debt information is displayed
    //   expect(screen.getByText('Student Loan')).toBeInTheDocument();
    //   expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    //   expect(screen.getByText('5.5%')).toBeInTheDocument();
    //   expect(screen.getByText('Bank of America')).toBeInTheDocument();
    // });

    it('should display debt action buttons when debts exist', async () => {
      const mockDebts = [
        createMockDebt({ 
          id: 'debt1', 
          description: 'Student Loan',
          amount: 10000.00
        })
      ];
      
      vi.mocked(debtService.getAllDebts).mockResolvedValue(mockDebts);
      
      render(DebtContent);
      await waitForComponentLoad();
      
      // Find action buttons
      const buttons = screen.getAllByRole('button');
      const editButton = buttons.find(button => button.textContent?.includes('Edit'));
      const deleteButton = buttons.find(button => button.textContent?.includes('Delete'));
      const paymentButton = buttons.find(button => button.textContent?.includes('Pay Amount'));
      
      expect(editButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
      expect(paymentButton).toBeTruthy();
    });

    // it('should show debt status correctly', async () => {
    //   const mockDebts = [
    //     createMockDebt({ 
    //       id: 'debt1', 
    //       description: 'Student Loan',
    //       amount: 10000.00,
    //       is_fully_paid: false
    //     })
    //   ];
      
    //   vi.mocked(debtService.getAllDebts).mockResolvedValue(mockDebts);
      
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   expect(screen.getByText('Active')).toBeInTheDocument();
    // });

    it('should show paid status for fully paid debts', async () => {
      const mockDebts = [
        createMockDebt({ 
          id: 'debt1', 
          description: 'Student Loan',
          amount: 0.00,
          is_fully_paid: true,
          fully_paid_date: '2024-06-01'
        })
      ];
      
      vi.mocked(debtService.getAllDebts).mockResolvedValue(mockDebts);
      
      render(DebtContent);
      await waitForComponentLoad();
      
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });
  });

  describe('Debt Actions', () => {
    const mockDebt = createMockDebt({ 
      id: 'debt1', 
      description: 'Student Loan',
      amount: 10000.00,
      type: 'bank'
    });

    beforeEach(() => {
      vi.mocked(debtService.getAllDebts).mockResolvedValue([mockDebt]);
    });

    // it('should handle debt deletion', async () => {
    //   vi.mocked(window.confirm).mockReturnValue(true);
      
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Find delete button by role and text content
    //   const buttons = screen.getAllByRole('button');
    //   const deleteButton = buttons.find(button => 
    //     button.textContent?.includes('Delete')
    //   );
      
    //   expect(deleteButton).toBeTruthy();
    //   await user.click(deleteButton!);
      
    //   expect(window.confirm).toHaveBeenCalledWith(
    //     'Are you sure you want to delete this debt: "Student Loan"?'
    //   );
    //   expect(debtService.deleteDebt).toHaveBeenCalledWith('debt1');
    // });

    it('should not delete debt when cancelled', async () => {
      vi.mocked(window.confirm).mockReturnValue(false);
      
      render(DebtContent);
      await waitForComponentLoad();
      
      // Find delete button by role and text content
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(button => 
        button.textContent?.includes('Delete')
      );
      
      expect(deleteButton).toBeTruthy();
      await user.click(deleteButton!);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(debtService.deleteDebt).not.toHaveBeenCalled();
    });

    // it('should handle make payment action', async () => {
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Find payment button by role and text content
    //   const buttons = screen.getAllByRole('button');
    //   const paymentButton = buttons.find(button => 
    //     button.textContent?.includes('Pay Amount')
    //   );
      
    //   expect(paymentButton).toBeTruthy();
    //   await user.click(paymentButton!);
      
    //   // Should open payment dialog
    //   expect(screen.getByText('Make Payment')).toBeInTheDocument();
    // });

    // it('should handle edit debt action', async () => {
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Find edit button by role and text content
    //   const buttons = screen.getAllByRole('button');
    //   const editButton = buttons.find(button => 
    //     button.textContent?.includes('Edit')
    //   );
      
    //   expect(editButton).toBeTruthy();
    //   await user.click(editButton!);
      
    //   // Should open edit dialog
    //   expect(screen.getByText('Edit Debt')).toBeInTheDocument();
    // });
  });

//   describe('Edit Debt Dialog', () => {
//     const mockDebt = createMockDebt({ 
//       id: 'debt1', 
//       description: 'Student Loan',
//       amount: 10000.00,
//       type: 'bank'
//     });

//     beforeEach(() => {
//       vi.mocked(debtService.getAllDebts).mockResolvedValue([mockDebt]);
//     });

    // it('should open edit debt dialog', async () => {
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Find and click the Edit button
    //   const buttons = screen.getAllByRole('button');
    //   const editButton = buttons.find(button => 
    //     button.textContent?.includes('Edit')
    //   );
      
    //   await user.click(editButton!);
      
    //   // Check if dialog content appears
    //   expect(screen.getByText('Edit Debt')).toBeInTheDocument();
    // });

    // it('should populate form fields with existing debt data', async () => {
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Find and click the Edit button
    //   const buttons = screen.getAllByRole('button');
    //   const editButton = buttons.find(button => 
    //     button.textContent?.includes('Edit')
    //   );
      
    //   await user.click(editButton!);
      
    //   // Check that form fields are populated
    //   const descriptionInput = screen.getByLabelText('Description') as HTMLInputElement;
    //   const amountInput = screen.getByLabelText('Amount') as HTMLInputElement;
      
    //   expect(descriptionInput.value).toBe('Student Loan');
    //   expect(amountInput.value).toBe('10000');
    // });

    // it('should handle edit debt form submission', async () => {
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Find and click the Edit button
    //   const buttons = screen.getAllByRole('button');
    //   const editButton = buttons.find(button => 
    //     button.textContent?.includes('Edit')
    //   );
      
    //   await user.click(editButton!);
      
    //   // Update form fields
    //   const descriptionInput = screen.getByLabelText('Description');
    //   const amountInput = screen.getByLabelText('Amount');
      
    //   await user.clear(descriptionInput);
    //   await user.type(descriptionInput, 'Updated Student Loan');
    //   await user.clear(amountInput);
    //   await user.type(amountInput, '9500');
      
    //   // Submit form
    //   const submitButton = screen.getByText('Update Debt');
    //   await user.click(submitButton);
      
    //   expect(debtService.updateDebt).toHaveBeenCalledWith('debt1', {
    //     description: 'Updated Student Loan',
    //     amount: 9500
    //   });
    // });
//   });

//   describe('Payment Dialog', () => {
//     const mockDebt = createMockDebt({ 
//       id: 'debt1', 
//       description: 'Student Loan',
//       amount: 10000.00,
//       type: 'bank'
//     });

//     beforeEach(() => {
//       vi.mocked(debtService.getAllDebts).mockResolvedValue([mockDebt]);
//     });

    // it('should open payment dialog', async () => {
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Find and click the Make Payment button
    //   const buttons = screen.getAllByRole('button');
    //   const paymentButton = buttons.find(button => 
    //     button.textContent?.includes('Pay Amount')
    //   );
      
    //   await user.click(paymentButton!);
      
    //   // Check if dialog content appears
    //   expect(screen.getByText('Make Payment')).toBeInTheDocument();
    //   expect(screen.getByText('Record a payment for this debt')).toBeInTheDocument();
    // });

    // it('should show payment form fields', async () => {
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Find and click the Make Payment button
    //   const buttons = screen.getAllByRole('button');
    //   const paymentButton = buttons.find(button => 
    //     button.textContent?.includes('Pay Amount')
    //   );
      
    //   await user.click(paymentButton!);
      
    //   // Check for payment form fields
    //   expect(screen.getByLabelText('Payment Amount')).toBeInTheDocument();
    //   expect(screen.getByLabelText('Payment Date')).toBeInTheDocument();
    // });

    // it('should handle payment form submission', async () => {
    //   render(DebtContent);
    //   await waitForComponentLoad();
      
    //   // Find and click the Make Payment button
    //   const buttons = screen.getAllByRole('button');
    //   const paymentButton = buttons.find(button => 
    //     button.textContent?.includes('Pay Amount')
    //   );
      
    //   await user.click(paymentButton!);
      
    //   // Fill payment form
    //   const paymentAmountInput = screen.getByLabelText('Payment Amount');
    //   const paymentDateInput = screen.getByLabelText('Payment Date');
      
    //   await user.type(paymentAmountInput, '500');
    //   await user.type(paymentDateInput, '2024-06-01');
      
    //   // Submit payment
    //   const submitButton = screen.getByText('Record Payment');
    //   await user.click(submitButton);
      
    //   expect(debtService.makePayment).toHaveBeenCalledWith('debt1', 500);
    // });
//   });

  describe('Authentication', () => {
    it('should show loading state when authentication is loading', async () => {
      vi.mocked(authLoading).set(true);
      
      render(DebtContent);
      
      expect(screen.getByText('Loading debts...')).toBeInTheDocument();
    });

    it('should not load data when authentication is loading', async () => {
      vi.mocked(authLoading).set(true);
      
      render(DebtContent);
      
      // Should not call services while loading
      expect(debtService.getAllDebts).not.toHaveBeenCalled();
      expect(balanceService.getBalance).not.toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    it('should call services on load', async () => {
      render(DebtContent);
      
      // Wait for the component to finish loading
      await waitFor(() => {
        expect(debtService.getAllDebts).toHaveBeenCalled();
        expect(balanceService.getBalance).toHaveBeenCalled();
      });
      
      await waitForComponentLoad();
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(debtService.getAllDebts).mockRejectedValue(new Error('Network error'));
      
      render(DebtContent);
      
      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

//   describe('Debt Calculations', () => {
//     it('should calculate total debt correctly', async () => {
//       const mockDebts = [
//         createMockDebt({ id: 'debt1', amount: 10000.00 }),
//         createMockDebt({ id: 'debt2', amount: 5000.00 })
//       ];
      
//       vi.mocked(debtService.getAllDebts).mockResolvedValue(mockDebts);
      
//       render(DebtContent);
//       await waitForComponentLoad();
      
//       // Check total debt calculation - look for the Total Debt card
//       expect(screen.getByText('Total Debt')).toBeInTheDocument();
//       expect(screen.getByText('$15,000.00')).toBeInTheDocument();
//     });
//   });

//   describe('Basic Interactions', () => {
//     it('should render all required UI elements', async () => {
//       render(DebtContent);
//       await waitForComponentLoad();
      
//       // Check for main UI elements
//       expect(screen.getByText('Debt Management')).toBeInTheDocument();
//       expect(screen.getByText('Track and manage your debt payments')).toBeInTheDocument();
//       expect(screen.getByText('Add Debt')).toBeInTheDocument();
//       expect(screen.getByText('Account Balance')).toBeInTheDocument();
//     });

//     it('should handle button clicks without errors', async () => {
//       const mockDebts = [
//         createMockDebt({ 
//           id: 'debt1', 
//           description: 'Student Loan',
//           amount: 10000.00
//         })
//       ];
      
//       vi.mocked(debtService.getAllDebts).mockResolvedValue(mockDebts);
      
//       render(DebtContent);
//       await waitForComponentLoad();
      
//       // Test that the component renders without errors
//       expect(screen.getByText('Debt Management')).toBeInTheDocument();
//       expect(screen.getByText('Your Debts')).toBeInTheDocument();
      
//       // Test that Add Debt button exists and is clickable
//       const addDebtButton = screen.getByText('Add Debt');
//       expect(addDebtButton).toBeInTheDocument();
      
//       // Test button click (this should open the dialog)
//       await user.click(addDebtButton);
      
//       // Verify dialog opened
//       await waitFor(() => {
//         expect(screen.getByText('Add New Debt')).toBeInTheDocument();
//       });
//     });
//   });
}); 