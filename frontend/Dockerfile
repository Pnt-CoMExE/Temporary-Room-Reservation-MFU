# ==========================================
# 1. Builder Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json tsconfig*.json vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Vite static bundle
RUN npm run build

# ==========================================
# 2. Production Web Server Stage (Nginx)
# ==========================================
FROM nginx:1.25-alpine AS runner

# Remove default Nginx site config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
