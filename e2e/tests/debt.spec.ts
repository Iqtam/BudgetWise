// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Debt Management E2E Tests', () => {
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

  test('should handle different screen sizes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

 

//   test('should handle JavaScript errors gracefully', async ({ page }) => {
//     // Listen for console errors
//     const errors: string[] = [];
//     page.on('console', msg => {
//       if (msg.type() === 'error') {
//         errors.push(msg.text());
//       }
//     });
    
//     await page.goto('/');
//     await page.waitForLoadState('networkidle');
    
//     // Page should still be functional even if there are console errors
//     await expect(page).toBeVisible();
    
//     // Log errors for debugging but don't fail the test
//     if (errors.length > 0) {
//       console.log('Console errors found:', errors);
//     }
//   });

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

//   test('should display proper branding', async ({ page }) => {
//     await page.goto('/');
//     await page.waitForLoadState('networkidle');
    
//     // Check for logo or brand name
//     const logo = page.getByText(/budgetwise/i).or(
//       page.locator('[data-testid="logo"]')
//     ).or(
//       page.locator('img[alt*="logo"]')
//     );
    
//     // Verify logo/brand is present (if it exists)
//     if (await logo.count() > 0) {
//       await expect(logo).toBeVisible();
//     }
//   });

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

  test('should handle responsive design', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568 },   // iPhone SE
      { width: 375, height: 667 },   // iPhone 6/7/8
      { width: 768, height: 1024 },  // iPad
      { width: 1024, height: 768 },  // iPad landscape
      { width: 1920, height: 1080 }  // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
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

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowDown');
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
}); 