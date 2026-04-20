# RumahPeneliti.com
### Decentralized Journal Platform with AI Curation & Blockchain Micropayments

> 🏆 Built for **0G APAC Hackathon 2026** — Leveraging 0G Storage, 0G DA Layer, 0G Compute, and 0G Chain

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Network](https://img.shields.io/badge/network-0G%20Galileo%20Testnet-orange)
![Solidity](https://img.shields.io/badge/solidity-0.8.20-blue)

---

## 🎯 Problem

Academic publishing is broken:
- **Expensive paywalls** — papers locked behind $30-50 fees
- **No transparency** — peer review is opaque and slow
- **Centralized control** — a few publishers monopolize knowledge
- **No incentive for authors** — researchers get zero revenue from their own papers

## 💡 Solution

**RumahPeneliti** (Researcher's Home) is a decentralized journal platform that:

1. **Stores papers on 0G Storage** — decentralized, immutable, censorship-resistant
2. **AI Curation via 0G Compute** — automated paper summarization and analysis
3. **On-chain verification** — paper hashes anchored to 0G blockchain with DA proofs
4. **NFT Minting** — each curated paper becomes a research NFT
5. **Micropayments** — readers pay directly to authors via smart contracts (no middleman)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  Home │ Browse │ Upload │ Article │ Pipeline Wizard      │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│                    Backend (Express.js)                   │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐ │
│  │0G Storage│ │0G DA    │ │PaperAnchor│ │0G Compute    │ │
│  │ Upload   │ │ Proof   │ │ Service   │ │ AI Curation  │ │
│  └────┬─────┘ └────┬────┘ └─────┬─────┘ └──────┬───────┘ │
└───────┼─────────────┼────────────┼──────────────┼─────────┘
        │             │            │              │
┌───────▼─────────────▼────────────▼──────────────▼─────────┐
│                    0G Network (Galileo Testnet)            │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐              │
│  │0G Storage │  │0G DA     │  │0G Compute  │              │
│  │Network    │  │Layer     │  │Network     │              │
│  └──────────┘  └──────────┘  └────────────┘              │
│                                                           │
│  Smart Contracts:                                         │
│  • JournalPayment — micropayment for paper access         │
│  • PaperAnchor — on-chain paper hash verification         │
│  • ResearchNFT — ERC-721 NFT for curated papers           │
└───────────────────────────────────────────────────────────┘
```

---

## ⚡ 0G Integration (6-Step Pipeline)

When a researcher uploads a paper, the following pipeline executes:

| Step | Component | Description |
|------|-----------|-------------|
| 1️⃣ | **0G Storage** | Paper uploaded to decentralized storage network, Merkle root computed |
| 2️⃣ | **0G DA Layer** | Data availability proof published with blob commitment |
| 3️⃣ | **PaperAnchor** | Storage root anchored on-chain for immutability verification |
| 4️⃣ | **0G Compute** | Decentralized AI generates curated summary (falls back to GLM API → mock) |
| 5️⃣ | **Article Anchor** | AI curation hash anchored on-chain |
| 6️⃣ | **ResearchNFT** | Gasless NFT minted for the paper (backend-sponsored) |

---

## 📜 Smart Contracts (0G Galileo Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| JournalPayment | `0xF5E23E98a6a93Db2c814a033929F68D5B74445E2` | Micropayments for paper access |
| PaperAnchor | `0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE` | On-chain paper hash verification |
| ResearchNFT | `0x5495b92aca76B4414C698f60CdaAD85B364011a1` | ERC-721 NFT minting |

Explorer: [https://chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai)

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Framer Motion, Ethers.js, MetaMask
- **Backend**: Express.js, SQLite, Multer
- **Blockchain**: Solidity 0.8.20, Hardhat, OpenZeppelin
- **0G Network**: 0G Storage SDK, 0G DA Layer, 0G Compute Network
- **AI**: 0G Compute (primary) → Z.AI GLM-5.1 (fallback) → Mock (last resort)
- **Deployment**: Docker, Nginx Proxy Manager

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MetaMask wallet

### 1. Clone & Setup
```bash
git clone https://github.com/akzmee/rumahpeneliti.git
cd rumahpeneliti
cp .env.example .env
```

### 2. Configure `.env`
```env
# See .env.example for all options
LLM_API_KEY=your_zai_api_key
RPC_URL=https://evmrpc-testnet.0g.ai
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0xF5E23E98a6a93Db2c814a033929F68D5B74445E2
PAPER_ANCHOR_ADDRESS=0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE
NFT_CONTRACT_ADDRESS=0x5495b92aca76B4414C698f60CdaAD85B364011a1
CHAIN_ID=16602
```

### 3. Run with Docker
```bash
docker-compose up -d --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Pipeline Wizard: http://localhost:3000/pipeline

### 4. Deploy Contracts (optional)
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network zeroTestnet
npx hardhat run scripts/deploy-anchor.js --network zeroTestnet
npx hardhat run scripts/deploy-nft.js --network zeroTestnet
```

---

## 📂 Project Structure

```
rumahpeneliti/
├── frontend/           # Next.js frontend
│   └── src/app/
│       ├── page.js           # Home page
│       ├── browse/           # Browse papers
│       ├── upload/           # Upload paper
│       ├── article/[id]/     # Article view with purchase
│       └── pipeline/         # 0G Pipeline Wizard
├── backend/            # Express.js API
│   └── src/
│       ├── index.js          # API routes
│       ├── db.js             # SQLite database
│       └── services/
│           ├── storage.js    # 0G Storage upload
│           ├── da-layer.js   # 0G DA proof
│           ├── anchor.js     # PaperAnchor service
│           ├── og-compute.js # 0G Compute client
│           ├── kurasi.js     # AI curation pipeline
│           ├── kurasi-core.js# Curation logic
│           └── nft.js        # ResearchNFT minting
├── contracts/          # Solidity smart contracts
│   ├── contracts/
│   │   ├── JournalPayment.sol
│   │   ├── PaperAnchor.sol
│   │   └── ResearchNFT.sol
│   └── scripts/
│       ├── deploy.js
│       ├── deploy-anchor.js
│       └── deploy-nft.js
└── docker-compose.yml
```

---

## 🔮 Key Features

- **📄 Paper Upload** — Upload research papers (PDF/TXT/MD) to decentralized storage
- **🤖 AI Curation** — Automatic paper summarization with key takeaways and tags
- **🔗 On-Chain Verification** — Paper hashes anchored to 0G blockchain
- **🎭 NFT Minting** — Gasless NFT minting for published papers (ERC-721)
- **💰 Micropayments** — Readers pay directly to authors via smart contracts
- **🧙 Pipeline Wizard** — Visual 6-step pipeline with real-time status

---

## 👤 Author

**akzmee** — S2 Student, Fullstack Developer
- Building decentralized academic publishing for the future

---

## 📄 License

MIT License
