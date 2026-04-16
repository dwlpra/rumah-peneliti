# RumahPeneliti.com — Setup Guide

## Prerequisites
- Node.js 18+
- MetaMask browser extension
- Private key with 0G testnet tokens

## 1. Smart Contract (0G Chain)

```bash
cd contracts
npm install

# Copy and edit env
cp .env.example .env
# Set PRIVATE_KEY

# Compile
npx hardhat compile

# Deploy to 0G testnet
npx hardhat run scripts/deploy.js --network zeroTestnet
# Note the deployed contract address
```

## 2. Backend API

```bash
cd backend
npm install

# Configure
cp .env.example .env
# Edit .env:
#   PRIVATE_KEY=your_key
#   CONTRACT_ADDRESS=from_step_1
#   LLM_API_KEY=your_glm_key (optional)

# Start
npm run dev
# API at http://localhost:3001
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/papers/upload | Upload paper (multipart: file, title, price) |
| GET | /api/papers | List all papers |
| GET | /api/papers/:id | Get paper details |
| POST | /api/papers/:id/purchase | Purchase access |
| GET | /api/articles | List all articles |
| GET | /api/articles/:paperId | Get curated article |

## 3. Frontend

```bash
cd frontend
npm install

# Configure
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL and NEXT_PUBLIC_CONTRACT_ADDRESS

# Start dev server
npm run dev
# Open http://localhost:3000
```

## 4. AI Kurator Agent (standalone)

```bash
# Create input JSON
echo '{"paperId":"test-1","title":"Blockchain Consensus","text":"This paper proposes..."}' > input.json

# Run with LLM (set LLM_API_URL and LLM_API_KEY env vars)
node agents/kurator.js input.json

# Or without LLM (uses mock)
node agents/kurator.js input.json
```

## Running Everything

Terminal 1 — Backend:
```bash
cd backend && npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend && npm run dev
```

Open http://localhost:3000

## 0G Testnet Info
- **Chain ID:** 8008 (testnet)
- **RPC:** https://evm-rpc.zero-testnet.xdao.ai
- **Explorer:** https://scan-testnet.0g.ai
- **Faucet:** Get testnet tokens from 0G Discord

## Architecture

```
[Author] → Upload Paper → [Backend] → 0G Storage
                                    → AI Kurasi → Article
[Reader] → Browse → [Frontend] → Pay (0G Chain) → Read Article
```

## Notes
- Backend uses in-memory store — data lost on restart (use DB for production)
- AI kurasi runs automatically after upload (mock if no LLM key)
- 0G Storage SDK integration is wired but may need SDK version adjustment
- Smart contract supports direct author payments
