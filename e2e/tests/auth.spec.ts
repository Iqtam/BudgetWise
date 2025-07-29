// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
  });

  test('should navigate between signin and signup pages', async ({ page }) => {
    // Start on signup page
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on signup page
    await expect(page).toHaveTitle(/Sign Up - BudgetWise/i);
    
    // Navigate to signin page
    await page.getByRole('link', { name: /sign in/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're on signin page
    await expect(page).toHaveTitle(/Sign In - BudgetWise/i);
    
    // Navigate back to signup
    await page.getByRole('link', { name: /sign up/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're back on signup page
    await expect(page).toHaveTitle(/Sign Up - BudgetWise/i);
  });

  test('should show validation error for weak password', async ({ page }) => {
    await page.goto('/signup');
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
    await page.goto('/signup');
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

//   test('should show validation error for invalid email format', async ({ page }) => {
//     await page.goto('/signup');
//     await page.waitForLoadState('networkidle');
    
//     const emailInput = page.getByRole('textbox', { name: /email/i }) || 
//                        page.getByPlaceholder(/enter your email/i);
//     const passwordInput = page.getByLabel(/^password$/i);
//     const confirmPasswordInput = page.getByLabel(/confirm password/i);
//     const signupButton = page.getByRole('button', { name: /sign up/i });
    
//     // Fill with invalid email
//     await emailInput.fill('invalid-email');
//     await passwordInput.fill('validpassword123');
//     await confirmPasswordInput.fill('validpassword123');
    
//     await signupButton.click();
    
//     // Verify error message appears
//     const errorMessage = page.getByText(/invalid email/i).or(
//       page.getByText(/please enter a valid email/i)
//     );
//     await expect(errorMessage).toBeVisible();
//   });

//   test('should show validation errors for empty fields', async ({ page }) => {
//     await page.goto('/signup');
//     await page.waitForLoadState('networkidle');
    
//     const signupButton = page.getByRole('button', { name: /sign up/i });
    
//     // Try to submit empty form
//     await signupButton.click();
    
//     // Verify error messages appear
//     const emailError = page.getByText(/email is required/i).or(
//       page.getByText(/email field is required/i)
//     );
//     const passwordError = page.getByText(/password is required/i).or(
//       page.getByText(/password field is required/i)
//     );
//     await expect(emailError).toBeVisible();
//     await expect(passwordError).toBeVisible();
//   });

//   test('should handle signin page elements', async ({ page }) => {
//     await page.goto('/signin');
//     await page.waitForLoadState('networkidle');
    
//     // Verify signin page elements
//     await expect(page.getByText('Sign In')).toBeVisible();
//     await expect(page.getByText('Welcome back')).toBeVisible();
    
//     const emailInput = page.getByRole('textbox', { name: /email/i }) || 
//                        page.getByPlaceholder(/enter your email/i);
//     const passwordInput = page.getByLabel(/^password$/i);
//     const signinButton = page.getByRole('button', { name: /sign in/i });
    
//     await expect(emailInput).toBeVisible();
//     await expect(passwordInput).toBeVisible();
//     await expect(signinButton).toBeVisible();
//   });

//   test('should show error for invalid credentials', async ({ page }) => {
//     await page.goto('/signin');
//     await page.waitForLoadState('networkidle');
    
//     const emailInput = page.getByRole('textbox', { name: /email/i }) || 
//                        page.getByPlaceholder(/enter your email/i);
//     const passwordInput = page.getByLabel(/^password$/i);
//     const signinButton = page.getByRole('button', { name: /sign in/i });
    
//     // Fill with invalid credentials
//     await emailInput.fill('nonexistent@example.com');
//     await passwordInput.fill('wrongpassword');
    
//     await signinButton.click();
    
//     // Verify error message appears
//     const errorMessage = page.getByText(/invalid credentials/i).or(
//       page.getByText(/incorrect email or password/i)
//     ).or(
//       page.getByText(/authentication failed/i)
//     );
//     await expect(errorMessage).toBeVisible();
//   });

  test('should handle Google signin button', async ({ page }) => {
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    
    const googleButton = page.getByRole('button', { name: /continue with google/i });
    await expect(googleButton).toBeVisible();
    
    // Note: Testing actual Google OAuth flow would require additional setup
    // This test just verifies the button is present and clickable
    await expect(googleButton).toBeEnabled();
  });

  test('should display all signup form elements', async ({ page }) => {
    await page.goto('/signup');
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
}); 