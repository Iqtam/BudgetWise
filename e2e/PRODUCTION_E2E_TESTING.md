# Production E2E Testing

This document explains how the E2E (End-to-End) testing is configured to run in production mode for both frontend and backend services.

## Overview

The E2E tests are configured to run against production builds of both the frontend and backend services, ensuring that the tests validate the actual production behavior rather than development behavior.

## Configuration

### Docker Compose Setup

The `docker-compose.test.yml` file is configured to:

1. **Backend Production Mode**:

   - Uses `target: production` in the Dockerfile
   - Sets `NODE_ENV: production`
   - Runs with `npm start` command (production server)
   - No hot-reloading or development features

2. **Frontend Production Mode**:
   - Uses `target: production` in the Dockerfile
   - Sets `NODE_ENV: production`
   - Runs with `node build` command (production server)
   - Built and optimized for production
   - No development server or hot-reloading

### Key Differences from Development

| Aspect             | Development                     | Production (E2E)                    |
| ------------------ | ------------------------------- | ----------------------------------- |
| **Backend**        | `npm run dev` (nodemon)         | `npm start` (node)                  |
| **Frontend**       | `npm run dev` (Vite dev server) | `node build` (SvelteKit production) |
| **Hot Reload**     | ✅ Enabled                      | ❌ Disabled                         |
| **Optimization**   | ❌ Minimal                      | ✅ Full production optimization     |
| **Error Handling** | Development mode                | Production mode                     |
| **Performance**    | Development level               | Production level                    |

## Benefits of Production E2E Testing

1. **Real-world Validation**: Tests run against the same code that will be deployed
2. **Performance Testing**: Validates actual production performance characteristics
3. **Build Verification**: Ensures the production build process works correctly
4. **Environment Parity**: Tests the exact environment that users will experience
5. **Optimization Testing**: Validates that production optimizations don't break functionality

## Running the Tests

### Local Development

```bash
# From the e2e directory
./run-tests.sh
```

### CI/CD Pipeline

The tests are automatically run in the GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
e2e-tests:
  name: E2E Tests
  runs-on: ubuntu-latest
  needs: [backend-tests, frontend-tests]
  steps:
    - name: Run E2E tests
      run: |
        docker compose -f docker-compose.test.yml --profile e2e up --build --abort-on-container-exit --exit-code-from e2e-test e2e-test
```

## Environment Variables

The following environment variables are required for production E2E testing:

### Backend Variables

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `FIREBASE_SERVICE_ACCOUNT`
- `ADMIN_EMAIL`
- `GEMINI_API_KEY`

### Frontend Variables

- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- `PUBLIC_BACKEND_API_URL`

## Troubleshooting

### Common Issues

1. **Build Failures**: Ensure all environment variables are properly set
2. **Service Health Checks**: Production services may take longer to start
3. **Memory Usage**: Production builds may require more memory
4. **Network Issues**: Ensure proper network configuration for container communication

### Debugging

To debug production E2E tests:

```bash
# View logs
docker-compose -f docker-compose.test.yml logs

# Access production containers
docker-compose -f docker-compose.test.yml exec backend sh
docker-compose -f docker-compose.test.yml exec frontend sh

# Run tests with verbose output
docker-compose -f docker-compose.test.yml run --rm e2e-test npm test -- --verbose
```

## Performance Considerations

- Production builds are larger and take longer to build
- Services may take longer to start in production mode
- Memory usage is higher for production builds
- Consider increasing timeouts for health checks and service startup

## Security

- Production mode includes all security optimizations
- No development debugging information is exposed
- Environment variables are properly handled for production builds
- CORS and other security headers are configured for production
