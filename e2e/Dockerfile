FROM mcr.microsoft.com/playwright:v1.53.2-jammy

WORKDIR /app

# Install wget for health checks
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Copy package files first
COPY package*.json ./

# Install all dependencies (including devDependencies for Playwright)
RUN npm ci && npm cache clean --force

# Copy test files
COPY . ./

# Install Playwright browsers and ensure CLI is available
RUN npx playwright install
RUN npx playwright install-deps

# Verify Playwright is installed
RUN npx playwright --version

# Default command
CMD ["npx", "playwright", "test"] 