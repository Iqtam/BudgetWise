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
    
    # ----------- RUN STAGE -----------
    FROM node:20-alpine AS production
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install --omit=dev
    
    # Copy everything needed to run the SvelteKit server
    COPY --from=build /app/build ./build
    COPY --from=build /app/.svelte-kit ./.svelte-kit
    COPY --from=build /app/static ./static
    COPY --from=build /app/src ./src
    COPY --from=build /app/svelte.config.js ./
    COPY --from=build /app/vite.config.ts ./
    
    EXPOSE 3000
    CMD ["node", "build"]
    