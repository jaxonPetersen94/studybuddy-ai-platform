# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the source code and dev dependencies for TypeScript build
COPY . .
RUN npm install --include=dev
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built files
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3001

# Start server, binding to all interfaces
CMD ["node", "dist/server.js"]
