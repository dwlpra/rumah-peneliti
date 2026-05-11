# CLAUDE.md — RumahPeneliti

## Project Overview

**RumahPeneliti** (Indonesian: "Researcher's Home") is a decentralized academic research platform built for the **0G APAC Hackathon 2026**. Researchers upload papers that are curated by AI (GLM-5 via 0G Compute), stored on 0G Storage, anchored on-chain (0G Chain), and minted as NFTs. Readers discover, read, and support authors through blockchain micropayments — no traditional publisher middleman.

## Architecture

Monorepo with 5 independent npm packages (no monorepo tooling):

```
backend/      Express.js API server (SQLite, JWT auth)
frontend/     Next.js 14 App Router (React 18, Tailwind, shadcn/ui)
contracts/    Solidity smart contracts (Hardhat)
indexer/      Ponder blockchain event indexer (PGLite)
agents/       AI kurator/curation agent scripts
```

Data flow: Frontend → Backend API → AI Curation (GLM-5) → 0G Storage upload → 0G DA Layer proof → On-chain anchor → NFT mint.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui (Radix), Framer Motion, Ethers.js v6 |
| Backend | Express.js, better-sqlite3, JWT, Multer |
| Smart Contracts | Solidity 0.8.20, Hardhat, OpenZeppelin v5 |
| Indexer | Ponder v0.7, PGLite, Viem, Hono |
| AI | GLM-5-FP8 via 0G Compute Network, Z.AI GLM-5.1 API (fallback) |
| Blockchain | 0G Chain — Testnet (Chain ID 16602), Mainnet (Chain ID 16661) |
| Storage | 0G Storage (`@0gfoundation/0g-ts-sdk`) |
| Testing | Vitest (API), Playwright (E2E) |

## Smart Contracts (0G Mainnet)

| Contract | Address |
|----------|---------|
| JournalPayment | `0xc6FD8fa40ED06D21FDCA1961B75a7170991422D0` |
| PaperAnchor | `0x335C0b922325dd5214Bb9e7CDcA6a61A24B0d8C7` |
| ResearchNFT | `0x010a70be3D661B98f69Ab4De1e213CA56C90de4a` |
| AgenticID (ERC-7857) | `0x82c5e31880929de181E5DF78D60f342168d18115` |
| AgentTipJar | `0xc215A541aF7ad5072B08641272248801c5590e9a` |

Explorer: `https://chainscan.0g.ai`

## Common Commands

```bash
# One-command setup + run
bash scripts/setup.sh              # Full setup + start servers
bash scripts/setup.sh --setup      # Setup only (install, env, DB)
bash scripts/setup.sh --run        # Run only (skip setup)

# Install all dependencies
make install

# Run dev servers (backend :3001 + frontend :3000)
make dev

# Run individual services
cd backend && npm run dev       # Express with --watch on :3001
cd frontend && npm run dev      # Next.js on :3000
cd indexer && npm run dev       # Ponder GraphQL on :42069

# Docker
make docker-up                  # Build + start containers
make docker-down                # Stop containers

# Testing
make test                       # All tests (auth + E2E)
make test-auth                  # Auth flow tests
make test-e2e                   # Full E2E browser tests
npm run test:api                # Vitest API pipeline tests (16 tests)
npm run test:e2e                # Playwright browser tests (17 tests)

# Database
make db-seed                    # Reset DB with demo data
make db-reset                   # Delete and recreate DB

# Smart contracts
cd contracts && npx hardhat compile
cd contracts && npx hardhat run scripts/deploy.js --network zeroTestnet
cd contracts && npx hardhat run scripts/deploy-mainnet.js --network zeroMainnet
```

## Environment Setup

```bash
cp .env.example .env                           # Root — LLM_API_KEY, RPC_URL, PRIVATE_KEY, contract addresses
cp frontend/.env.local.example frontend/.env.local  # Frontend — NEXT_PUBLIC_API_URL defaults to http://localhost:3001
```

Key environment variables:
- `LLM_API_KEY` — Z.AI API key for GLM-5 AI curation
- `PRIVATE_KEY` — Wallet private key for on-chain transactions
- `RPC_URL` — 0G RPC endpoint (mainnet: `https://evmrpc.0g.ai`)
- `CONTRACT_ADDRESS` — JournalPayment contract address
- `PAPER_ANCHOR_ADDRESS` — PaperAnchor contract address
- `NFT_CONTRACT_ADDRESS` — ResearchNFT contract address
- `AGENTIC_ID_ADDRESS` — 0G Agentic ID (ERC-7857) contract address
- `AGENT_TIP_JAR_ADDRESS` — AgentTipJar contract address
- `NEXT_PUBLIC_API_URL` — Backend API URL (default: `http://localhost:3001`)

## Project Structure — Key Files

### Backend (`backend/src/`)
- `index.js` — Express app entry point
- `db.js` — SQLite setup + seed data
- `controllers/` — 11 controller files (papers, auth, analytics, nft, pipeline, wallet, etc.)
- `middleware/` — auth.js, error-handler.js
- `routes/` — 8 route files (papers, auth, analytics, nfts, pipeline, profile, verify)
- `services/storage.js` — 0G Storage upload (ZgFile, merkle, submit)
- `services/da-layer.js` — 0G DA Layer proof publishing
- `services/anchor.js` — PaperAnchor on-chain service
- `services/og-compute.js` — 0G Compute Network client (GLM-5), auto-recycles agent tips to fund compute
- `services/kurasi.js` — AI curation orchestrator
- `services/kurasi-core.js` — Core curation logic (prompt building, parsing)
- `services/multi-agent.js` — Multi-agent AI pipeline (Summarizer, Scorer, Tagger)
- `services/agent-identity.js` — On-chain Agent Identity (AgenticID ERC-7857) + tip withdrawal
- `services/agent-config.js` — Static agent metadata (name, type, model, capabilities)
- `services/agentic-id.js` — 0G AgenticID (ERC-7857) on-chain reader
- `services/journal.js` — Journal payment service + on-chain access check
- `services/sync-chain.js` — On-chain sync — rebuilds DB from contracts on startup
- `services/nft.js` — ResearchNFT gasless minting

### Frontend (`frontend/src/`)
- `app/` — Next.js App Router pages: home, browse, article/[id], upload, pipeline, profile, nfts, agents, verify, analytics, leaderboard, tech
- `components/ui/` — 14 shadcn/ui primitives (button, card, badge, dialog, tabs, toast, etc.)
- `components/home/` — Hero, stats, latest-papers, how-it-works, tech-stack, on-chain-activity
- `components/article/` — ai-chat, ai-score, article-body, on-chain-data, paywall, sidebar
- `lib/wallet.js` — WalletProvider context (MetaMask integration)
- `lib/api.js` — API client
- `lib/constants.ts` — Contract addresses, explorer URLs

### Contracts (`contracts/`)
- `JournalPayment.sol` — Micropayment contract
- `PaperAnchor.sol` — Paper hash verification
- `ResearchNFT.sol` — ERC-721 NFT contract
- `scripts/deploy.js`, `deploy-anchor.js`, `deploy-nft.js`, `deploy-mainnet.js`

### Indexer (`indexer/`)
- `ponder.config.ts` — Chain config + contract addresses
- `ponder.schema.ts` — Database schema
- `src/index.ts` — Event handlers
- `src/api.ts` — Custom GraphQL resolvers

## Code Conventions

- **Language**: JavaScript (not TypeScript) for backend and frontend; TypeScript for indexer only
- **Styling**: Tailwind CSS with shadcn/ui components (Radix UI primitives)
- **State**: React Context for wallet state; REST API for data fetching; polling for pipeline progress
- **Auth**: JWT-based with wallet signature verification
- **Database**: SQLite via better-sqlite3; auto-seeds on first run
- **Smart contracts**: Solidity 0.8.20, OpenZeppelin v5 patterns
- **API pattern**: Controller → Route → Service in backend

## Notes

- Pre-built SQLite database available at `scripts/rumahpeneliti.db` for quick local setup
- Database auto-seeds with mock data on first backend start
- Backend uses `node --watch` for development (no nodemon)
- Frontend uses Next.js App Router (not Pages Router)
- 0G Storage SDK requires a node discovery patch in Docker (see `backend/Dockerfile`)
