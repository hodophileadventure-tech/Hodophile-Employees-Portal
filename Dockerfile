# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies required by Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Copy prisma schema BEFORE npm ci (needed for postinstall script)
COPY prisma ./prisma/

# Install dependencies (postinstall script runs here)
RUN npm ci --legacy-peer-deps

# Generate Prisma client during build so types are available
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install system dependencies required by Prisma
RUN apk add --no-cache openssl

# Install only production dependencies (skip postinstall scripts)
COPY package*.json ./

RUN npm ci --only=production --legacy-peer-deps --ignore-scripts

# Copy Prisma CLI and runtime packages from builder
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/node_modules/prisma /app/node_modules/prisma
COPY --from=builder /app/node_modules/ts-node /app/node_modules/ts-node
COPY --from=builder /app/node_modules/.bin /app/node_modules/.bin

# Copy prisma schema
COPY prisma ./prisma/

# Copy built app from builder
COPY --from=builder /app/.next /app/.next
COPY public ./public

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
# Copy startup script
COPY start.sh ./

# Make startup script executable
RUN chmod +x ./start.sh

# Start the application with migrations
CMD ["./start.sh"]
