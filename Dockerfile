# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install openssl (required by Prisma engine on Alpine)
RUN apk add --no-cache openssl

# Copy package.json and package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /usr/src/app

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

# Set environment to production
ENV NODE_ENV=production

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled JS files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Generate Prisma client for production runtime
RUN npx prisma generate

# Use non-root user for security
USER node

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
