# Use official Node.js LTS as base image
FROM node:20-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json / pnpm-lock.yaml / yarn.lock first
# (helps Docker cache dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port your service uses
EXPOSE 5001

# Set environment variables (optional defaults)
ENV NODE_ENV=production
ENV PORT=5001

# Start the service
CMD ["node", "dist/server.js"]
