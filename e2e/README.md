# BudgetWise E2E Testing

This directory contains end-to-end tests for the BudgetWise application using Playwright.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Docker** (for running tests in containers)
3. **Frontend and Backend** services running

### Running Tests Locally

1. **Start the application services:**
   ```bash
   # From the root directory
   docker-compose up -d frontend backend
   ```

2. **Install E2E dependencies:**
   ```bash
   cd e2e
   npm install
   ```

3. **Run all tests:**
   ```bash
   npm test
   ```

4. **Run tests with UI (for debugging):**
   ```bash
   npm run test:ui
   ```

5. **Run tests in headed mode (see browser):**
   ```bash
   npm run test:headed
   ```

6. **Run tests in debug mode:**
   ```bash
   npm run test:debug
   ```

### Running Tests with Docker

```bash
# From the root directory
docker-compose -f docker-compose.test.yml --profile e2e up e2e-test
```

## 📁 Test Structure

### Test Files

- **`basic.spec.ts`** - Basic page loading and navigation tests
- **`signup.spec.ts`** - Comprehensive signup flow testing
- **`auth.spec.ts`** - Authentication flows (signin, signup, validation)
- **`dashboard.spec.ts`** - Dashboard functionality and navigation
- **`transactions.spec.ts`** - Transaction management functionality
- **`budget.spec.ts`** - Budget management functionality (partially commented)

### Test Utilities

- **`utils/test-helpers.ts`** - Common helper functions for testing

## 🧪 Test Categories

### 1. Authentication Tests (`auth.spec.ts`)
- ✅ Navigation between signin/signup pages
- ✅ Form validation (email format, password strength, etc.)
- ✅ Successful signup flow
- ✅ Signin functionality
- ✅ Error handling for invalid credentials
- ✅ Google OAuth button presence

### 2. Dashboard Tests (`dashboard.spec.ts`)
- ✅ Dashboard page loading
- ✅ Navigation sidebar functionality
- ✅ Widget and component display
- ✅ User profile and settings
- ✅ Responsive design (mobile)
- ✅ Page refresh and state persistence

### 3. Transaction Tests (`transactions.spec.ts`)
- ✅ Transaction page loading
- ✅ Add transaction dialog
- ✅ Form field validation
- ✅ Transaction filtering and search
- ✅ Edit and delete functionality
- ✅ Bulk operations
- ✅ Export functionality

### 4. Basic Tests (`basic.spec.ts`)
- ✅ Main page loading
- ✅ Navigation elements presence

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **Base URL:** `http://localhost:3000`
- **Browsers:** Chromium, Firefox, Mobile Chrome
- **Timeouts:** 60s per test, 10s per action
- **Screenshots:** On failure only
- **Videos:** On failure only
- **Traces:** On first retry

### Test Environment

- **Frontend:** SvelteKit application
- **Backend:** Node.js/Express API
- **Database:** PostgreSQL
- **Authentication:** Firebase Auth

## 📊 Test Reports

After running tests, you can view reports:

```bash
# View HTML report
npm run show-report

# Reports are saved in:
# - playwright-report/ (HTML report)
# - test-results/ (screenshots, videos, traces)
```

## 🐛 Debugging Tests

### 1. UI Mode
```bash
npm run test:ui
```
Opens Playwright's UI mode for interactive debugging.

### 2. Debug Mode
```bash
npm run test:debug
```
Runs tests in debug mode with step-by-step execution.

### 3. Headed Mode
```bash
npm run test:headed
```
Runs tests with visible browser windows.

### 4. Specific Test
```bash
npx playwright test auth.spec.ts
```

### 5. Specific Test with Line Number
```bash
npx playwright test auth.spec.ts:15
```

## 🔍 Test Helpers

### Common Helper Functions

```typescript
import { checkAuthentication, generateTestData, fillTransactionForm } from './utils/test-helpers';

// Check if user is authenticated
const isAuthenticated = await checkAuthentication(page);

// Generate unique test data
const testData = generateTestData();

// Fill transaction form
await fillTransactionForm(page, {
  amount: '100.00',
  description: 'Test transaction',
  category: 'Food & Dining'
});
```

## 🚨 Common Issues

### 1. Authentication Required
Many tests require authentication. If you see:
```
test.skip('User not authenticated - skipping dashboard tests');
```
You need to sign in first or set up test authentication.

### 2. Element Not Found
Tests use flexible selectors that try multiple approaches:
```typescript
const button = page.getByRole('button', { name: /add transaction/i }).or(
  page.getByRole('button', { name: /new transaction/i })
);
```

### 3. Timeout Issues
- Increase timeouts in `playwright.config.ts`
- Check if the application is running
- Verify network connectivity

### 4. Browser Issues
- Tests run on Chromium by default
- Firefox and WebKit are available but may have compatibility issues
- Mobile tests use Pixel 5 viewport

## 📈 Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests in `describe` blocks
- Use `beforeEach` for setup
- Handle authentication gracefully

### 2. Selectors
- Prefer role-based selectors (`getByRole`)
- Use fallback selectors with `.or()`
- Avoid brittle CSS selectors

### 3. Assertions
- Use flexible text matching with regex
- Check for multiple possible outcomes
- Handle optional elements gracefully

### 4. Error Handling
- Take screenshots on failure
- Log helpful error messages
- Skip tests when prerequisites aren't met

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    cd e2e
    npm install
    npm test
```

### Docker Integration
```bash
docker-compose -f docker-compose.test.yml --profile e2e up e2e-test
```

## 📝 Adding New Tests

1. **Create test file:** `tests/feature.spec.ts`
2. **Import Playwright:** `import { test, expect } from '@playwright/test'`
3. **Use helper functions:** Import from `utils/test-helpers.ts`
4. **Follow naming convention:** `should [expected behavior]`
5. **Handle authentication:** Check if user is signed in
6. **Use flexible selectors:** Multiple fallback options

### Example Test Structure
```typescript
test.describe('Feature E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feature');
    // Handle authentication
  });

  test('should load the feature page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Feature - BudgetWise/i);
  });
});
```

## 🎯 Test Coverage Goals

- [x] Authentication flows
- [x] Dashboard functionality
- [x] Transaction management
- [x] Basic navigation
- [ ] Budget management
- [ ] Analytics and reporting
- [ ] Settings and preferences
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Performance testing

## 📞 Support

For issues with E2E tests:
1. Check the test logs
2. View the HTML report
3. Run tests in debug mode
4. Check application logs
5. Verify service connectivity 