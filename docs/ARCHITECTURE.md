# Architecture — RumahPeneliti.com

> Decentralized Research Platform with AI Curation & Blockchain Micropayments

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RumahPeneliti.com                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐     ┌───────────────────┐    ┌────────────────┐  │
│  │   Frontend        │     │    Backend API     │    │   Blockchain   │  │
│  │   (Next.js)       │────▶│    (Express.js)    │───▶│  (0G Chain)    │  │
│  │   Port 3000       │     │    Port 3001       │    │  EVM-compatible│  │
│  │                    │     │                    │    │                │  │
│  │  ┌──────────────┐ │     │  ┌──────────────┐  │    │  ┌──────────┐  │  │
│  │  │ Wallet Context│ │     │  │ Paper Routes │  │    │  │JournalPay│  │  │
│  │  │ (ethers.js)  │ │◀───▶│  │ Article Routes│  │    │  │ ment.sol │  │  │
│  │  └──────────────┘ │     │  │ Purchase      │  │    │  └──────────┘  │  │
│  │  ┌──────────────┐ │     │  └──────────────┘  │    │                │  │
│  │  │ i18n (EN/ID/ │ │     │  ┌──────────────┐  │    │  Events:       │  │
│  │  │   CN)        │ │     │  │ AI Kurasi    │  │    │  PaperUploaded  │  │
│  │  └──────────────┘ │     │  │ (GLM-5.1)   │  │    │  PaperPurchased │  │
│  │  ┌──────────────┐ │     │  └──────────────┘  │    │  ArticleCreated │  │
│  │  │ Theme (Dark/ │ │     │  ┌──────────────┐  │    └────────────────┘  │
│  │  │   Light)     │ │     │  │ 0G Storage   │  │                        │
│  │  └──────────────┘ │     │  │ Service      │  │    ┌────────────────┐  │
│  └──────────────────┘     │  └──────────────┘  │    │  0G Storage     │  │
│                            │  ┌──────────────┐  │    │  (File Storage) │  │
│                            │  │ SQLite DB    │  │    │                 │  │
│                            │  │ (better-     │  │    │  Content-hash   │  │
│                            │  │  sqlite3)    │  │    │  addressed      │  │
│                            │  └──────────────┘  │    └────────────────┘  │
│                            └───────────────────┘                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer           | Technology                                          | Purpose                                     |
|-----------------|-----------------------------------------------------|---------------------------------------------|
| **Frontend**    | Next.js 14 (React 18)                               | SSR/CSR hybrid UI                           |
|                 | Framer Motion                                       | Animations & transitions                    |
|                 | ethers.js v6                                        | Wallet connection & contract interaction    |
|                 | react-icons                                         | Icon library                                |
| **Backend**     | Express.js 4                                        | REST API server                             |
|                 | better-sqlite3                                      | Embedded database (WAL mode)                |
|                 | multer                                              | File upload handling                        |
|                 | ethers.js v6                                        | Blockchain interaction                      |
| **Blockchain**  | Solidity 0.8.20                                     | Smart contract language                     |
|                 | Hardhat                                             | Development framework                       |
|                 | 0G Chain (EVM)                                      | Deployment target (testnet/mainnet)         |
| **Storage**     | 0G Storage SDK (`@0glabs/0g-ts-sdk`)               | Decentralized file storage                  |
| **AI**          | Z.AI GLM-5.1 API                                    | Paper → Article curation                    |
| **Database**    | SQLite (WAL mode)                                   | Papers, articles, purchases                 |

---

## Data Flow

### Paper Upload Flow

```
Author                  Frontend              Backend               AI/Storage         Blockchain
  │                       │                     │                      │                   │
  │  Fill form + file     │                     │                      │                   │
  │──────────────────────▶│  POST /api/papers   │                      │                   │
  │                       │────────────────────▶│  Save to SQLite      │                   │
  │                       │                     │──────────────────┐   │                   │
  │                       │                     │  Upload to 0G    │   │                   │
  │                       │                     │  Storage         │   │                   │
  │                       │                     │◀─────────────────┘   │                   │
  │                       │  Return paper ID    │                      │                   │
  │                       │◀────────────────────│                      │                   │
  │                       │                     │  (Background)        │                   │
  │                       │                     │  Generate AI article │                   │
  │                       │                     │──────────────────────▶│                   │
  │                       │                     │  Curated article     │                   │
  │                       │                     │◀──────────────────────│                   │
  │                       │                     │  Save article to DB  │                   │
  │                       │                     │──────────────────┐   │                   │
  │                       │                     │  (Optional)       │   │                   │
  │                       │                     │  uploadPaper()    │   │  On-chain register│
  │                       │                     │──────────────────────────────────────────▶│
  │                       │                     │                      │                   │
```

### Article Access & Payment Flow

```
Reader                  Frontend              Backend               Blockchain
  │                       │                     │                      │
  │  Browse articles      │                     │                      │
  │──────────────────────▶│  GET /api/articles  │                      │
  │                       │────────────────────▶│                      │
  │  View article (blurred)│                    │                      │
  │◀──────────────────────│                     │                      │
  │                       │                     │                      │
  │  Click "Unlock"       │                     │                      │
  │──────────────────────▶│  Check access       │                      │
  │                       │────────────────────▶│                      │
  │                       │                     │                      │
  │  MetaMask popup       │                     │                      │
  │  (send ETH)           │                     │                      │
  │──────────────────────▶│  eth_sendTransaction│                      │
  │                       │────────────────────────────────────────────▶│
  │                       │                     │                      │
  │                       │  POST /api/papers/:id/purchase              │
  │                       │────────────────────▶│  Record purchase     │
  │                       │                     │  in SQLite           │
  │  Full article shown   │                     │                      │
  │◀──────────────────────│                     │                      │
```

---

## AI Curation Pipeline

The AI curation service (`backend/src/services/kurasi.js`) transforms dense academic papers into engaging, accessible articles.

### Pipeline Steps

1. **Input Collection** — Combines paper title, abstract, and file content (up to 50,000 chars)
2. **Prompt Engineering** — Constructs a system prompt instructing the AI to act as a science journalist
3. **GLM-5.1 API Call** — Sends to Z.AI's GLM-5.1 endpoint with temperature 0.7 and max 4,000 tokens
4. **Response Parsing** — Extracts JSON from response (handles markdown code blocks)
5. **Structured Output** — Returns:
   - `curated_title` — Catchy, engaging headline
   - `summary` — 2-3 sentence hook
   - `key_takeaways` — 4 key points as array
   - `body` — 5-8 paragraph article in accessible language
   - `tags` — Topic tags for categorization
6. **Fallback** — If API fails, generates a mock article with generic content

### Key Design Decisions

- **Background Processing**: Curation runs asynchronously after paper upload; the API responds immediately
- **Graceful Degradation**: Mock articles ensure the platform always has content
- **Content Truncation**: Only first 10,000 characters sent to API to stay within token limits

---

## Smart Contract — JournalPayment.sol

### Contract Overview

| Function        | Type      | Access    | Description                              |
|-----------------|-----------|-----------|------------------------------------------|
| `uploadPaper`   | Write     | Any       | Register paper with title, hash, price   |
| `purchasePaper` | Payable   | Any       | Pay to access paper (direct to author)   |
| `setArticle`    | Write     | Author    | Link curated article hash to paper       |
| `checkAccess`   | View      | Any       | Check if reader has purchased access     |
| `getPaper`      | View      | Any       | Retrieve paper metadata                  |

### Data Structures

```solidity
struct Paper {
    address author;        // Paper author's wallet
    string title;          // Paper title
    string paperHash;      // 0G Storage content hash
    uint256 price;         // Price in wei
    string articleHash;    // 0G Storage hash for curated article
    bool exists;           // Existence flag
}
```

### Events

- `PaperUploaded(paperId, author, title, paperHash, price)` — Emitted when a paper is registered
- `PaperPurchased(paperId, reader, amount)` — Emitted on micropayment
- `ArticleCreated(paperId, articleHash)` — Emitted when AI article is linked

### Deployment Networks

| Network        | RPC URL                                        | Chain ID |
|----------------|------------------------------------------------|----------|
| 0G Testnet     | `https://evm-rpc.zero-testnet.xdao.ai`         | 8008     |
| 0G Mainnet     | `https://evm-rpc.0g.ai`                        | —        |

---

## 0G Storage Integration

The storage service (`backend/src/services/storage.js`) handles decentralized file storage via 0G.

### Functions

- **`uploadTo0G(buffer, filename)`** — Uploads file buffer to 0G Storage, returns content hash
- **`downloadFrom0G(hash)`** — Retrieves file from 0G Storage by content hash

### Fallback Behavior

If the 0G SDK is unavailable or not configured, the service falls back to:
- Generating a deterministic mock hash from the file content
- Storing files locally in `backend/uploads/`

---

## Database Schema

### SQLite Tables

```sql
-- Research papers
CREATE TABLE papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT DEFAULT '',
    abstract TEXT DEFAULT '',
    file_path TEXT DEFAULT '',
    upload_date TEXT DEFAULT (datetime('now')),
    price_wei TEXT DEFAULT '0',
    author_wallet TEXT DEFAULT ''
);

-- AI-curated articles (1:1 with papers)
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL UNIQUE,
    curated_title TEXT NOT NULL,
    summary TEXT DEFAULT '',
    key_takeaways TEXT DEFAULT '[]',    -- JSON array
    body TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',             -- JSON array
    created_date TEXT DEFAULT (datetime('now')),
    is_mock INTEGER DEFAULT 0,          -- 1 = fallback mock article
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

-- Purchase records
CREATE TABLE purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    buyer_wallet TEXT NOT NULL,
    tx_hash TEXT DEFAULT '',
    amount TEXT DEFAULT '0',
    purchase_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);
```

### Key Design Points

- **WAL mode** enabled for concurrent read/write performance
- **Foreign keys** enforced (`PRAGMA foreign_keys = ON`)
- **JSON fields** (`key_takeaways`, `tags`) stored as TEXT, parsed in application layer
- **Seed data** automatically created on first run (2 demo papers with articles)

---

## Frontend Architecture

### Pages

| Route               | File                              | Purpose                          |
|---------------------|-----------------------------------|----------------------------------|
| `/`                 | `src/app/page.js`                 | Homepage — hero, features, stats |
| `/browse`           | `src/app/browse/page.js`          | Browse articles & papers         |
| `/upload`           | `src/app/upload/page.js`          | Upload new paper form            |
| `/article/[id]`     | `src/app/article/[id]/page.js`    | Article detail + paywall         |

### Contexts

| Context           | File                        | Purpose                                |
|-------------------|-----------------------------|----------------------------------------|
| `WalletContext`   | `src/lib/wallet.js`         | MetaMask connection, address, signer   |
| `LanguageContext` | `src/LanguageContext.js`     | i18n — EN / ID (Bahasa) / CN (中文)    |
| `ThemeContext`    | `src/ThemeContext.js`        | Dark / Light theme toggle              |

### UI Components (`src/components/Web3UI.js`)

- **Nav** — Glassmorphism floating navbar with responsive mobile menu
- **Footer** — Site footer with links and tech info
- **GlassCard** — Glassmorphism card with hover animations
- **ParticleGrid** — Hexagonal SVG background pattern
- **ScrollReveal** — IntersectionObserver-based scroll animation
- **StaggerContainer/StaggerItem** — Staggered entrance animations
- **AnimatedCounter** — Number count-up animation
- **ReadingProgressBar** — Scroll progress indicator
- **EthIcon** — Ethereum diamond SVG icon
