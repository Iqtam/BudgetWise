# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built assets from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/.svelte-kit ./.svelte-kit

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 3000

# Create non-root user
RUN addgroup -S nodejs && adduser -S sveltekit -G nodejs
USER sveltekit

# Start the application
CMD ["node", "build"] 