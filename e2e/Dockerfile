FROM mcr.microsoft.com/playwright:v1.53.2-jammy

WORKDIR /app

# Install wget for health checks
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy test files
COPY . .

# Install Playwright browsers
RUN npx playwright install

# Default command
CMD ["npm", "test"] 