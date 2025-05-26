# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (if you have a build step)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 5000

# Create non-root user
RUN addgroup -S nodejs && adduser -S nodeapp -G nodejs
USER nodeapp

# Start the application
CMD ["node", "dist/index.js"]
