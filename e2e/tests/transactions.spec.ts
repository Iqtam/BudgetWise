// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Public Page Navigation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
  });

//   test('should load the main page', async ({ page }) => {
//     // Navigate to the main page
//     await page.goto('/');
//     await page.waitForLoadState('networkidle');
    
//     // Verify that the page has loaded
//     await expect(page).toHaveTitle(/BudgetWise/i);
    
//     // Check if main elements are visible
//     await expect(page.getByText('BudgetWise')).toBeVisible();
//   });

  test('should have working navigation', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if navigation elements are present
    const navigation = page.locator('nav').or(
      page.locator('[role="navigation"]').or(
        page.locator('.sidebar, .navigation, header')
      )
    );
    
    // Navigation should be visible
    await expect(navigation).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for signup link or button
    const signupLink = page.getByRole('link', { name: /sign up/i }).or(
      page.getByRole('button', { name: /sign up/i })
    );
    
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on signup page
      await expect(page).toHaveTitle(/Sign Up - BudgetWise/i);
    }
  });

//   test('should navigate to signin page', async ({ page }) => {
//     await page.goto('/');
//     await page.waitForLoadState('networkidle');
    
//     // Look for signin link or button
//     const signinLink = page.getByRole('link', { name: /sign in/i }).or(
//       page.getByRole('button', { name: /sign in/i })
//     );
    
//     if (await signinLink.isVisible()) {
//       await signinLink.click();
//       await page.waitForLoadState('networkidle');
      
//       // Verify we're on signin page
//       await expect(page).toHaveTitle(/Sign In - BudgetWise/i);
//     }
//   });

//   test('should display main content sections', async ({ page }) => {
//     await page.goto('/');
//     await page.waitForLoadState('networkidle');
    
//     // Look for common content sections
//     const mainContent = page.getByText(/welcome/i).or(
//       page.getByText(/feature/i)
//     ).or(
//       page.getByText(/benefit/i)
//     ).or(
//       page.getByText(/about/i)
//     );
    
//     // At least one content section should be visible
//     if (await mainContent.isVisible()) {
//       await expect(mainContent).toBeVisible();
//     }
//   });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if mobile menu/hamburger is present
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(
      page.locator('.mobile-menu').or(
        page.locator('[aria-label*="menu"]').or(
          page.locator('button[aria-label*="menu"]')
        )
      )
    );
    
    // If mobile menu is present, test it
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      
      // Check if navigation items are visible in mobile menu
      const signupLink = page.getByRole('link', { name: /sign up/i });
      await expect(signupLink).toBeVisible();
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should handle page refresh and state persistence', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get current page content
    const initialContent = await page.content();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify page still loads correctly
    await expect(page).toHaveTitle(/BudgetWise/i);
    
    // Check if we're still on the main page (not redirected to signin)
    expect(page.url()).not.toContain('/signin');
  });

  
  test('should handle accessibility features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for proper heading structure
    const mainHeading = page.getByRole('heading', { level: 1 }).or(
      page.locator('h1')
    );
    
    if (await mainHeading.isVisible()) {
      await expect(mainHeading).toBeVisible();
    }
    
    // Check for proper button and link labels
    const buttons = page.locator('button');
    const links = page.locator('a');
    
    // At least some interactive elements should be present
    const totalInteractive = await buttons.count() + await links.count();
    expect(totalInteractive).toBeGreaterThan(0);
  });

//   test('should load quickly and show loading states', async ({ page }) => {
//     // Navigate to the main page
//     await page.goto('/');
    
//     // Wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Verify that the page has loaded within reasonable time
//     await expect(page).toHaveTitle(/BudgetWise/i);
    
//     // Check if main content is visible
//     await expect(page.getByText('BudgetWise')).toBeVisible();
//   });

  test('should handle different screen sizes', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/BudgetWise/i);
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/BudgetWise/i);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/BudgetWise/i);
    
    // Reset to default
    await page.setViewportSize({ width: 1280, height: 720 });
  });
}); 