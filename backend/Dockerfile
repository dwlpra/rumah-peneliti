FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Patch 0G Storage SDK — fallback to discovered nodes when trusted is null on mainnet
# Indexer.js: Add nodePool fallback before selectNodes call
RUN sed -i 's/let \[trusted, ok\] = (0, index_js_1.selectNodes)(nodes.trusted, expectedReplica);/let nodePool = nodes.trusted \&\& nodes.trusted.length > 0 ? nodes.trusted : (nodes.discovered || []); let [trusted, ok] = (0, index_js_1.selectNodes)(nodePool, expectedReplica);/' \
    node_modules/@0gfoundation/0g-ts-sdk/lib.commonjs/indexer/Indexer.js

# common/index.js: Add null check in selectNodes function
RUN sed -i 's/function selectNodes(nodes, expectedReplica) {/function selectNodes(nodes, expectedReplica) { if (!nodes || !Array.isArray(nodes)) return [[], false];/' \
    node_modules/@0gfoundation/0g-ts-sdk/lib.commonjs/common/index.js

COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN mkdir -p data uploads
EXPOSE 3001
VOLUME ["/app/data", "/app/uploads"]
CMD ["node", "src/index.js"]
