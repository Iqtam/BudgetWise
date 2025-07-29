#!/bin/bash

# E2E Test Runner Script
# This script helps run the e2e tests with proper Docker setup

set -e

echo "🚀 Starting E2E Tests..."

# Function to cleanup containers
cleanup() {
    echo "🧹 Cleaning up containers..."
    docker-compose -f ../docker-compose.test.yml down --volumes --remove-orphans
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Check if .env file exists
if [ ! -f "../.env" ]; then
    echo "❌ Error: .env file not found in the root directory"
    echo "Please create a .env file with the required environment variables"
    exit 1
fi

# Load environment variables
export $(cat ../.env | grep -v '^#' | xargs)

# Check required environment variables
required_vars=(
    "POSTGRES_DB"
    "POSTGRES_USER" 
    "POSTGRES_PASSWORD"
    "FIREBASE_SERVICE_ACCOUNT"
    "ADMIN_EMAIL"
    "GEMINI_API_KEY"
    "PUBLIC_FIREBASE_API_KEY"
    "PUBLIC_FIREBASE_AUTH_DOMAIN"
    "PUBLIC_FIREBASE_PROJECT_ID"
    "PUBLIC_FIREBASE_STORAGE_BUCKET"
    "PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "PUBLIC_FIREBASE_APP_ID"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f ../docker-compose.test.yml --profile e2e up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
timeout=300  # 5 minutes timeout
elapsed=0

while [ $elapsed -lt $timeout ]; do
    if docker-compose -f ../docker-compose.test.yml ps | grep -q "healthy"; then
        echo "✅ Services are healthy"
        break
    fi
    
    echo "⏳ Waiting for services to be healthy... ($elapsed/$timeout seconds)"
    sleep 10
    elapsed=$((elapsed + 10))
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Timeout waiting for services to be healthy"
    docker-compose -f ../docker-compose.test.yml logs
    exit 1
fi

# Run the e2e tests
echo "🧪 Running E2E tests..."
docker-compose -f ../docker-compose.test.yml run --rm e2e-test

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ E2E tests completed successfully!"
else
    echo "❌ E2E tests failed!"
    exit 1
fi

echo "🎉 All tests completed successfully!" 