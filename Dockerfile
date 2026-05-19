# Stage 1: Build the frontend and prepare dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to cache dependency installations
COPY package*.json ./

# Install all dependencies (required to build the frontend)
RUN npm ci

# Copy remaining source code
COPY . .

# Build the Vite React frontend
RUN npm run build

# Prune development dependencies to keep production image minimal
RUN npm prune --production


# Stage 2: Create the production runtime container
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8030

# Copy package configurations and production node_modules from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
# Copy compiled static files
COPY --from=builder /app/dist ./dist
# Copy backend Express server
COPY --from=builder /app/server.js ./server.js

# Expose the API and web serving port
EXPOSE 8030

# Run the backend Express server
CMD ["npm", "run", "start"]
