<p align="center">
  <img src="https://img.shields.io/badge/0G-Mainnet-brightgreen?style=for-the-badge&logo=ethereum" alt="0G Mainnet" />
  <img src="https://img.shields.io/badge/AI-GLM--5_FP8-blue?style=for-the-badge" alt="GLM-5" />
  <img src="https://img.shields.io/badge/Multi--Agent-3_+_1_Parallel-orange?style=for-the-badge" alt="Multi-Agent" />
  <img src="https://img.shields.io/badge/Tests-101_Passing-success?style=for-the-badge" alt="101 Tests" />
  <img src="https://img.shields.io/badge/Solo_Dev-Built-red?style=for-the-badge" alt="Solo Dev" />
</p>

<h1 align="center">RumahPeneliti</h1>
<h3 align="center">Decentralized Academic Research Platform on 0G</h3>

<p align="center">
  <i>Upload a paper. AI curates it. Blockchain anchors it. Readers discover it. No publisher middleman.</i>
</p>

<p align="center">
  <a href="https://rumahpeneliti.com">Live App</a> ·
  <a href="https://chainscan.0g.ai/address/0xF5E23E98a6a93Db2c814a033929F68D5B74445E2">JournalPayment</a> ·
  <a href="https://chainscan.0g.ai/address/0x410837Dd2476d7E70210063D11030D0842653f69">PaperAnchor</a> ·
  <a href="https://chainscan.0g.ai/address/0x78C414367A91917fe5DC8123119467c9910a4B6d">ResearchNFT</a>
</p>

---

> RumahPeneliti (Indonesian: "Researcher's Home") is a decentralized academic research platform built for the **0G APAC Hackathon 2026**. Researchers upload papers that are curated by a multi-agent AI pipeline (GLM-5 via **0G Compute**), stored on **0G Storage**, proven on **0G DA Layer**, anchored on **0G Chain**, and minted as NFTs. Readers discover, read, and support authors through blockchain micropayments — all gasless.

---

## The Problem

Academic publishing is broken. Researchers hand copyright to publishers who charge $30-50 per paper view, while authors receive $0. Peer review takes months. There is no AI-powered curation layer. And if a publisher goes down, decades of research disappear.

```
Researcher writes paper → Gives copyright to publisher → Publisher charges readers $40
                          → Author earns $0
                          → Review takes 6 months
                          → No AI curation, no blockchain proof, no decentralized storage
```

## The Solution

RumahPeneliti replaces the traditional publisher with a **decentralized, AI-powered pipeline**:

| Capability | What It Does | 0G Component |
|:---:|:---|:---:|
| **Decentralized Storage** | Paper files stored permanently with Merkle proofs | 0G Storage |
| **AI Curation** | 3 parallel agents + 1 reviewer via TEE inference | 0G Compute |
| **Data Availability** | Blob commitments published on-chain for proof | 0G DA Layer |
| **On-Chain Anchoring** | Paper hashes, citations, and article hashes anchored in smart contracts | 0G Chain |
| **NFT Minting** | Every curated paper becomes a transferable ERC-721 NFT | 0G Chain |
| **Micropayments** | Readers pay authors directly in 0G tokens | 0G Chain |

---

## Architecture

### System Overview

```mermaid
graph TB
    subgraph Frontend["RumahPeneliti — Next.js 14"]
        UI["11 Pages<br/>Home · Browse · Upload · Article<br/>Pipeline · Profile · NFTs<br/>Verify · Analytics · Leaderboard · Tech"]
        Wallet["MetaMask<br/>Sign-In · Auth · Micropayments"]
    end

    subgraph Backend["Express.js API"]
        API["REST API<br/>10 Controllers · 8 Routes"]
        Auth["JWT Auth<br/>Nonce → Sign → Verify"]
        Pipeline["6-Step Pipeline<br/>Upload → DA → Anchor → AI → Article → NFT"]
    end

    subgraph AI["Multi-Agent Pipeline"]
        Summarizer["Summarizer<br/>Article Generation"]
        Scorer["Scorer<br/>Quality Assessment"]
        Tagger["Tagger<br/>Classification"]
        Reviewer["Reviewer<br/>On-Demand"]
    end

    subgraph ZeroG["0G Infrastructure"]
        Storage[("0G Storage<br/>Merkle-Verified")]
        Compute["0G Compute<br/>TEE Inference · GLM-5"]
        DA["0G DA Layer<br/>Blob Commitments"]
        Chain["0G Chain<br/>3 Smart Contracts"]
    end

    subgraph Indexer["Ponder Indexer"]
        Ponder["Event Indexer<br/>4 Tables · GraphQL API"]
    end

    UI --> Wallet
    UI --> API
    Wallet --> Auth
    API --> Pipeline
    Pipeline --> Storage
    Pipeline --> DA
    Pipeline --> Chain
    Pipeline --> Compute
    Compute --> Summarizer
    Compute --> Scorer
    Compute --> Tagger
    Summarizer --> Reviewer
    Chain --> Ponder
    Storage --> Ponder

    style Frontend fill:#1a1a2e,stroke:#a78bfa,color:#fff
    style Backend fill:#1a1a2e,stroke:#34d399,color:#fff
    style AI fill:#1a1a2e,stroke:#f59e0b,color:#fff
    style ZeroG fill:#0f0f12,stroke:#60a5fa,color:#fff
    style Indexer fill:#1a1a2e,stroke:#f97316,color:#fff
```

### Pipeline: Upload to NFT in ~40 Seconds

```mermaid
sequenceDiagram
    participant R as Researcher
    participant FE as Frontend
    participant BE as Backend API
    participant S as 0G Storage
    participant DA as 0G DA Layer
    participant C as 0G Compute (TEE)
    participant CH as 0G Chain

    R->>FE: Upload paper + sign message
    FE->>BE: POST /api/papers (FormData + signature)

    Note over BE: Step 1 — Storage
    BE->>S: ZgFile.upload() → Merkle tree
    S-->>BE: rootHash + txHash

    Note over BE: Step 2 — DA Proof
    BE->>DA: keccak256(blob) → self-transfer tx
    DA-->>BE: blobHash + txHash + blockNumber

    Note over BE: Step 3 — Anchor
    BE->>CH: PaperAnchor.anchorPaper(root, curation, meta)
    CH-->>BE: paperId + txHash
    BE-->>FE: Response (paperId, pipeline started)

    Note over BE: Step 4 — AI Curation (async)
    BE->>C: Multi-agent inference (3 parallel)
    C-->>BE: Summary + Score + Tags

    Note over BE: Step 5 — Article Anchor (async)
    BE->>CH: PaperAnchor.setArticle(paperId, articleHash)

    Note over BE: Step 6 — NFT Mint (async)
    BE->>CH: ResearchNFT.mintResearch(to, paperId, ...)
    CH-->>BE: tokenId + ResearchMinted event

    BE-->>FE: Pipeline complete (via SSE)
    FE-->>R: Paper curated, anchored, and NFT minted
```

### Multi-Agent Curation Pipeline

```mermaid
flowchart LR
    A[Paper Uploaded] --> B{0G Compute<br/>Available?}
    B -->|Yes| C[0G Compute Network<br/>GLM-5-FP8 · TEE]
    B -->|No| D{Z.AI API<br/>Available?}
    D -->|Yes| E[GLM-5.1 API<br/>Fallback]
    D -->|No| F[Mock Data<br/>Final Fallback]
    C --> G
    E --> G
    F --> G

    subgraph G["3 Parallel Agents"]
        direction TB
        S["Summarizer<br/>curated_title · summary<br/>key_takeaways · body"]
        SC["Scorer<br/>novelty · clarity<br/>methodology · impact"]
        T["Tagger<br/>tags · domain · subdomain<br/>research_type · difficulty"]
    end

    G --> H{Quality<br/>Threshold?}
    H -->|Below| I["Reviewer Agent<br/>On-demand re-evaluation"]
    H -->|Pass| J[Merged Result]
    I --> J
    J --> K[Curated Article<br/>Stored in DB + Anchored On-Chain]

    style A fill:#7c3aed,color:#fff
    style C fill:#2563eb,color:#fff
    style I fill:#f59e0b,color:#000
    style K fill:#34d399,color:#000
```

### Smart Contract Architecture

```mermaid
classDiagram
    class JournalPayment {
        +uploadPaper(title, paperHash, price) uint256
        +purchasePaper(paperId) payable
        +setArticle(paperId, articleHash)
        +checkAccess(paperId, reader) bool
        +getPaper(paperId) Paper
    }

    class PaperAnchor {
        +anchorPaper(storageRoot, curationHash, metadataHash) uint256
        +setArticle(paperId, articleHash)
        +citePaper(paperId)
        +verifyPaper(paperId, storageRoot) bool
        +getPapersByAuthor(author) uint256[]
    }

    class ResearchNFT {
        +ERC721 RPR
        +mintResearch(to, paperId, storageRoot, curationHash, metadataURI) uint256
        +getResearchToken(tokenId) ResearchToken
        +getTokenByPaper(paperId) ResearchToken
        +totalSupply() uint256
    }

    JournalPayment --> PaperAnchor : paperId reference
    PaperAnchor --> ResearchNFT : paperId → tokenId
```

---

## Source of Truth — On-Chain First

The backend uses a local database for fast reads and caching, but the **source of truth is always on-chain**:

- Paper files live on **0G Storage** (decentralized, Merkle-verified, permanent)
- Paper hashes and metadata are anchored on **0G Chain** via PaperAnchor contract
- A **Ponder indexer** independently indexes all on-chain events into 4 tables
- If the backend goes down, anyone can rebuild the entire index from on-chain events

---

## 0G Integration Proof

This project integrates **all 4 core 0G components**:

| Component | How It's Used | SDK |
|:---:|:---|:---|
| **0G Storage** | Paper files uploaded via `@0gfoundation/0g-ts-sdk`. Merkle tree built client-side. Root hash stored on-chain for verification. Supports upload, download. | `ZgFile`, `Indexer` |
| **0G Compute** | All AI inference via `@0glabs/0g-serving-broker`. GLM-5-FP8 model. TEE-verified responses via `processResponse()`. On-chain ledger billing with auto-deposit. | `createZGComputeNetworkBroker` |
| **0G DA Layer** | Blob commitments (`keccak256` of storage root + metadata) published as on-chain transactions. Self-transfer pattern with `RP:DA:` prefix. | `ethers.js v6` |
| **0G Chain** | 3 Solidity contracts: `JournalPayment`, `PaperAnchor`, `ResearchNFT`. Handles anchoring, micropayments, NFT minting, citations, access control. | Hardhat, ethers.js |

### Contract Addresses (0G Mainnet)

| Contract | Address | Explorer |
|:---|:---|:---:|
| JournalPayment | `0xF5E23E98a6a93Db2c814a033929F68D5B74445E2` | [View](https://chainscan.0g.ai/address/0xF5E23E98a6a93Db2c814a033929F68D5B74445E2) |
| PaperAnchor | `0x410837Dd2476d7E70210063D11030D0842653f69` | [View](https://chainscan.0g.ai/address/0x410837Dd2476d7E70210063D11030D0842653f69) |
| ResearchNFT | `0x78C414367A91917fe5DC8123119467c9910a4B6d` | [View](https://chainscan.0g.ai/address/0x78C414367A91917fe5DC8123119467c9910a4B6d) |

---

## Key Features

<table>
<tr>
<td width="50%">

### Multi-Agent AI Curation
3 parallel agents (Summarizer, Scorer, Tagger) run through 0G Compute's TEE inference. Each agent has a distinct role — one generates the article, one scores quality across 4 dimensions, one classifies and tags. A 4th Reviewer agent re-evaluates papers that fall below threshold.

</td>
<td width="50%">

### Full Pipeline — End to End
Upload → 0G Storage → DA Proof → On-Chain Anchor → AI Curation → Article Anchor → NFT Mint. The entire flow completes in ~40 seconds. Steps 1-3 are synchronous (user waits), steps 4-6 run async with SSE progress updates.

</td>
</tr>
<tr>
<td>

### Gasless UX
Backend sponsors all gas fees via a hot wallet. Users never need to hold tokens or sign transactions for NFT minting. The only wallet interaction is a single signature to verify identity on connect.

</td>
<td>

### On-Chain Verification
Paper integrity is verifiable by anyone. `PaperAnchor.verifyPaper()` checks the storage root matches the on-chain record. The Ponder indexer independently tracks all events — anchors, articles, NFTs, payments.

</td>
</tr>
<tr>
<td>

### Signature-Gated Upload
Before AI curation runs, the user must sign a submission message via MetaMask. The backend verifies this signature against the PaperAnchor contract. No signature = no AI execution. Prevents spam and ensures accountability.

</td>
<td>

### Micropayments & Donations
Authors set a price in 0G tokens (or free). Readers pay directly to the author via `JournalPayment.purchasePaper()`. No publisher takes a cut. Free papers still allow reader donations.

</td>
</tr>
<tr>
<td>

### 11 Production Pages
Home, Browse, Upload, Article Detail (with AI chat + score), Pipeline Monitor, Profile, NFT Gallery, Verify, Analytics Dashboard, Leaderboard, Tech Stack — not a prototype.

</td>
<td>

### Ponder Indexer + GraphQL
Independent blockchain event indexer with 4 tables (`paper_anchor_events`, `article_anchor_events`, `research_nft_events`, `payment_events`). Exposes REST + GraphQL API. Anyone can rebuild the index from chain.

</td>
</tr>
</table>

---

## Quick Start

### Prerequisites
- Node.js >= 18
- MetaMask or compatible wallet
- 0G tokens on Mainnet or Testnet

### Setup

```bash
git clone https://github.com/akzmee/rumah-peneliti
cd rumah-peneliti

# Install all dependencies
make install

# Configure environment
cp .env.example .env
# Edit .env — add LLM_API_KEY, PRIVATE_KEY, contract addresses
cp frontend/.env.local.example frontend/.env.local

# Database auto-seeds on first backend start
```

### Run

```bash
# Start both backend (:3001) and frontend (:3000)
make dev

# Or run individually
cd backend && npm run dev       # Express with --watch
cd frontend && npm run dev      # Next.js on :3000
cd indexer && npm run dev       # Ponder GraphQL on :42069
```

### Test

```bash
make test                       # All tests (auth + E2E)
make test-auth                  # Auth flow (24 tests)
make test-e2e                   # Full E2E browser tests (77 tests)
cd backend && npm run test:api  # Vitest API pipeline tests
```

---

## Project Structure

```
rumah-peneliti
├── backend/                     # Express.js API server
│   └── src/
│       ├── controllers/         # 10 controllers (papers, auth, analytics, nft, pipeline...)
│       ├── routes/              # 8 route modules
│       ├── services/
│       │   ├── storage.js       # 0G Storage upload (ZgFile, Indexer, Merkle)
│       │   ├── da-layer.js      # 0G DA Layer blob commitment proofs
│       │   ├── anchor.js        # PaperAnchor on-chain service
│       │   ├── og-compute.js    # 0G Compute Network client (GLM-5)
│       │   ├── multi-agent.js   # 3 parallel AI agents + orchestrator
│       │   ├── kurasi.js        # AI curation orchestrator (0G → API → Mock)
│       │   └── nft.js           # ResearchNFT gasless minting
│       ├── middleware/           # JWT auth, error handler
│       └── db.js                # SQLite setup + auto-seed
├── frontend/                    # Next.js 14 App Router
│   └── src/
│       ├── app/                 # 11 pages (home, browse, upload, article, pipeline, nfts...)
│       ├── components/          # UI components (shadcn/ui, article, home, layout, pipeline)
│       ├── contexts/            # React Context (wallet, theme, language)
│       ├── hooks/               # Custom hooks (scroll reveal)
│       └── lib/                 # Auth, API client, constants, toast
├── contracts/                   # Solidity smart contracts
│   ├── contracts/
│   │   ├── JournalPayment.sol   # Micropayments
│   │   ├── PaperAnchor.sol      # Paper hash verification + citations
│   │   └── ResearchNFT.sol      # ERC-721 NFT minting
│   └── scripts/                 # Deploy scripts (testnet + mainnet)
├── indexer/                     # Ponder blockchain event indexer
│   ├── ponder.config.ts         # Chain config + contract addresses
│   ├── ponder.schema.ts         # 4 tables schema
│   └── src/                     # Event handlers + Hono REST API
└── e2e/                         # Playwright E2E test suite (77 tests)
```

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Smart Contracts | Solidity 0.8.20, Hardhat, OpenZeppelin v5 (ERC-721, Ownable) |
| AI Inference | GLM-5-FP8 via 0G Compute (TEE), Z.AI GLM-5.1 API (fallback) |
| 0G Storage | `@0gfoundation/0g-ts-sdk` — Merkle proofs, upload/download |
| 0G Compute | `@0glabs/0g-serving-broker` — TEE inference, on-chain billing |
| Backend | Express.js, better-sqlite3, JWT auth, Multer |
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui (Radix), Ethers.js v6 |
| Indexer | Ponder v0.7, PGLite, Viem, Hono |
| Blockchain | 0G Mainnet (Chain ID 16661) |
| Testing | Vitest (API), Playwright (E2E) — 101 tests passing |

---

## Key Differentiators

| | RumahPeneliti | Traditional Publisher |
|:---|:---|:---|
| **Storage** | 0G Storage (decentralized, permanent) | Centralized servers |
| **Curation** | Multi-agent AI (GLM-5, TEE-verified) | Manual peer review (months) |
| **Payments** | Direct to author, 0% cut | $30-50 per view, author gets $0 |
| **Ownership** | ERC-721 NFT (transferable) | Copyright transferred to publisher |
| **Verification** | On-chain hash + Merkle proof | None |
| **Availability** | Decentralized + independently indexable | Single point of failure |

---

## License

MIT

---

<p align="center">
  Built for the <a href="https://www.hackquest.io/hackathons/0G-APAC-Hackathon">0G APAC Hackathon 2026</a> (Track 3: Agentic Economy)
  <br/>
  <b>#0GHackathon #BuildOn0G</b>
</p>
