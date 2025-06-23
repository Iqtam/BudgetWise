# Development stage
FROM node:20-alpine as development

WORKDIR /app

COPY package*.json ./

# Changed from 'npm ci' to 'npm install' to generate/update package-lock.json if needed
RUN npm install

# The volume mapping in docker-compose will override this in dev
COPY . ./

EXPOSE 3000

# Use Vite development command
CMD ["npm", "run", "dev"] 

# Test stage for running tests (unit and e2e)
FROM node:20-alpine as test

WORKDIR /app

COPY package*.json ./

# Changed from 'npm ci' to 'npm install' to ensure dependencies are properly installed
RUN npm install

COPY . ./

# Default command is to run tests
CMD ["npm", "run", "test"]

# Build stage for production
# ----------- BUILD STAGE -----------
    FROM node:20-alpine AS build

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build  # This runs `svelte-kit build`
    
    RUN find /app -name "index.js" -o -name "*.js" | grep -E "(build|output|dist)"
    
    # ----------- RUN STAGE -----------
    FROM node:20-alpine AS production
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    # Copy the SvelteKit output
    COPY --from=build /app/.svelte-kit/output/server ./server
    COPY --from=build /app/.svelte-kit/output/client ./client
    COPY --from=build /app/static ./static
    COPY --from=build /app/package.json ./
    
    EXPOSE 3000
    CMD ["node", "server/index.js"]
    