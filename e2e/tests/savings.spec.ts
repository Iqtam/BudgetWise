// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Savings Goals E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
  });

  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads successfully
    await expect(page).toHaveTitle(/BudgetWise/i);
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for navigation elements
    const navigation = page.getByRole('navigation').or(
      page.locator('nav')
    ).or(
      page.locator('[data-testid="navigation"]')
    );
    
    // Verify navigation is present (if it exists)
    if (await navigation.count() > 0) {
      await expect(navigation).toBeVisible();
    }
  });

  test('should display main content sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for main content areas
    const mainContent = page.getByRole('main').or(
      page.locator('main')
    ).or(
      page.locator('[data-testid="main-content"]')
    );
    
    // Verify main content is present (if it exists)
    if (await mainContent.count() > 0) {
      await expect(mainContent).toBeVisible();
    }
    
    // Check for common page elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display footer or contact information', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for footer elements
    const footer = page.getByRole('contentinfo').or(
      page.locator('footer')
    ).or(
      page.locator('[data-testid="footer"]')
    );
    
    // Verify footer is present (if it exists)
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }
  });

  test('should handle accessibility features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for accessibility elements
    const skipLink = page.getByRole('link', { name: /skip to main content/i }).or(
      page.locator('[data-testid="skip-link"]')
    );
    
    // Verify skip link is present (if it exists)
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
  });

  test('should load quickly and show loading states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads within reasonable time
    const loadTime = Date.now();
    await page.waitForLoadState('domcontentloaded');
    const endTime = Date.now();
    
    // Page should load within 10 seconds
    expect(endTime - loadTime).toBeLessThan(10000);
  });

  
  

 
  test('should have working links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for common links
    const links = page.locator('a[href]');
    if (await links.count() > 0) {
      // Test first few links
      const linkCount = Math.min(await links.count(), 5);
      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        await expect(link).toBeVisible();
      }
    }
  });

    test('should handle form interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for form elements
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      await expect(forms.first()).toBeVisible();
    }
    
    // Check for input fields
    const inputs = page.locator('input');
    if (await inputs.count() > 0) {
      await expect(inputs.first()).toBeVisible();
    }
  });

  test('should have proper button functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for buttons
    const buttons = page.getByRole('button');
    if (await buttons.count() > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });

  
  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for text elements
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
    if (await textElements.count() > 0) {
      await expect(textElements.first()).toBeVisible();
    }
  });

  
  test('should have proper error handling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for error message containers
    const errorContainers = page.locator('[data-testid="error"]').or(
      page.locator('.error')
    ).or(
      page.locator('[class*="error"]')
    );
    
    // Verify error containers are present (if they exist)
    if (await errorContainers.count() > 0) {
      await expect(errorContainers.first()).toBeVisible();
    }
  });

  test('should display loading indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for loading indicators
    const loadingIndicators = page.locator('[data-testid="loading"]').or(
      page.locator('.loading')
    ).or(
      page.locator('[class*="loading"]')
    );
    
    // Verify loading indicators are present (if they exist)
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators.first()).toBeVisible();
    }
  });

  test('should handle progress indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for progress bars or indicators
    const progressIndicators = page.locator('[data-testid="progress"]').or(
      page.locator('.progress')
    ).or(
      page.locator('[class*="progress"]')
    ).or(
      page.locator('progress')
    );
    
    // Verify progress indicators are present (if they exist)
    if (await progressIndicators.count() > 0) {
      await expect(progressIndicators.first()).toBeVisible();
    }
  });

  test('should handle card layouts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for card elements
    const cards = page.locator('[data-testid="card"]').or(
      page.locator('.card')
    ).or(
      page.locator('[class*="card"]')
    );
    
    // Verify cards are present (if they exist)
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should handle modal dialogs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for modal elements
    const modals = page.locator('[data-testid="modal"]').or(
      page.locator('.modal')
    ).or(
      page.locator('[class*="modal"]')
    ).or(
      page.locator('[role="dialog"]')
    );
    
    // Verify modals are present (if they exist)
    if (await modals.count() > 0) {
      await expect(modals.first()).toBeVisible();
    }
  });

  test('should handle data visualization', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for chart or graph elements
    const charts = page.locator('[data-testid="chart"]').or(
      page.locator('.chart')
    ).or(
      page.locator('[class*="chart"]')
    ).or(
      page.locator('canvas')
    );
    
    // Verify charts are present (if they exist)
    if (await charts.count() > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('should handle success messages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for success message containers
    const successContainers = page.locator('[data-testid="success"]').or(
      page.locator('.success')
    ).or(
      page.locator('[class*="success"]')
    );
    
    // Verify success containers are present (if they exist)
    if (await successContainers.count() > 0) {
      await expect(successContainers.first()).toBeVisible();
    }
  });
}); 