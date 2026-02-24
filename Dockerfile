# syntax=docker/dockerfile:1.7

# 1. Install all dependencies (including dev) for building
FROM node:20-alpine AS deps
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build the Next.js app
FROM node:20-alpine AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN rm -rf .next && npx next build --debug-prerender

# 3. Create production image with only runtime deps
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install only the production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the built assets from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/tailwind.config.* ./
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/app ./app
COPY --from=builder /app/config.ts ./config.ts

EXPOSE 3000
CMD ["npm", "run", "start"]
