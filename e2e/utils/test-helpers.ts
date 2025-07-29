import { Page, expect } from '@playwright/test';

/**
 * Helper function to wait for authentication and skip tests if not authenticated
 */
export async function checkAuthentication(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  if (currentUrl.includes('/signin')) {
    return false;
  }
  return true;
}

/**
 * Helper function to generate unique test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  return {
    email: `test${timestamp}@example.com`,
    password: 'validpassword123',
    amount: '100.00',
    description: `Test transaction ${timestamp}`,
    category: 'Food & Dining'
  };
}

/**
 * Helper function to fill common form fields
 */
export async function fillTransactionForm(page: Page, data: {
  amount?: string;
  description?: string;
  category?: string;
  date?: string;
}) {
  const amountInput = page.getByLabel(/amount/i).or(
    page.getByPlaceholder(/enter amount/i)
  );
  const descriptionInput = page.getByLabel(/description/i).or(
    page.getByPlaceholder(/enter description/i)
  );
  const categorySelect = page.getByLabel(/category/i).or(
    page.getByRole('combobox', { name: /category/i })
  );
  const dateInput = page.getByLabel(/date/i).or(
    page.getByPlaceholder(/select date/i)
  );

  if (data.amount && await amountInput.isVisible()) {
    await amountInput.fill(data.amount);
  }

  if (data.description && await descriptionInput.isVisible()) {
    await descriptionInput.fill(data.description);
  }

  if (data.category && await categorySelect.isVisible()) {
    await categorySelect.selectOption(data.category);
  }

  if (data.date && await dateInput.isVisible()) {
    await dateInput.fill(data.date);
  }
}

/**
 * Helper function to fill authentication form
 */
export async function fillAuthForm(page: Page, data: {
  email: string;
  password: string;
  confirmPassword?: string;
}) {
  const emailInput = page.getByRole('textbox', { name: /email/i }) || 
                     page.getByPlaceholder(/enter your email/i);
  const passwordInput = page.getByLabel(/^password$/i);
  const confirmPasswordInput = page.getByLabel(/confirm password/i);

  await emailInput.fill(data.email);
  await passwordInput.fill(data.password);

  if (data.confirmPassword && await confirmPasswordInput.isVisible()) {
    await confirmPasswordInput.fill(data.confirmPassword);
  }
}

/**
 * Helper function to wait for page load and check for errors
 */
export async function waitForPageLoad(page: Page, expectedTitle?: string) {
  await page.waitForLoadState('networkidle');
  
  if (expectedTitle) {
    await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  }
  
  // Check for common error states
  const errorElements = page.locator('.error, .alert, [role="alert"]');
  if (await errorElements.count() > 0) {
    const errorText = await errorElements.first().textContent();
    console.log(`Warning: Error detected on page: ${errorText}`);
  }
}

/**
 * Helper function to handle modal dialogs
 */
export async function handleModal(page: Page, action: 'accept' | 'cancel' | 'close') {
  const modal = page.locator('[role="dialog"]').or(
    page.locator('.modal').or(
      page.locator('.dialog')
    )
  );

  if (await modal.isVisible()) {
    switch (action) {
      case 'accept':
        const acceptButton = page.getByRole('button', { name: /ok|yes|confirm|save/i });
        if (await acceptButton.isVisible()) {
          await acceptButton.click();
        }
        break;
      case 'cancel':
        const cancelButton = page.getByRole('button', { name: /cancel|no/i });
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
        break;
      case 'close':
        const closeButton = page.getByRole('button', { name: /close/i }).or(
          page.locator('[aria-label="Close"]')
        );
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
        break;
    }
  }
}

/**
 * Helper function to check for loading states
 */
export async function waitForLoadingToComplete(page: Page) {
  // Wait for any loading spinners to disappear
  const loadingSpinner = page.locator('.loading, .spinner, [aria-label="Loading"]');
  if (await loadingSpinner.isVisible()) {
    await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
  }
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to take a screenshot on test failure
 */
export async function takeScreenshotOnFailure(page: Page, testName: string) {
  try {
    await page.screenshot({ 
      path: `test-results/failure-${testName}-${Date.now()}.png`,
      fullPage: true 
    });
  } catch (error) {
    console.log('Failed to take screenshot:', error);
  }
}

/**
 * Helper function to check if element exists and is visible
 */
export async function elementExistsAndVisible(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  return await element.isVisible();
}

/**
 * Helper function to safely click an element
 */
export async function safeClick(page: Page, selector: string) {
  const element = page.locator(selector);
  if (await element.isVisible()) {
    await element.click();
    return true;
  }
  return false;
}

/**
 * Helper function to check for toast notifications
 */
export async function checkForToast(page: Page, expectedMessage?: string): Promise<boolean> {
  const toast = page.locator('.toast, .notification, [role="alert"]');
  
  if (await toast.isVisible()) {
    if (expectedMessage) {
      await expect(toast).toContainText(expectedMessage);
    }
    return true;
  }
  return false;
} 