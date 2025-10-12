# Use official Node.js LTS as base image
FROM node:20-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install ALL dependencies (including devDependencies for migrations)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port your service uses
EXPOSE 5001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Run migrations from compiled JS, then start the server
CMD ["sh", "-c", "npx typeorm migration:run -d dist/config/database.js && node dist/server.js"]