FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 appuser && adduser --system --uid 1001 appuser
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN mkdir -p data uploads && chown -R appuser:appuser data uploads
USER appuser
EXPOSE 3001
VOLUME ["/app/data", "/app/uploads"]
CMD ["node", "src/index.js"]
