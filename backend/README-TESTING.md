# Testing Documentation

## Overview

This document covers the testing setup for the BudgetWise backend API.

## Test Setup

We use **Jest** for unit testing with **Supertest** for HTTP endpoint testing.

### Dependencies

- `jest`: Testing framework
- `supertest`: HTTP testing library
- `@types/jest`: TypeScript definitions for Jest

## Running Tests

### Basic Test Run

```bash
npm test
```

### Watch Mode (runs tests on file changes)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

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
