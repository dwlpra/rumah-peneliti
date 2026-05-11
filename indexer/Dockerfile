# Stage 1: Build contract artifacts (for ABI imports)
FROM node:20-alpine AS contracts
WORKDIR /app
COPY contracts/package.json contracts/
RUN cd contracts && npm install
COPY contracts/contracts/ contracts/contracts/
COPY contracts/hardhat.config.js contracts/
RUN cd contracts && npx hardhat compile
FROM node:20-alpine
WORKDIR /app
COPY indexer/package.json indexer/package-lock.json* ./
RUN npm install
COPY indexer/ .
COPY --from=contracts /app/contracts/artifacts/ /app/contracts/artifacts/
RUN ln -s /app/contracts /contracts
EXPOSE 42069
CMD ["npm", "run", "start"]
