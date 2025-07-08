# Testing Documentation

## Overview

This document covers the testing setup for the BudgetWise backend API.

## Test Setup

We use **Jest** for unit testing with **Supertest** for HTTP endpoint testing.

### Dependencies

- `jest`: Testing framework
- `supertest`: HTTP testing library
- `@types/jest`: TypeScript definitions for Jest

## Test Structure

### Unit Tests

Located in `src/__tests__/` directory.

#### Transaction Controller Tests

- **File**: `src/__tests__/transactionController.test.js`
- **Coverage**:
  - ✅ Creating new transactions
  - ✅ Handling missing required fields
  - ✅ Setting default values for optional fields
  - ✅ Fetching transactions for specific users
  - ✅ Error handling for database failures

### Test Cases

#### POST /transactions

1. **Success Case**: Create transaction with all fields
2. **Error Case**: Missing required fields
3. **Default Values**: Test automatic field defaults

#### GET /transactions

1. **Success Case**: Fetch user transactions
2. **Error Case**: Database connection failure

## Test Coverage Report

Current coverage (as of latest run):

- **Transaction Controller**: 100% coverage
- **Lines**: 100% of controller logic tested
- **Functions**: All public methods tested
- **Branches**: All conditional logic paths tested

## Mocking Strategy

### Database Mocking

```javascript
jest.mock("../models/Transaction", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));
```

We mock the Sequelize models to:

- Isolate unit tests from database dependencies
- Control test data and scenarios
- Ensure fast, predictable test execution

## CI/CD Integration

Tests are automatically run in the CI pipeline on:

- **Push** to main, develop, new-frontend-test branches
- **Pull Requests** to main, develop branches

### CI Test Jobs

1. **Unit Tests**: Run on Node.js 18.x and 20.x
2. **Coverage Reports**: Generated and uploaded to Codecov
3. **Security Audit**: npm audit for vulnerabilities

## Adding New Tests

### 1. Create Test File

```bash
# For controller tests
src/__tests__/[controllerName]Controller.test.js

# For service tests
src/__tests__/[serviceName]Service.test.js
```

### 2. Basic Test Template

```javascript
const request = require("supertest");
const express = require("express");
const controller = require("../controllers/yourController");

// Mock dependencies
jest.mock("../models/YourModel");

describe("Your Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should perform expected behavior", async () => {
    // Arrange
    const mockData = {
      /* test data */
    };

    // Act
    const response = await request(app).post("/endpoint").send(mockData);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
  });
});
```

## Best Practices

### ✅ Do's

- Mock external dependencies (database, APIs)
- Test both success and error scenarios
- Use descriptive test names
- Keep tests isolated and independent
- Assert on specific response properties
- Test edge cases and boundary conditions

### ❌ Don'ts

- Don't test implementation details
- Don't rely on external services in unit tests
- Don't write overly complex test setups
- Don't ignore test failures in CI

## Future Testing Enhancements

### Planned Additions

1. **Integration Tests**: Full API workflow testing
2. **Performance Tests**: Load testing for critical endpoints
3. **Contract Tests**: API contract validation
4. **Database Tests**: Repository layer testing
5. **Authentication Tests**: Firebase token validation

### Test Categories to Add

- Category Controller Tests
- Budget Controller Tests
- OCR Controller Tests
- Authentication Middleware Tests
- Database Model Tests

## Troubleshooting

### Common Issues

#### Tests Timing Out

```bash
# Increase Jest timeout
jest.setTimeout(30000);
```

#### Mock Not Working

```bash
# Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### Database Connection Errors

- Ensure mocks are properly configured
- Check that models are mocked before importing

## Commands Reference

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=transactionController

# Run tests with verbose output
npm test -- --verbose

# Update snapshots (if using)
npm test -- --updateSnapshot
```

## How to Run Tests

### Prerequisites

First, make sure you're in the backend directory and have all dependencies installed:

```bash
cd backend
npm install
```

### Basic Test Commands

#### 1. **Run All Tests**
```bash
npm test
```
This runs all test suites once and shows the results.

#### 2. **Run Tests in Watch Mode**
```bash
npm run test:watch
```
This runs tests continuously and re-runs when files change. Great for development.

#### 3. **Run Tests with Coverage Report**
```bash
npm run test:coverage
```
This generates a detailed coverage report showing which lines of code are tested.

#### 4. **Check Test Status**
```bash
npm run test:status
```
This runs tests and generates a status badge with coverage information.

### Advanced Test Commands

#### **Run Specific Test Files**
```bash
# Run only transaction controller tests
npm test -- --testPathPattern=transactionController

# Run only OCR controller tests
npm test -- --testPathPattern=ocrController

# Run only chat controller tests
npm test -- --testPathPattern=chatController
```

#### **Run Specific Test Suites**
```bash
# Run tests matching a specific pattern
npm test -- --testNamePattern="Transaction Controller"

# Run tests containing "POST" in the name
npm test -- --testNamePattern="POST"
```

#### **Run Tests with Verbose Output**
```bash
npm test -- --verbose
```

#### **Run Tests with Coverage for Specific Files**
```bash
npm test -- --coverage --testPathPattern=transactionController
```

### Test Output Examples

#### **Successful Test Run**
```bash
$ npm test

 PASS  src/__tests__/transactionController.test.js
 PASS  src/__tests__/ocrController.test.js
 PASS  src/__tests__/chatController.test.js

Test Suites: 3 passed, 3 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        2.145 s
Ran all test suites.
```

#### **Coverage Report**
```bash
$ npm run test:coverage

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   100.00 |    100.00 |   100.00 |   100.00 |
----------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        2.145 s
```

### Test Structure

The tests are organized as follows:

```
backend/src/__tests__/
├── transactionController.test.js  # Manual transaction tests
├── ocrController.test.js         # OCR and receipt processing tests
└── chatController.test.js        # Chat-based transaction tests
```

### What Each Test File Covers

#### **transactionController.test.js**
- ✅ Creating transactions (manual entry)
- ✅ Reading transactions with filtering
- ✅ Updating transactions
- ✅ Deleting transactions
- ✅ Budget sync integration
- ✅ Error handling and corner cases

#### **ocrController.test.js**
- ✅ Receipt image processing
- ✅ Chat-based transaction extraction
- ✅ File upload validation
- ✅ AI integration testing
- ✅ Error scenarios

#### **chatController.test.js**
- ✅ General financial advice queries
- ✅ Transaction creation through chat
- ✅ Chat history management
- ✅ AI response processing
- ✅ Error handling

### Troubleshooting

#### **If Tests Fail**

1. **Check Dependencies**
   ```bash
   npm install
   ```

2. **Clear Jest Cache**
   ```bash
   npx jest --clearCache
   ```

3. **Run with Verbose Output**
   ```bash
   npm test -- --verbose
   ```

4. **Check for Environment Issues**
   ```bash
   # Make sure you're in the backend directory
   pwd
   ls -la src/__tests__/
   ```

#### **Common Issues**

- **Module not found errors**: Run `npm install` to ensure all dependencies are installed
- **Timeout errors**: Tests are configured with a 30-second timeout
- **Mock errors**: Ensure all external dependencies are properly mocked

### Development Workflow

1. **Write Code**: Make changes to controllers
2. **Run Tests**: `npm test` to ensure existing tests pass
3. **Add Tests**: Write new tests for new functionality
4. **Watch Mode**: `npm run test:watch` during development
5. **Coverage**: `npm run test:coverage` before committing

### Quick Reference

```bash
# Quick test run
npm test

# Development with watch mode
npm run test:watch

# Full coverage report
npm run test:coverage

# Test status with badge
npm run test:status

# Run specific test file
npm test -- --testPathPattern=transactionController

# Run with verbose output
npm test -- --verbose
```
