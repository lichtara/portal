# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install only prod deps
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy source
COPY server.js ./
COPY tracing.cjs ./

ENV NODE_ENV=production \
    PORT=3000 \
    SERVICE_NAME=syntaris-harmony

EXPOSE 3000

# Default: start without OTel; override CMD to enable tracing if desired
CMD ["node", "server.js"]

