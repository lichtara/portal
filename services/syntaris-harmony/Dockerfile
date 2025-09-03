# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --no-audit --no-fund; else npm install --omit=dev --no-audit --no-fund; fi

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    SERVICE_NAME=syntaris-harmony
COPY --from=deps /app/node_modules ./node_modules
COPY server.js ./
COPY tracing.cjs ./
EXPOSE 3000
CMD ["node", "server.js"]
