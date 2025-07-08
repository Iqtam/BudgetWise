
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore
import BudgetContent from '../BudgetContent.svelte';

// Simple mocks
vi.mock('$lib/services/budgets', () => ({
  budgetService: {
    getAllBudgets: vi.fn().mockResolvedValue([]),
    syncBudgetSpending: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('$lib/services/categories', () => ({
  categoryService: {
    getExpenseCategories: vi.fn().mockResolvedValue([])
  }
}));

describe('BudgetContent', () => {
  it('renders without crashing', () => {
    const { container } = render(BudgetContent);
    expect(container).toBeTruthy();
  });
}); 