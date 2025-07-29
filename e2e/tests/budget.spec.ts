 // @ts-check
import { test, expect } from '@playwright/test';

test.describe('Budget Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the budget page before each test
    await page.goto('/dashboard/budget');
    
    // Handle authentication - if redirected to signin, we'll skip the test
    const currentUrl = page.url();
    if (currentUrl.includes('/signin')) {
      test.skip('User not authenticated - skipping budget tests');
    }
  });

  test('should load the budget page', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the signin page (authentication required)
    if (page.url().includes('/signin')) {
      test.skip('Authentication required for budget page');
      return;
    }
    
    // Verify that the budget page has loaded
    await expect(page).toHaveTitle(/Budget - BudgetWise/i);
    
    // Check if main elements are visible
    await expect(page.getByText('Budget Management')).toBeVisible();
    await expect(page.getByText('Track and manage your spending budgets')).toBeVisible();
  });

//   test('should display all budget page elements', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Check if main sections are present
//     await expect(page.getByText('Budget Overview')).toBeVisible();
//     await expect(page.getByText('Budget List')).toBeVisible();
//     await expect(page.getByText('Budget Insights')).toBeVisible();
    
//     // Check if buttons are present
//     await expect(page.getByRole('button', { name: /create budget/i })).toBeVisible();
//     await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
//   });

//   test('should open create budget dialog', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Find and click the create budget button
//     const createBudgetButton = page.getByRole('button', { name: /create budget/i });
//     await expect(createBudgetButton).toBeVisible();
    
//     await createBudgetButton.click();
    
//     // Verify dialog opens
//     await expect(page.getByText('Create New Budget')).toBeVisible();
//     await expect(page.getByText('Set up a new spending budget for a category')).toBeVisible();
//   });

//   test('should display create budget form fields', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Open create budget dialog
//     const createBudgetButton = page.getByRole('button', { name: /create budget/i });
//     await createBudgetButton.click();
    
//     // Check if form fields are present
//     await expect(page.getByLabel(/category/i)).toBeVisible();
//     await expect(page.getByLabel(/budget amount/i)).toBeVisible();
//     await expect(page.getByLabel(/start date/i)).toBeVisible();
//     await expect(page.getByLabel(/end date/i)).toBeVisible();
    
//     // Check if submit button is present
//     await expect(page.getByRole('button', { name: /create budget/i })).toBeVisible();
//   });

//   test('should show validation error for invalid budget amount', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Open create budget dialog
//     const createBudgetButton = page.getByRole('button', { name: /create budget/i });
//     await createBudgetButton.click();
    
//     // Fill in form with invalid data
//     const budgetAmountInput = page.getByLabel(/budget amount/i);
//     const startDateInput = page.getByLabel(/start date/i);
//     const endDateInput = page.getByLabel(/end date/i);
//     const submitButton = page.getByRole('button', { name: /create budget/i });
    
//     // Fill with invalid amount (negative)
//     await budgetAmountInput.fill('-100');
//     await startDateInput.fill('2024-01-01');
//     await endDateInput.fill('2024-01-31');
    
//     // Submit the form
//     await submitButton.click();
    
//     // Verify error message appears (this depends on your validation implementation)
//     // The form should still be visible indicating validation prevented submission
//     await expect(page.getByText('Create New Budget')).toBeVisible();
//   });

//   test('should show validation error for invalid dates', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Open create budget dialog
//     const createBudgetButton = page.getByRole('button', { name: /create budget/i });
//     await createBudgetButton.click();
    
//     // Fill in form with invalid dates (end date before start date)
//     const budgetAmountInput = page.getByLabel(/budget amount/i);
//     const startDateInput = page.getByLabel(/start date/i);
//     const endDateInput = page.getByLabel(/end date/i);
//     const submitButton = page.getByRole('button', { name: /create budget/i });
    
//     // Fill with invalid dates
//     await budgetAmountInput.fill('1000');
//     await startDateInput.fill('2024-01-31');
//     await endDateInput.fill('2024-01-01'); // End date before start date
    
//     // Submit the form
//     await submitButton.click();
    
//     // Verify error message appears
//     await expect(page.getByText('Create New Budget')).toBeVisible();
//   });

//   test('should close create budget dialog when clicking outside', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Open create budget dialog
//     const createBudgetButton = page.getByRole('button', { name: /create budget/i });
//     await createBudgetButton.click();
    
//     // Verify dialog is open
//     await expect(page.getByText('Create New Budget')).toBeVisible();
    
//     // Click outside the dialog (on the overlay)
//     await page.click('body');
    
//     // Verify dialog is closed
//     await expect(page.getByText('Create New Budget')).not.toBeVisible();
//   });

//   test('should display budget insights section', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Check if insights section is present
//     await expect(page.getByText('Budget Insights')).toBeVisible();
    
//     // Check for insight boxes (these may be empty initially)
//     const insightBoxes = page.locator('.grid.grid-cols-1.md\\:grid-cols-3.gap-4');
//     await expect(insightBoxes).toBeVisible();
//   });

//   test('should display budget list section', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Check if budget list section is present
//     await expect(page.getByText('Budget List')).toBeVisible();
    
//     // Check if budget list container is present
//     const budgetList = page.locator('.space-y-6');
//     await expect(budgetList).toBeVisible();
//   });

//   test('should have refresh button functionality', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Check if refresh button is present
//     const refreshButton = page.getByRole('button', { name: /refresh/i });
//     await expect(refreshButton).toBeVisible();
    
//     // Click refresh button
//     await refreshButton.click();
    
//     // Wait for any loading states
//     await page.waitForTimeout(1000);
    
//     // Verify page is still functional after refresh
//     await expect(page.getByText('Budget Management')).toBeVisible();
//   });

  test('should handle budget editing when budgets exist', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for edit buttons on existing budgets
    const editButtons = page.locator('button').filter({ hasText: /edit/i });
    
    // If edit buttons exist, test editing functionality
    if (await editButtons.count() > 0) {
      const firstEditButton = editButtons.first();
      await firstEditButton.click();
      
      // Verify edit dialog opens
      await expect(page.getByText('Edit Budget')).toBeVisible();
      
      // Check if form fields are present
      await expect(page.getByLabel(/budget amount/i)).toBeVisible();
      await expect(page.getByLabel(/start date/i)).toBeVisible();
      await expect(page.getByLabel(/end date/i)).toBeVisible();
      
      // Close dialog by clicking outside
      await page.click('body');
      
      // Verify dialog is closed
      await expect(page.getByText('Edit Budget')).not.toBeVisible();
    }
  });

  test('should handle budget deletion when budgets exist', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for delete buttons on existing budgets
    const deleteButtons = page.locator('button').filter({ hasText: /delete/i });
    
    // If delete buttons exist, test deletion functionality
    if (await deleteButtons.count() > 0) {
      const firstDeleteButton = deleteButtons.first();
      await firstDeleteButton.click();
      
      // Verify confirmation dialog appears (browser confirm)
      // Note: Playwright handles browser dialogs automatically
      // The confirmation will be automatically accepted in test mode
      
      // Wait a moment for the deletion to process
      await page.waitForTimeout(1000);
      
      // Verify page is still functional after deletion
      await expect(page.getByText('Budget Management')).toBeVisible();
    }
  });

  test('should show budget details dialog when budgets exist', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for view details buttons on existing budgets
    const viewDetailsButtons = page.locator('button').filter({ hasText: /view details/i });
    
    // If view details buttons exist, test the functionality
    if (await viewDetailsButtons.count() > 0) {
      const firstViewDetailsButton = viewDetailsButtons.first();
      await firstViewDetailsButton.click();
      
      // Verify details dialog opens
      await expect(page.getByText('Budget Details')).toBeVisible();
      
      // Check if details content is present
      await expect(page.getByText(/category/i)).toBeVisible();
      await expect(page.getByText(/budget amount/i)).toBeVisible();
      
      // Close dialog by clicking outside
      await page.click('body');
      
      // Verify dialog is closed
      await expect(page.getByText('Budget Details')).not.toBeVisible();
    }
  });

//   test('should display budget progress indicators', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Check if progress indicators are present
//     const progressIndicators = page.locator('.h-2'); // Progress bar class
//     await expect(progressIndicators).toBeVisible();
//   });

//   test('should display budget status badges', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Check if status badges are present
//     const statusBadges = page.locator('.border-0'); // Badge class
//     await expect(statusBadges).toBeVisible();
//   });

  test('should handle pagination if multiple budgets exist', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for pagination elements
    const paginationButtons = page.locator('button').filter({ hasText: /previous|next/i });
    
    // If pagination buttons exist, test pagination
    if (await paginationButtons.count() > 0) {
      const nextButton = page.getByRole('button', { name: /next/i });
      const previousButton = page.getByRole('button', { name: /previous/i });
      
      // Test next button if it's enabled
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
      
      // Test previous button if it's enabled
      if (await previousButton.isEnabled()) {
        await previousButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

//   test('should have proper form validation attributes', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Open create budget dialog
//     const createBudgetButton = page.getByRole('button', { name: /create budget/i });
//     await createBudgetButton.click();
    
//     const budgetAmountInput = page.getByLabel(/budget amount/i);
//     const startDateInput = page.getByLabel(/start date/i);
//     const endDateInput = page.getByLabel(/end date/i);
    
//     // Check if inputs have proper attributes
//     await expect(budgetAmountInput).toHaveAttribute('type', 'number');
//     await expect(startDateInput).toHaveAttribute('type', 'date');
//     await expect(endDateInput).toHaveAttribute('type', 'date');
//   });

//   test('should display budget categories when available', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Check if category elements are present
//     const categoryElements = page.locator('.font-semibold.text-white');
//     await expect(categoryElements).toBeVisible();
//   });

//   test('should have responsive design elements', async ({ page }) => {
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Check if responsive grid layout is present
//     const responsiveGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    
//     // Responsive layout should be visible
//     await expect(responsiveGrid).toBeVisible();
//   });
});