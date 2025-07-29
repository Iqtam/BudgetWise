# E2E Tests

This directory contains end-to-end tests for the BudgetWise application using Playwright.

## Prerequisites

1. Docker and Docker Compose installed
2. Environment variables configured in the root `.env` file
3. All required environment variables set (see list below)

## Required Environment Variables

Make sure your `.env` file in the root directory contains:

```env
# Database
POSTGRES_DB=your_db_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password

# Backend
JWT_SECRET=your_jwt_secret
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
ADMIN_EMAIL=your_admin_email
GEMINI_API_KEY=your_gemini_api_key

# Frontend
PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## Running E2E Tests

### Option 1: Using the provided script (Recommended)

```bash
cd e2e
./run-tests.sh
```

This script will:

- Validate environment variables
- Build and start all required services
- Wait for services to be healthy
- Run the e2e tests
- Clean up containers automatically

### Option 2: Manual Docker Compose

```bash
# From the root directory
docker-compose -f docker-compose.test.yml --profile e2e up --build
```

### Option 3: Running tests locally (for development)

```bash
# Start the backend and frontend services
docker-compose -f ../docker-compose.test.yml up -d postgres backend frontend

# Run tests locally
npm install
npm test
```

## Test Structure

- `tests/` - Contains all e2e test files
- `utils/` - Contains test helper utilities
- `playwright.config.ts` - Playwright configuration
- `package.json` - Test dependencies and scripts

## Available Test Commands

```bash
npm test                    # Run all tests
npm run test:ui            # Run tests with UI
npm run test:debug         # Run tests in debug mode
npm run test:headed        # Run tests in headed mode
npm run show-report        # Show test report
```

## Troubleshooting

### Common Issues

1. **Services not starting**: Check that all environment variables are set correctly
2. **Tests failing**: Check the test logs for specific error messages
3. **Network issues**: Ensure Docker network is working properly
4. **Timeout issues**: Increase timeout values in docker-compose.test.yml if needed

### Debugging

To debug tests:

```bash
# Run tests in headed mode to see browser
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Check service logs
docker-compose -f ../docker-compose.test.yml logs
```

### Viewing Test Reports

After tests complete, view the HTML report:

```bash
npm run show-report
```

## Test Coverage

The e2e tests cover:

- Authentication (signup, signin, validation)
- Dashboard functionality
- Transaction management
- Budget management
- Debt tracking
- Savings goals
- Analytics and insights
- Chat/AI assistant functionality

## Adding New Tests

1. Create a new test file in the `tests/` directory
2. Use the helper functions from `utils/test-helpers.ts`
3. Follow the existing test patterns
4. Add appropriate assertions and error handling
5. Update this README if needed
