# ==========================================
# 1. Builder Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Check TypeScript types
RUN npm run typecheck

# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built app and required files from builder
COPY --from=builder /app ./

# Create uploads directory for document/slip storage
RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["npm", "run", "start"]
