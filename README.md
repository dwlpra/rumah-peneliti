<p align="center">
  <img src="https://img.icons8.com/fluency/96/book-shelf.png" alt="RumahPeneliti" width="96" height="96" />
  <h1 align="center">RumahPeneliti.com</h1>
  <p align="center"><strong>Decentralized Research Platform — AI-Curated, Blockchain-Verified, Community-Owned</strong></p>
  <p align="center">
    <img src="https://img.shields.io/badge/0G_Mainnet-16661-blue" />
    <img src="https://img.shields.io/badge/Solidity-0.8.20-blue" />
    <img src="https://img.shields.io/badge/AI-0G_Compute_GLM--5-green" />
    <img src="https://img.shields.io/badge/License-MIT-yellow" />
  </p>
</p>

---

> 🏆 **Built for [0G APAC Hackathon 2026](https://www.0g.ai/) — Track 3: Agentic Economy & Autonomous Applications**

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Architecture](#-architecture)
- [0G Integration — All 4 Pillars](#-0g-integration--all-4-pillars)
- [6-Step Decentralized Pipeline](#-6-step-decentralized-pipeline)
- [Smart Contracts](#-smart-contracts-deployed-on-0g-mainnet)
- [AI Multi-Agent System](#-ai-multi-agent-system)
- [Features Deep Dive](#-features-deep-dive)
- [Pages & User Flow](#-pages--user-flow)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Blockchain Indexer](#-blockchain-indexer-ponder)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🎯 The Problem

Academic publishing is one of the most centralized, expensive, and opaque industries on earth:

| Problem | Impact |
|---------|--------|
| **$30-50 paywalls** per paper | Knowledge locked from researchers in developing countries |
| **~$10B/year revenue** for top 5 publishers | Authors get **zero** — they even PAY to publish |
| **6-18 month review cycles** | Research delayed, some never sees daylight |
| **Opaque peer review** | No transparency, bias, gatekeeping |
| **Centralized storage** | Papers disappear when servers go down or journals fold |
| **No verifiable provenance** | Plagiarism and research fraud are rampant |

**65% of the world's researchers** can't afford to read the papers they need. This isn't just broken — it's unjust.

---

## 💡 Our Solution

**RumahPeneliti** (Indonesian: "Researcher's Home") is a fully decentralized research platform that eliminates publishers from the equation:

```
Traditional:  Author → Publisher ($$$) → Reviewer → Paywall → Reader
RumahPeneliti: Author → 0G Storage → AI Curation → Blockchain Anchor → Reader (micro-payment → author)
```

### What makes us different:

1. **🗄️ Decentralized Storage** — Papers live on **0G Storage Network**, not some publisher's server. Censorship-resistant, immutable, forever accessible.

2. **🤖 AI-Powered Curation** — A **multi-agent AI pipeline** powered by **0G Compute Network** (GLM-5-FP8) automatically summarizes, scores, tags, and classifies papers. No waiting 6 months for peer review.

3. **⛓️ Blockchain Verification** — Every paper is anchored on **0G Chain** with Data Availability proofs. Tamper-evident, publicly verifiable, forever.

4. **🎭 Research NFTs** — Each curated paper is minted as an **ERC-721 NFT** on 0G. Researchers own their work as digital assets.

5. **💰 Direct Micropayments** — Readers pay fractions of 0G directly to authors via smart contracts. **Zero middleman. Zero 70% publisher cut.**

6. **🔍 Verifiable AI** — 0G Compute uses **TeeML** (Trusted Execution Environment) so AI responses are cryptographically verified — you can prove the AI actually processed your paper.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                      │
│                                                                    │
│  ┌─────┐ ┌───────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌───────────┐  │
│  │Home │ │Browse │ │Upload│ │Article │ │NFT   │ │Pipeline   │  │
│  │     │ │Search │ │ PDF  │ │+Chat   │ │Gallery│ │Wizard     │  │
│  └─────┘ └───────┘ └──────┘ └────────┘ └──────┘ └───────────┘  │
│  ┌───────┐ ┌────────┐ ┌──────┐ ┌──────────┐ ┌──────────────┐  │
│  │Profile│ │Verify │ │Tech │ │Analytics │ │Leaderboard   │  │
│  │Wallet │ │ Hash  │ │Stack│ │Dashboard │ │Ranks & Scores│  │
│  └───────┘ └────────┘ └──────┘ └──────────┘ └──────────────┘  │
│                                                                    │
│  MetaMask │ Wallet Connect │ Ethers.js │ Framer Motion │ Tailwind  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ REST API + SSE
┌──────────────────────────▼───────────────────────────────────────┐
│                     Backend (Express.js + SQLite)                  │
│                                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐              │
│  │ 0G Storage   │  │ 0G DA Layer │  │ PaperAnchor   │              │
│  │ Upload SDK   │  │ Proof Pub   │  │ Chain Service │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘              │
│         │                │                 │                       │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴───────┐              │
│  │ 0G Compute   │  │ Multi-Agent │  │ ResearchNFT   │              │
│  │ GLM-5 Broker │  │ AI Pipeline │  │ Gasless Mint  │              │
│  └─────────────┘  └─────────────┘  └──────────────┘              │
│                                                                    │
│  ┌──────────────────────────────────────────────────────┐        │
│  │ Ponder Indexer (GraphQL) ← on-chain events           │        │
│  └──────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                     0G Network (Mainnet — Chain ID 16661)          │
│                                                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ 0G Storage  │  │ 0G DA      │  │ 0G Compute │  │ 0G Chain   │ │
│  │ Network     │  │ Layer      │  │ Network    │  │ (EVM)      │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│                                                                    │
│  Smart Contracts:                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│  │ JournalPayment   │ │ PaperAnchor      │ │ ResearchNFT      │  │
│  │ Micropayments    │ │ Hash Verification│ │ ERC-721 Minting  │  │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🌐 0G Integration — All 4 Pillars

RumahPeneliti integrates **every** major 0G service. This is not a superficial integration — each pillar plays a critical role:

### 1. 🗄️ 0G Storage Network
**Role:** Decentralized paper storage

- Papers are uploaded as files to 0G Storage nodes
- Returns a **Merkle root hash** — the content's permanent, verifiable address
- Storage indexer at `https://indexer-storage-turbo.0g.ai` tracks uploads
- No central server — papers survive any single point of failure
- **SDK:** `@0gfoundation/0g-ts-sdk@1.2.1`

```javascript
// backend/src/services/storage.js
const { ZgFile, submit } = require("@0gfoundation/0g-ts-sdk");
const file = new ZgFile(buffer);
const [rootHash] = await file.merkleCalc();
await submit(rootHash);
```

### 2. 📡 0G DA Layer (Data Availability)
**Role:** Prove that uploaded data is available

- After 0G Storage upload, a **DA proof** is published
- Creates a blob commitment on-chain guaranteeing data retrievability
- Readers can verify papers haven't been tampered with
- **DA entrance contract** handles proof submission

```javascript
// backend/src/services/da-layer.js
const daClient = new DAClient(DA_ENTRANCE_ADDRESS, RPC_URL);
const proof = await daClient.publishData(storageHash, metadata);
```

### 3. 🤖 0G Compute Network
**Role:** Decentralized AI inference for paper curation

- Uses **GLM-5-FP8** model running in **TeeML** (Trusted Execution Environment)
- AI responses are **cryptographically verified** — provable AI inference
- 3-agent pipeline runs in parallel (Summarizer, Scorer, Tagger)
- Ledger-based payment — deposit OG, pay per token
- **SDK:** `@0glabs/0g-serving-broker`

```javascript
// backend/src/services/og-compute.js
const broker = await createZGComputeNetworkBroker(wallet);
await broker.ledger.addLedger(3); // deposit 3 OG
const services = await broker.inference.listService();
const metadata = await broker.inference.getServiceMetadata(provider);
const response = await fetch(`${metadata.endpoint}/chat/completions`, { ... });
```

### 4. ⛓️ 0G Chain (EVM)
**Role:** Smart contracts for payments, verification, and NFTs

- **3 custom Solidity contracts** deployed on 0G Mainnet
- **PaperAnchor** — immutable paper hash records with citation tracking
- **ResearchNFT** — ERC-721 NFT minting with gasless backend sponsorship
- **JournalPayment** — direct micropayments from readers to authors
- **Ponder indexer** — real-time blockchain event indexing via GraphQL

---

## ⚡ 6-Step Decentralized Pipeline

When a researcher uploads a paper, this pipeline executes automatically:

```
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│ Step 1 │───▶│ Step 2 │───▶│ Step 3 │───▶│ Step 4 │───▶│ Step 5 │───▶│ Step 6 │
│  0G    │    │  0G DA │    │ Chain  │    │  0G    │    │ Chain  │    │  NFT   │
│Storage │    │ Layer  │    │ Anchor │    │Compute │    │ Anchor │    │ Minted │
└────────┘    └────────┘    └────────┘    └────────┘    └────────┘    └────────┘
```

| Step | Service | What Happens | On-Chain? |
|------|---------|-------------|-----------|
| 1️⃣ | **0G Storage** | Paper file uploaded to decentralized storage nodes. Merkle root computed. | ❌ (off-chain) |
| 2️⃣ | **0G DA Layer** | Data availability proof published with blob commitment. Proves data exists. | ✅ tx on 0G |
| 3️⃣ | **PaperAnchor** | Storage root hash anchored on-chain. Paper ID assigned. Immutable record. | ✅ tx on 0G |
| 4️⃣ | **0G Compute** | 3 AI agents analyze paper in parallel: Summarize, Score, Classify. | ✅ ledger payment |
| 5️⃣ | **Article Anchor** | AI-generated article hash anchored on-chain. Links curation to paper. | ✅ tx on 0G |
| 6️⃣ | **ResearchNFT** | Gasless ERC-721 NFT minted. Paper becomes ownable digital asset. | ✅ tx on 0G |

**Result:** In ~40 seconds, a raw paper becomes a fully curated, on-chain verified, NFT-minted research article.

### Pipeline Response Example

```json
{
  "success": true,
  "paper": {
    "id": 15,
    "title": "Zero-Knowledge Proofs for Verifiable AI Inference",
    "storage_hash": "0x1732b7976e794775...",
    "author_wallet": "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55"
  },
  "pipeline": {
    "storageUploaded": true,
    "daProof": "0xff7202a0e1eff60fc8...",
    "chainAnchor": "0x2ca94af6a1495d2342...",
    "chainPaperId": 1
  }
}
```

---

## 📜 Smart Contracts (Deployed on 0G Mainnet)

All contracts are deployed and verified on **0G Mainnet** (Chain ID: 16661).

### JournalPayment
**Address:** [`0xF5E23E98a6a93Db2c814a033929F68D5B74445E2`](https://chainscan.0g.ai/address/0xF5E23E98a6a93Db2c814a033929F68D5B74445E2)

Handles micropayments for paper access. Readers pay directly to authors — no intermediary.

```solidity
function uploadPaper(string title, string paperHash, uint256 price) → paperId
function purchasePaper(uint256 paperId) payable        → payment to author
function setArticleHash(uint256 paperId, string hash)  → link AI curation
```

**Events:** `PaperUploaded`, `PaperPurchased`, `ArticleCreated`

### PaperAnchor
**Address:** [`0x410837Dd2476d7E70210063D11030D0842653f69`](https://chainscan.0g.ai/address/0x410837Dd2476d7E70210063D11030D0842653f69)

Anchors paper hashes on-chain for immutable verification. Tracks citations and author papers.

```solidity
function anchorPaper(bytes32 storageRoot, bytes32 curationHash, bytes32 metadataHash) → paperId
function anchorArticle(uint256 paperId, bytes32 articleHash)
function addCitation(uint256 paperId, uint256 citedPaperId)
```

**Events:** `PaperAnchored`, `ArticleAnchored`

### ResearchNFT
**Address:** [`0x78C414367A91917fe5DC8123119467c9910a4B6d`](https://chainscan.0g.ai/address/0x78C414367A91917fe5DC8123119467c9910a4B6d)

ERC-721 NFT contract for curated research papers. Gasless minting sponsored by backend.

```solidity
function mintResearchNFT(address to, uint256 paperId, bytes32 storageRoot, bytes32 curationHash, string metadataURI) → tokenId
function tokens(uint256 tokenId) → ResearchToken struct
```

**Events:** `ResearchMinted`

---

## 🤖 AI Multi-Agent System

RumahPeneliti uses a **3-agent parallel AI pipeline** powered by 0G Compute:

```
                    ┌──────────────────┐
                    │  Paper Uploaded   │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │  Agent 1   │  │  Agent 2   │  │  Agent 3   │
     │ Summarizer │  │  Scorer    │  │  Tagger    │
     │            │  │            │  │            │
     │ • Title    │  │ • Novelty  │  │ • Domain   │
     │ • Summary  │  │ • Clarity  │  │ • Subdomain│
     │ • Body     │  │ • Method   │  │ • Research │
     │ • Takeaways│  │ • Impact   │  │   Type     │
     └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                    ┌──────────────┐
                    │  Merged      │
                    │  Article +   │
                    │  Score +     │
                    │  Tags        │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Agent 4     │
                    │  (On-demand) │
                    │  Chat about  │
                    │  this paper  │
                    └──────────────┘
```

### Agent Details

| Agent | Role | Output |
|-------|------|--------|
| **Agent 1: Summarizer** | Transforms paper into engaging article | curated_title, summary, body (5-8 paragraphs), key_takeaways |
| **Agent 2: Scorer** | Research quality assessment (0-100) | novelty, clarity, methodology, impact scores + reasoning |
| **Agent 3: Tagger** | Classification & categorization | domain, subdomain, research_type, difficulty, tags |
| **Agent 4: Reviewer** | Interactive paper chat (on-demand) | Q&A about paper content, methodology, findings |

### AI Quality Score

Each paper receives a multi-dimensional quality score:

```
┌─────────────────────────────────────────────┐
│  🔬 AI Quality Score                         │
│                                               │
│  Novelty     ████████░░  80/100              │
│  Clarity     █████████░  90/100              │
│  Methodology ███████░░░  70/100              │
│  Impact      █████████░  85/100              │
│                                               │
│  Overall: 81.25 / 100                         │
│  Difficulty: 🟡 Intermediate                  │
│  Domain: Computer Science → Cryptography      │
└─────────────────────────────────────────────┘
```

### AI Execution Priority

```
1. 0G Compute Network (GLM-5-FP8 via TeeML) ← PRIMARY
2. Multi-Agent Pipeline (GLM API fallback)
3. Mock (offline fallback for demo)
```

---

## 🎮 Features Deep Dive

### 📄 Paper Upload with Full Pipeline
- Upload PDF, TXT, or MD files (up to 50MB)
- Automatic 6-step pipeline execution
- Real-time SSE status updates
- Storage hash + DA proof + chain anchor in one request

### 🔍 Browse & Search
- Full-text search across titles and abstracts
- Category filtering (AI, Blockchain, Biology, Physics, etc.)
- Sort by newest, oldest, or alphabetical
- Difficulty badges: 🟢 Beginner, 🟡 Intermediate, 🔴 Advanced
- Pagination with lazy loading

### 📖 Article View with AI Chat
- Curated article with summary, key takeaways, body
- **4-dimension AI quality score** visualization
- Classification badges (domain, subdomain, research type)
- **AI Chat widget** — ask questions about the paper (Agent 4)
- On-chain data: anchor badge, NFT badge, storage root, tx links
- Purchase button for micropayment access

### 🧙 Pipeline Wizard
- Interactive 6-step visualization
- Upload form with drag & drop
- Real-time status for each step (pending → running → complete)
- **Guided tour** for first-time users (auto-plays, replayable)
- Pre-flight balance check (warns if wallet < 0.005 OG)

### 🖼️ NFT Gallery
- Grid of minted Research NFTs with gradient backgrounds
- Paper info + token ID + mint date
- Explorer tx links
- "Powered by 0G" contract badge

### 👤 Profile Page
- Connect MetaMask wallet to view your profile
- Dashboard with authored papers count, NFTs owned
- On-chain activity feed (anchors, mints)
- Wallet balance display in 0G tokens

### ✅ Verify Page
- Hash verification against on-chain records
- Input any hash → checks PaperAnchored, ArticleAnchored, ResearchMinted events
- Quick test buttons with sample hashes
- Explorer links for verified records

### 📊 Analytics Dashboard
- Stats cards: total papers, articles, NFTs, AI curations
- 7-day activity bar chart (CSS-based, no chart library)
- Top authors ranking
- Difficulty distribution pie chart
- Recent on-chain activity

### 🏆 Leaderboard
- **Top Authors** — ranked by paper count
- **Top Papers** — ranked by AI quality score
- **Verified Papers** — on-chain verified research
- Medal emojis: 🥇🥈🥉

### 🔧 Tech Stack Showcase
- 0G integration cards (Storage, DA, Compute, Chain)
- 6-step pipeline breakdown
- Smart contract cards with explorer links
- Ponder indexer info

---

## 🖥️ Pages & User Flow

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, 0G tech stack, pipeline overview, live on-chain activity feed, stats |
| `/browse` | Browse | Search, filter, sort papers. Skeleton loaders, empty states |
| `/upload` | Upload | Drag & drop paper upload with author info |
| `/article/[id]` | Article | Curated article, AI score, AI chat, on-chain data, purchase |
| `/pipeline` | Pipeline Wizard | Interactive 6-step pipeline visualization + upload |
| `/nfts` | NFT Gallery | Grid of minted research NFTs |
| `/profile` | Profile | Wallet-connected researcher dashboard |
| `/verify` | Verify | On-chain hash verification tool |
| `/tech` | Tech | 0G integration showcase, contract info |
| `/analytics` | Analytics | Stats dashboard, charts, rankings |
| `/leaderboard` | Leaderboard | Top authors, papers, verified research |

### Core User Flow

```
Researcher uploads paper → Pipeline auto-executes:
  1. Paper stored on 0G Storage (decentralized)
  2. DA proof published (data availability guaranteed)
  3. Hash anchored on-chain (immutable record)
  4. AI analyzes paper via 0G Compute (summarize + score + classify)
  5. Article anchored on-chain (verifiable AI output)
  6. NFT minted gasless (paper = ownable asset)

Reader discovers paper → Browses curated article → Purchases access → Payment goes directly to author
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18 | SSR + CSR hybrid |
| **Styling** | Tailwind CSS, Framer Motion | Modern UI with animations |
| **Backend** | Express.js, SQLite (better-sqlite3) | REST API with embedded DB |
| **Blockchain** | Solidity 0.8.20, Hardhat, OpenZeppelin | Smart contract development |
| **Wallet** | Ethers.js v6, MetaMask | Wallet connection & transactions |
| **0G Storage** | @0gfoundation/0g-ts-sdk@1.2.1 | Decentralized file storage |
| **0G DA** | Custom DA client | Data availability proofs |
| **0G Compute** | @0glabs/0g-serving-broker | Decentralized AI inference |
| **0G Chain** | EVM-compatible (Chain ID 16661) | Smart contract execution |
| **Indexer** | Ponder v0.7 (PGLite) | Blockchain event indexing |
| **AI** | 0G Compute (GLM-5-FP8) | Multi-agent paper analysis |
| **Deployment** | Docker, Nginx | Containerized production deployment |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MetaMask wallet with 0G Mainnet configured

### 1. Clone & Install
```bash
git clone https://github.com/akzmee/rumahpeneliti.git
cd rumahpeneliti
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
# AI Configuration
LLM_API_KEY=your_zai_api_key          # Optional — 0G Compute is primary

# Blockchain
RPC_URL=https://evmrpc.0g.ai           # 0G Mainnet
CHAIN_ID=16661
PRIVATE_KEY=your_deployer_private_key

# Smart Contract Addresses (0G Mainnet)
CONTRACT_ADDRESS=0xF5E23E98a6a93Db2c814a033929F68D5B74445E2
PAPER_ANCHOR_ADDRESS=0x410837Dd2476d7E70210063D11030D0842653f69
NFT_CONTRACT_ADDRESS=0x78C414367A91917fe5DC8123119467c9910a4B6d

# 0G Storage
STORAGE_INDEXER=https://indexer-storage-turbo.0g.ai
```

### 3. Run with Docker
```bash
docker-compose up -d --build
```

- 🌐 **Frontend:** http://localhost:3000
- 🔌 **Backend API:** http://localhost:3001
- 📊 **Indexer GraphQL:** http://localhost:42069

### 4. Deploy Contracts (optional — already deployed)
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy-mainnet.js --network zeroMainnet
```

---

## 📂 Project Structure

```
rumahpeneliti/
├── frontend/                    # Next.js 14 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js          # Home page
│   │   │   ├── browse/          # Browse & search papers
│   │   │   ├── upload/          # Paper upload form
│   │   │   ├── article/[id]/    # Article view + AI chat
│   │   │   ├── pipeline/        # Pipeline Wizard
│   │   │   ├── nfts/            # NFT Gallery
│   │   │   ├── profile/         # Wallet dashboard
│   │   │   ├── verify/          # Hash verification
│   │   │   ├── tech/            # Tech stack showcase
│   │   │   ├── analytics/       # Analytics dashboard
│   │   │   └── leaderboard/     # Rankings
│   │   ├── components/
│   │   │   ├── Web3UI.js        # Wallet connect, token icons
│   │   │   └── ...
│   │   └── lib/
│   │       ├── wallet.js         # WalletProvider context
│   │       ├── api-url.js        # Dynamic API URL resolution
│   │       └── toast.js          # Toast notification system
│   ├── Dockerfile
│   ├── tailwind.config.js
│   └── next.config.js
│
├── backend/                     # Express.js API server
│   ├── src/
│   │   ├── index.js             # API routes & pipeline orchestration
│   │   ├── db.js                # SQLite database setup
│   │   └── services/
│   │       ├── storage.js       # 0G Storage upload
│   │       ├── da-layer.js      # 0G DA Layer proof
│   │       ├── anchor.js        # PaperAnchor chain service
│   │       ├── og-compute.js    # 0G Compute Network client
│   │       ├── kurasi.js        # AI curation orchestrator
│   │       ├── kurasi-core.js   # Curation core logic
│   │       ├── multi-agent.js   # Multi-agent AI pipeline
│   │       └── nft.js           # ResearchNFT gasless minting
│   ├── seed.js                  # Database seeder
│   ├── Dockerfile
│   └── package.json
│
├── contracts/                   # Solidity smart contracts
│   ├── contracts/
│   │   ├── JournalPayment.sol   # Micropayment contract
│   │   ├── PaperAnchor.sol      # Paper hash verification
│   │   └── ResearchNFT.sol      # ERC-721 NFT contract
│   ├── scripts/
│   │   ├── deploy.js            # Deploy JournalPayment
│   │   ├── deploy-anchor.js     # Deploy PaperAnchor
│   │   ├── deploy-nft.js        # Deploy ResearchNFT
│   │   └── deploy-mainnet.js    # Deploy all to mainnet
│   └── hardhat.config.js
│
├── indexer/                     # Ponder blockchain indexer
│   ├── ponder.config.ts         # Network + contract config
│   ├── ponder.schema.ts         # Database schema (onchainTable)
│   └── src/
│       ├── index.ts             # Event handlers
│       └── api.ts               # Custom GraphQL resolvers
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📡 API Reference

### Papers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/papers` | Upload paper (multipart form: file + metadata). Triggers full 6-step pipeline. |
| `GET` | `/api/papers` | List papers. Query: `?search=&category=&sort=&page=&limit=` |
| `GET` | `/api/papers/:id` | Get paper + curated article |
| `POST` | `/api/papers/:id/mint` | Mint Research NFT for paper |
| `GET` | `/api/papers/:id/nft` | Get NFT info for paper |
| `POST` | `/api/papers/:id/chat` | AI chat about paper (Agent 4) |

### Blockchain

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/papers/:id/onchain` | On-chain data for paper (from Ponder indexer) |
| `GET` | `/api/activity` | Recent on-chain activity feed |
| `GET` | `/api/profile/:address` | Researcher profile by wallet address |
| `GET` | `/api/verify/:hash` | Verify hash against on-chain records |

### Platform

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check + paper/article counts |
| `GET` | `/api/nfts/stats` | NFT total supply + contract address |
| `GET` | `/api/analytics/dashboard` | Stats, charts, top authors, activity |
| `GET` | `/api/leaderboard` | Top authors, papers, verified papers |
| `GET` | `/api/wallet/status` | Backend wallet balance + sponsor flag |
| `GET` | `/api/pipeline/status` | Pipeline configuration (all 0G services) |
| `GET` | `/api/pipeline/:id/status` | SSE real-time pipeline status |

---

## 🔍 Blockchain Indexer (Ponder)

We run a **Ponder v0.7** indexer that tracks all on-chain events in real-time:

**Indexed Events:**
- `PaperAnchored` — paper storage roots + metadata hashes
- `ArticleAnchored` — AI curation hashes linked to papers
- `ResearchMinted` — NFT minting events with token IDs
- `PaperPurchased` — micropayment events

**GraphQL API** at `localhost:42069`:
```graphql
query {
  paperAnchorEventss {
    items {
      paperId
      storageRoot
      curationHash
      metadataHash
      author
      txHash
      blockNumber
      timestamp
    }
    totalCount
  }
}
```

The backend proxies indexer data through REST endpoints for the frontend.

---

## 🐳 Deployment

### Docker Compose (Recommended)

```bash
docker-compose up -d --build
```

### Manual Docker Build

```bash
# Backend
cd backend
sudo docker build -t rp-backend .
sudo docker run -d --name rp-backend --network host \
  --env-file ../.env \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped rp-backend

# Frontend
cd frontend
sudo docker build -t rp-frontend .
sudo docker run -d --name rp-frontend -p 3000:3000 \
  --restart unless-stopped rp-frontend

# Indexer
cd indexer
npm run dev  # or set up as systemd service
```

### Production

Live at **http://168.110.205.224:3000** on Oracle Cloud VPS (ARM64, 24GB RAM).

---

## 🎯 Why This Wins

### Deep 0G Integration
We don't just use one 0G service — we use **all four**:
- ✅ 0G Storage — paper storage
- ✅ 0G DA Layer — data availability proofs
- ✅ 0G Compute — AI inference via decentralized network
- ✅ 0G Chain — 3 deployed smart contracts

### Real AI — Not Mocked
0G Compute Network with GLM-5-FP8 provides **verifiable AI inference** through TeeML. Every paper curation is cryptographically proven to have come from the AI model.

### Multi-Agent Architecture
3 parallel AI agents (Summarizer, Scorer, Tagger) with a 4th on-demand Reviewer — all running through 0G Compute's decentralized inference network.

### Full Pipeline — End to End
Upload a paper → in ~40 seconds it's stored, verified, curated, anchored, and NFT-minted. All on-chain, all decentralized.

### Gasless UX
Backend sponsors all gas fees. Users never need to hold tokens or sign transactions for NFT minting.

### 10+ Production Pages
Not a prototype — a fully functional platform with browse, search, upload, analytics, profiles, verification, leaderboard, and more.

---

## 👤 Author

**akzmee** — Master's Student & Fullstack Developer

Building the future of decentralized academic publishing on 0G.

---

## 📄 License

MIT License

---

<p align="center">
  <strong>Built with 💎 on <a href="https://0g.ai">0G Network</a></strong>
</p>
