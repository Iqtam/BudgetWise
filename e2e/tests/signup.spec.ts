// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Signup Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the signup page before each test
    await page.goto('/signup');
  });

  test('should load the signup page', async ({ page }) => {
    // wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify that the signup page has loaded
    await expect(page).toHaveTitle(/Sign Up - BudgetWise/i);
    
    // Check if main elements are visible
    await expect(page.getByText('BudgetWise')).toBeVisible();
    await expect(page.getByText('Create Account')).toBeVisible();
    await expect(page.getByText('Start your journey to financial freedom')).toBeVisible();
  });

  test('should display all signup form elements', async ({ page }) => {
    // wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if form fields are present
    const emailInput = page.getByRole('textbox', { name: /email/i }) || 
                       page.getByPlaceholder(/enter your email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
    
    // Check if buttons are present
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    
    // Check if link to signin is present
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation error for weak password', async ({ page }) => {
    // wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Create test data
    const testEmail = `test${Date.now()}@example.com`;
    const weakPassword = '123'; // Less than 8 characters
    
    // Find form fields
    const emailInput = page.getByRole('textbox', { name: /email/i }) || 
                       page.getByPlaceholder(/enter your email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    const signupButton = page.getByRole('button', { name: /sign up/i });
    
    // Fill in form with weak password
    await emailInput.fill(testEmail);
    await passwordInput.fill(weakPassword);
    await confirmPasswordInput.fill(weakPassword);
    
    // Submit the form
    await signupButton.click();
    
    // Verify error message appears
    await expect(page.getByText('Weak password')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters long.')).toBeVisible();
  });

  test('should show validation error for password mismatch', async ({ page }) => {
    // wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Create test data
    const testEmail = `test${Date.now()}@example.com`;
    const password1 = 'validpassword123';
    const password2 = 'differentpassword123';
    
    // Find form fields
    const emailInput = page.getByRole('textbox', { name: /email/i }) || 
                       page.getByPlaceholder(/enter your email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    const signupButton = page.getByRole('button', { name: /sign up/i });
    
    // Fill in form with mismatched passwords
    await emailInput.fill(testEmail);
    await passwordInput.fill(password1);
    await confirmPasswordInput.fill(password2);
    
    // Submit the form
    await signupButton.click();
    
    // Verify error message appears
    await expect(page.getByText('Password mismatch')).toBeVisible();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    // wait for the page to load
    await page.waitForLoadState('networkidle');
    
    const passwordInput = page.getByLabel(/^password$/i);
    // Find the eye icon button (password toggle)
    const toggleButton = passwordInput.locator('..').getByRole('button').first() ||
                         page.locator('button').filter({ has: page.locator('svg') }).first();
    
    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click toggle to hide password again
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should navigate to signin page when clicking sign in link', async ({ page }) => {
    // wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click the sign in link
    const signinLink = page.getByRole('link', { name: /sign in/i });
    await expect(signinLink).toBeVisible();
    
    await signinLink.click();
    
    // Verify navigation to signin page
    await expect(page).toHaveURL(/\/signin/);
  });

//   test('should show loading state when submitting valid form', async ({ page }) => {
//     // wait for the page to load
//     await page.waitForLoadState('networkidle');
    
//     // Create test data
//     const testEmail = `test${Date.now()}@example.com`;
//     const validPassword = 'validpassword123';
    
//     // Find form fields
//     const emailInput = page.getByRole('textbox', { name: /email/i }) || 
//                        page.getByPlaceholder(/enter your email/i);
//     const passwordInput = page.getByLabel(/^password$/i);
//     const confirmPasswordInput = page.getByLabel(/confirm password/i);
//     const signupButton = page.getByRole('button', { name: /sign up/i });
    
//     // Fill in form with valid data
//     await emailInput.fill(testEmail);
//     await passwordInput.fill(validPassword);
//     await confirmPasswordInput.fill(validPassword);
    
//     // Submit the form
//     await signupButton.click();
    
//     // Check for loading state (this will show briefly before likely showing an error)
//     // Note: This will likely fail with Firebase/backend errors in test environment
//     await expect(page.getByText(/creating account/i)).toBeVisible({ timeout: 2000 });
    
//     // Since Firebase isn't configured for testing, expect an error message
//     await expect(page.getByText(/sign up failed/i)).toBeVisible({ timeout: 5000 });
//   });

  test('should have proper form validation attributes', async ({ page }) => {
    // wait for the page to load
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.getByRole('textbox', { name: /email/i }) || 
                       page.getByPlaceholder(/enter your email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const confirmPasswordInput = page.getByLabel(/confirm password/i);
    
    // Check if inputs have proper attributes
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
    await expect(confirmPasswordInput).toHaveAttribute('required');
  });
}); 