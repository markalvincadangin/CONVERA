# CONVERA Frontend Web Service Dockerfile (Profile 3: Self-Hosted Container)

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy dependency specifications
COPY package.json package-lock.json* ./

# Install clean dependencies
RUN npm ci

# Copy frontend source code
COPY . .

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    BACKEND_INTERNAL_URL=http://backend:8000

# Build production bundle
RUN npm run build

# Stage 2: Production runtime runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    BACKEND_INTERNAL_URL=http://backend:8000


RUN apk add --no-cache curl

# Add security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built artifacts from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "run", "start"]
