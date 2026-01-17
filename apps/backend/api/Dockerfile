# Build stage
FROM node:22.13.1-alpine AS builder

WORKDIR /app

# Copy root package files for workspaces
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/backend/api/package*.json ./apps/backend/api/

# Install all dependencies (workspaces)
RUN npm ci

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/backend/api ./apps/backend/api
COPY tsconfig.json ./

# Build shared package first, then API
RUN npm run build --workspace=@hunthub/shared
RUN npm run build --workspace=@hunthub/api

# Production stage
FROM node:22.13.1-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/backend/api/package*.json ./apps/backend/api/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/backend/api/dist ./apps/backend/api/dist

# Set working directory to API
WORKDIR /app/apps/backend/api

# Change ownership and switch to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
