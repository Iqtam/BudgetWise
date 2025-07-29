// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Basic E2E Tests', () => {
  test('should load the main page', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify that the page has loaded
    await expect(page).toHaveTitle(/BudgetWise/i);
  });

  test('should have working navigation', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for the page to load
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
});
