# Stage 1: Build
FROM node:20-bullseye AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx config (THIS IS THE KEY LINE!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]