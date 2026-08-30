# ==========================================
# 1. Builder Stage — Install & Compile TypeScript
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json tsconfig.json ./

# Install ALL dependencies (dev + prod) for compilation
RUN npm ci

# Copy source code
COPY . .

# Type-check and compile TypeScript → dist/
RUN npm run typecheck
RUN npm run build

# ==========================================
# 2. Production Runner Stage — Lean image, compiled JS only
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JS from builder (no source TS, no devDeps)
COPY --from=builder /app/dist ./dist

# Create uploads directory for document/slip storage
RUN mkdir -p /app/uploads

EXPOSE 3000

# Run compiled JS with node (faster + more stable than tsx in production)
CMD ["node", "dist/server.js"]
