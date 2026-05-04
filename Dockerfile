# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

# Set working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxtjs:nodejs /app/public ./public

# Switch to non-root user
USER nuxtjs

# Expose port (Nuxt default is 3000, but can be overridden with PORT env var)
EXPOSE 3000

# Set environment variable for Nuxt
ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_PRESET=node-server
ENV HOST=0.0.0.0

# Start the application
CMD ["node", ".output/server/index.mjs"]

