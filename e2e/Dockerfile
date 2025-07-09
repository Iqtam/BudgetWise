FROM mcr.microsoft.com/playwright:v1.53.2-jammy

WORKDIR /app

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