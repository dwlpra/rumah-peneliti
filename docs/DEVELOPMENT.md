# Development Guide — RumahPeneliti.com

> Step-by-step guide to set up, run, and develop the RumahPeneliti platform.

---

## Prerequisites

| Tool          | Version     | Install                                                    |
|---------------|-------------|------------------------------------------------------------|
| Node.js       | ≥ 18.x     | [nodejs.org](https://nodejs.org)                           |
| npm           | ≥ 9.x      | Comes with Node.js                                         |
| MetaMask      | Latest      | [metamask.io](https://metamask.io) browser extension       |

> **Note:** Hardhat is installed locally via npm — no global install needed.

---

## Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url> rumahpeneliti
cd rumahpeneliti

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../contracts && npm install
```

### 2. Configure Environment

#### Backend (`backend/.env`)

```env
# Blockchain
PRIVATE_KEY=your_private_key_here
ZERO_TESTNET_RPC=https://evm-rpc.zero-testnet.xdao.ai
ZERO_MAINNET_RPC=https://evm-rpc.0g.ai
CONTRACT_ADDRESS=                    # After deploying contract

# Storage
ZG_STORAGE_RPC=https://rpc.0g.ai/storage

# Server
PORT=3001

# AI Curation (Z.AI GLM API)
LLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
LLM_API_KEY=your_llm_api_key_here
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=         # After deploying contract
NEXT_PUBLIC_CHAIN_RPC=https://evm-rpc.zero-testnet.xdao.ai
NEXT_PUBLIC_CHAIN_ID=8008
```

### 3. Run the Platform

```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Smart Contract

### Compile

```bash
cd contracts
npm run compile
```

### Deploy to 0G Testnet

```bash
# Ensure PRIVATE_KEY is set in contracts/.env or environment
cd contracts
npm run deploy:testnet
```

Copy the deployed contract address into:
- `backend/.env` → `CONTRACT_ADDRESS`
- `frontend/.env.local` → `NEXT_PUBLIC_CONTRACT_ADDRESS`

### Deploy to 0G Mainnet

```bash
cd contracts
npm run deploy:mainnet
```

---

## Backend API

The backend runs on **Express.js** at port 3001 with SQLite storage.

### Running

```bash
cd backend

# Development (auto-restart with --watch)
npm run dev

# Production
npm start
```

### PM2 Commands

```bash
# Start backend with PM2
pm2 start src/index.js --name rumahpeneliti-api

# Monitor
pm2 monit

# View logs
pm2 logs rumahpeneliti-api

# Restart
pm2 restart rumahpeneliti-api

# Stop
pm2 stop rumahpeneliti-api

# Start frontend with PM2
pm2 start npm --name rumahpeneliti-web -- start
```

---

### API Endpoints

#### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "papers": 5,
  "articles": 5
}
```

---

#### Upload Paper

```
POST /api/papers
Content-Type: multipart/form-data
```

**Parameters:**

| Field           | Type   | Required | Description                     |
|-----------------|--------|----------|---------------------------------|
| `title`         | text   | ✅       | Paper title                     |
| `authors`       | text   | ❌       | Comma-separated author names    |
| `abstract`      | text   | ❌       | Paper abstract                  |
| `price_wei`     | text   | ❌       | Price in wei (default: "0")     |
| `author_wallet` | text   | ❌       | Author's ETH wallet address     |
| `file`          | file   | ❌       | PDF/TXT/DOC file (max 50MB)     |

**Response:**
```json
{
  "success": true,
  "paper": {
    "id": 1,
    "title": "A Survey on Blockchain-based Storage",
    "authors": "Dr. Sarah Chen, Marcus Williams",
    "abstract": "This paper surveys...",
    "file_path": "/path/to/uploads/uuid-file.pdf",
    "upload_date": "2026-04-18 12:00:00",
    "price_wei": "1000000000000000",
    "author_wallet": "0x1234..."
  }
}
```

> **Note:** AI curation runs asynchronously in the background after upload.

---

#### List Papers

```
GET /api/papers
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "A Survey on Blockchain-based Storage",
    "authors": "Dr. Sarah Chen",
    "abstract": "...",
    "file_path": "...",
    "upload_date": "2026-04-18 12:00:00",
    "price_wei": "1000000000000000",
    "author_wallet": "0x1234..."
  }
]
```

---

#### Get Single Paper + Article

```
GET /api/papers/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "A Survey on Blockchain-based Storage",
  "authors": "Dr. Sarah Chen",
  "abstract": "...",
  "file_path": "...",
  "upload_date": "2026-04-18 12:00:00",
  "price_wei": "1000000000000000",
  "author_wallet": "0x1234...",
  "article": {
    "id": 1,
    "paper_id": 1,
    "curated_title": "The Future of Data Storage",
    "summary": "A comprehensive survey reveals...",
    "key_takeaways": ["point 1", "point 2", "point 3", "point 4"],
    "body": "Full article text...",
    "tags": ["blockchain", "storage", "web3"],
    "is_mock": false
  }
}
```

---

#### Record Purchase

```
POST /api/papers/:id/purchase
Content-Type: application/json
```

**Body:**
```json
{
  "buyer_wallet": "0xabcdef...",
  "tx_hash": "0x123abc...",
  "amount": "1000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase recorded"
}
```

---

#### Check Access

```
GET /api/papers/:id/access/:wallet
```

**Response:**
```json
{
  "hasAccess": true
}
```

---

#### List Articles

```
GET /api/articles
```

**Response:**
```json
[
  {
    "id": 1,
    "paper_id": 1,
    "curated_title": "The Future of Data Storage",
    "summary": "...",
    "key_takeaways": ["point 1", "point 2"],
    "body": "...",
    "tags": ["blockchain", "storage"],
    "is_mock": false,
    "paper_title": "A Survey on...",
    "authors": "Dr. Sarah Chen",
    "price_wei": "1000000000000000",
    "author_wallet": "0x1234..."
  }
]
```

---

#### Get Article by ID or Paper ID

```
GET /api/articles/:id
```

Returns the article with associated paper info. Tries matching by `paper_id` first, then by `article id`.

**Response:**
```json
{
  "id": 1,
  "paper_id": 1,
  "curated_title": "...",
  "summary": "...",
  "key_takeaways": ["..."],
  "body": "...",
  "tags": ["..."],
  "is_mock": false,
  "paper": {
    "id": 1,
    "title": "...",
    "authors": "..."
  }
}
```

---

## Database

### Location

```
backend/data/rumahpeneliti.db
```

### Schema Management

The database schema is auto-created on first run via `backend/src/db.js`. No migration tool is needed — tables are created with `CREATE TABLE IF NOT EXISTS`.

### WAL Mode

SQLite runs in WAL (Write-Ahead Logging) mode for better concurrent performance:

```javascript
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
```

### Seed Data

On first run (when `papers` table is empty), two demo papers with curated articles are seeded:

1. **"A Survey on Blockchain-based Decentralized Storage Systems"** — price: 0.001 ETH
2. **"Smart Contract Vulnerability Detection using Machine Learning"** — price: 0.002 ETH

### Manual Database Inspection

```bash
cd backend
sqlite3 data/rumahpeneliti.db

# Useful queries
SELECT COUNT(*) FROM papers;
SELECT COUNT(*) FROM articles;
SELECT COUNT(*) FROM purchases;
SELECT * FROM papers ORDER BY upload_date DESC LIMIT 5;
```

---

## Frontend

### Development

```bash
cd frontend
npm run dev     # http://localhost:3000
```

### Production Build

```bash
cd frontend
npm run build
npm start       # Serves on port 3000
```

### Key Libraries

| Library         | Purpose                                    |
|-----------------|--------------------------------------------|
| `next`          | React framework with SSR/CSR               |
| `ethers`        | Blockchain wallet & contract interaction   |
| `framer-motion` | UI animations                              |
| `react-icons`   | Icon components (Feather icons)            |

---

## Testing

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

Add test files in `contracts/test/`.

### API Testing

```bash
# Health check
curl http://localhost:3001/api/health

# List papers
curl http://localhost:3001/api/papers

# Upload paper
curl -X POST http://localhost:3001/api/papers \
  -F "title=My Research Paper" \
  -F "authors=John Doe" \
  -F "abstract=A study on..." \
  -F "price_wei=1000000000000000" \
  -F "file=@/path/to/paper.pdf"

# Get paper with article
curl http://localhost:3001/api/papers/1

# Check access
curl http://localhost:3001/api/papers/1/access/0xYourWalletAddress
```

---

## Project Structure

```
rumahpeneliti/
├── contracts/                    # Smart contracts (Hardhat)
│   ├── contracts/
│   │   └── JournalPayment.sol    # Micropayment contract
│   ├── scripts/
│   │   └── deploy.js             # Deployment script
│   ├── hardhat.config.js
│   └── package.json
│
├── backend/                      # API server (Express)
│   ├── src/
│   │   ├── index.js              # Main entry, routes
│   │   ├── db.js                 # SQLite setup + seed
│   │   ├── routes/
│   │   │   ├── articles.js       # Article routes (legacy)
│   │   │   └── papers.js         # Paper routes (legacy)
│   │   └── services/
│   │       ├── kurasi.js         # AI curation (GLM-5.1)
│   │       └── storage.js        # 0G Storage upload/download
│   ├── data/                     # SQLite database files
│   ├── uploads/                  # Local file uploads (created at runtime)
│   ├── .env.example
│   └── package.json
│
├── frontend/                     # Web UI (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js           # Homepage
│   │   │   ├── layout.js         # Root layout
│   │   │   ├── globals.css       # Global styles
│   │   │   ├── browse/page.js    # Browse papers/articles
│   │   │   ├── upload/page.js    # Upload form
│   │   │   └── article/[id]/page.js  # Article detail + paywall
│   │   ├── components/
│   │   │   └── Web3UI.js         # Nav, Footer, GlassCard, etc.
│   │   ├── lib/
│   │   │   ├── api.js            # API client functions
│   │   │   └── wallet.js         # Wallet context (ethers.js)
│   │   ├── LanguageContext.js     # i18n context
│   │   ├── ThemeContext.js        # Theme context
│   │   └── i18n.js               # Translation strings
│   ├── next.config.js
│   ├── .env.local.example
│   └── package.json
│
└── docs/                         # Documentation
    ├── README.md
    ├── ARCHITECTURE.md
    └── DEVELOPMENT.md
```

---

## Troubleshooting

| Issue                          | Solution                                               |
|--------------------------------|--------------------------------------------------------|
| `EADDRINUSE :3001`             | Kill existing process: `lsof -ti:3001 \| xargs kill`  |
| SQLite locked errors           | Ensure WAL mode is active; only one writer at a time  |
| MetaMask not connecting        | Check `NEXT_PUBLIC_CHAIN_ID` matches your network     |
| AI curation returns mock       | Verify `LLM_API_KEY` is set and valid                 |
| 0G upload fails                | Falls back to local hash; check `ZG_STORAGE_RPC`      |
| Frontend can't reach API       | Verify `NEXT_PUBLIC_API_URL` and CORS settings        |
