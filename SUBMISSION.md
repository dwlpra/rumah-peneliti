# 0G APAC Hackathon 2026 — Submission

## 📋 Project Info

| Field | Value |
|-------|-------|
| **Project Name** | RumahPeneliti |
| **Tagline** | Decentralized Journal Platform with Self-Sustaining Agentic Economy on 0G |
| **Track** | AI / DeFi / Infrastructure |
| **Built on** | 0G Mainnet (Chain ID: 16661) |
| **Live App** | https://rumahpeneliti.com |
| **Backend API** | https://api.rumahpeneliti.com |
| **GitHub** | https://github.com/dwlpra/rumah-peneliti |

---

## 🎯 What It Does

RumahPeneliti is a **decentralized academic journal** where:

1. **Researchers upload papers** → stored permanently on 0G Storage
2. **AI agents curate papers** → summaries, scores, tags via 0G Compute (GLM-5)
3. **Papers are anchored on-chain** → immutable proof on 0G Chain
4. **Research NFTs are minted** → ERC-721 ownership for authors
5. **Readers tip AI agents** → tips auto-recycled to 0G Compute billing
6. **Authors earn micropayments** → direct payment, 0% platform cut

The result: a **self-sustaining Agentic Economy** where AI agents fund their own compute through reader tips.

---

## 🏗️ Architecture

```
Upload → AI Curation (GLM-5) → 0G Storage Upload → DA Proof → On-chain Anchor → NFT Mint
  ↓                                    ↓                  ↓           ↓              ↓
Paper DB                          Merkle Proof      Blob Commit   PaperAnchor    ResearchNFT
                                  (0G Storage)      (0G DA)      (0G Chain)     (0G Chain)
```

**Tech Stack:**
- **Frontend:** Next.js 14, React 18, Tailwind CSS, shadcn/ui, Ethers.js v6
- **Backend:** Express.js, SQLite, JWT auth, Multer
- **Smart Contracts:** Solidity 0.8.20, Hardhat, OpenZeppelin v5
- **AI:** GLM-5 via 0G Compute Network
- **Blockchain:** 0G Mainnet (Chain ID: 16661)
- **Storage:** 0G Storage (`@0gfoundation/0g-ts-sdk`)

---

## 📜 Smart Contracts (Deployed on 0G Mainnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **JournalPayment** | `0xc6FD8fa40ED06D21FDCA1961B75a7170991422D0` | Micropayment between readers and authors |
| **PaperAnchor** | `0x335C0b922325dd5214Bb9e7CDcA6a61A24B0d8C7` | On-chain paper hash anchoring |
| **ResearchNFT** | `0x010a70be3D661B98f69Ab4De1e213CA56C90de4a` | ERC-721 NFT for each curated paper |
| **AgenticID (ERC-7857)** | `0x82c5e31880929de181E5DF78D60f342168d18115` | On-chain AI agent identity standard |
| **AgentTipJar** | `0xc215A541aF7ad5072B08641272248801c5590e9a` | Reader → agent tipping with auto-compute funding |

Explorer: https://chainscan.0g.ai

---

## 🔧 0G Components Used

| 0G Component | How We Use It |
|:---:|---|
| **0G Storage** | Permanent paper storage with Merkle proof verification |
| **0G DA Layer** | Data availability proof with blob commitment |
| **0G Compute** | AI curation pipeline (GLM-5) for paper analysis |
| **0G Chain** | Smart contract deployment, payments, NFT minting |
| **0G Agentic ID (ERC-7857)** | Verifiable on-chain AI agent identity |

**All 5 0G infrastructure components are integrated.**

---

## 🤖 Agentic Economy — The Key Innovation

Most AI platforms are cost centers. RumahPeneliti creates a **closed-loop agent economy**:

```
Reader tips agent → Tips accumulate in AgentTipJar → Auto-withdraw to fund 0G Compute
    ↑                                                        ↓
    └──────── Agents earn more → better curation ←──────────┘
```

- **4 AI Agents** registered via Agentic ID: Summarizer, Scorer, Tagger, Reviewer
- Each agent has verifiable on-chain identity (model hash, capabilities, prompts)
- Tips are automatically recycled — no human subsidy needed
- Better curation → more tips → more compute → even better curation

---

## ✅ How to Test

### Live Demo
1. Visit https://rumahpeneliti.com
2. Browse curated papers on the Browse page
3. View AI-curated articles with summaries, scores, tags
4. Check on-chain verification on the Verify page
5. View deployed contracts on 0G ChainScan

### API Endpoints
```bash
# Health check
curl https://api.rumahpeneliti.com/api/health

# List papers
curl https://api.rumahpeneliti.com/api/papers

# Pipeline status
curl https://api.rumahpeneliti.com/api/pipeline/status

# NFT stats
curl https://api.rumahpeneliti.com/api/nfts/stats
```

### Smart Contract Verification
- View all contracts on https://chainscan.0g.ai
- Each paper upload triggers: Storage upload → DA proof → Chain anchor → NFT mint

---

## 📁 Project Structure

```
backend/      Express.js API server (SQLite, JWT auth, 0G integration)
frontend/     Next.js 14 App Router (React 18, Tailwind, shadcn/ui)
contracts/    Solidity smart contracts (Hardhat, OpenZeppelin)
indexer/      Ponder blockchain event indexer
agents/       AI curation agent scripts
e2e/          End-to-end test suite
scripts/      Setup and deployment scripts
```

---

## 🧪 Testing

- **101 unit tests** passing (Vitest)
- **Full E2E test suite** covering: auth flow, upload, pipeline, purchase, API endpoints
- **Smart contract tests** via Hardhat
- Test all API endpoints: health, papers, articles, pipeline, NFT stats, wallet status

---

## 🎬 Demo Video

See `demo-video-script.txt` for the demo walkthrough script.

---

## 👤 Team

- **akzmee** — Solo developer, S2 student, fullstack developer 5+ years

---

## 🔗 Links

- **Live App:** https://rumahpeneliti.com
- **API:** https://api.rumahpeneliti.com
- **GitHub:** https://github.com/dwlpra/rumah-peneliti
- **0G ChainScan:** https://chainscan.0g.ai

---

Built for the **0G APAC Hackathon 2026** 🚀

**#0GHackathon #BuildOn0G**
