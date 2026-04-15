# RumahPeneliti.com

> **Decentralized Research Platform with AI Curation & Blockchain Micropayments**

RumahPeneliti (Indonesian for "Researcher's Home") is a decentralized academic journal platform that makes research accessible to everyone. Authors upload papers, AI transforms them into engaging articles, and readers support authors through blockchain micropayments.

Built for the **0G APAC Hackathon 2026**.

---

## ✨ Features

| Feature                     | Description                                                        |
|-----------------------------|--------------------------------------------------------------------|
| 📤 **Paper Upload**         | Upload research papers (PDF/TXT/DOC) with metadata & pricing       |
| 🤖 **AI Curation**          | Z.AI GLM-5.1 transforms papers into engaging, accessible articles  |
| 💰 **Micropayments**        | Readers pay small ETH amounts to unlock full articles              |
| 🔗 **On-chain Registry**    | Papers registered on 0G blockchain with content hashes             |
| 🗄️ **0G Storage**           | Decentralized file storage via 0G Storage Network                  |
| 🌐 **Multilingual UI**      | Interface available in English, Bahasa Indonesia, and 中文          |
| 🌙 **Dark/Light Theme**     | Beautiful glassmorphism UI with theme toggle                       |
| 📱 **Responsive Design**    | Mobile-first design with floating navbar                           |
| 🦊 **Wallet Integration**   | MetaMask wallet connection for payments                            |
| 📊 **Stats & Rewards**      | Platform statistics and reward tracking                            |

---

## 🚀 Quick Start

```bash
# Clone
git clone <repo-url> && cd rumahpeneliti

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd contracts && npm install && cd ..

# Configure
cp backend/.env.example backend/.env       # Edit with your keys
cp frontend/.env.local.example frontend/.env.local

# Run
cd backend && npm run dev    # Terminal 1 — API on :3001
cd frontend && npm run dev   # Terminal 2 — UI on :3000
```

Open [http://localhost:3000](http://localhost:3000).

> 📖 See [DEVELOPMENT.md](./DEVELOPMENT.md) for full setup instructions.

---

## 📸 Screenshots

<!-- Add screenshots here -->

| Homepage                              | Browse Articles                        |
|---------------------------------------|----------------------------------------|
| ![Homepage](./screenshots/home.png)   | ![Browse](./screenshots/browse.png)    |

| Upload Paper                          | Article Detail                         |
|---------------------------------------|----------------------------------------|
| ![Upload](./screenshots/upload.png)   | ![Article](./screenshots/article.png)  |

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Next.js     │────▶│  Express.js  │────▶│   SQLite     │     │   0G Chain   │
│  Frontend    │     │  Backend     │     │   Database   │     │  Blockchain  │
│  (Port 3000) │◀────│  (Port 3001) │     │              │     │              │
└─────────────┘     └──────┬───────┘     └──────────────┘     └──────────────┘
                           │
                    ┌──────┴───────┐
                    │  AI Kurasi   │     ┌──────────────┐
                    │  (GLM-5.1)   │     │  0G Storage  │
                    └──────────────┘     └──────────────┘
```

> 📖 See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

---

## 📁 Project Structure

```
rumahpeneliti/
├── contracts/                 # Solidity smart contracts (Hardhat)
│   ├── contracts/JournalPayment.sol
│   ├── scripts/deploy.js
│   └── hardhat.config.js
├── backend/                   # Express.js API server
│   ├── src/
│   │   ├── index.js           # Routes & entry point
│   │   ├── db.js              # SQLite setup & seed data
│   │   ├── routes/            # Route handlers
│   │   └── services/
│   │       ├── kurasi.js      # AI curation service
│   │       └── storage.js     # 0G Storage integration
│   └── package.json
├── frontend/                  # Next.js web application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # Reusable UI components
│   │   └── lib/               # API client & wallet context
│   └── package.json
└── docs/                      # Documentation
```

---

## 🏆 Hackathon Info

### 0G APAC Hackathon 2026

RumahPeneliti is built for the **0G APAC Hackathon**, showcasing:

- **0G Storage** — Decentralized storage for research papers
- **0G Chain** — EVM-compatible blockchain for micropayments & on-chain registry
- **AI Integration** — Automated content curation pipeline

### Why This Matters

Academic publishing is broken:
- **Expensive access** — Journal subscriptions cost thousands
- **Paywalled knowledge** — Publicly-funded research locked behind paywalls
- **Poor accessibility** — Dense academic writing excludes general audiences

RumahPeneliti fixes this by:
- Enabling **direct author-to-reader** micropayments (no middleman)
- Using **AI curation** to make research accessible to everyone
- Storing papers on **decentralized storage** (censorship-resistant)
- Registering everything **on-chain** (transparent & verifiable)

---

## 🗺️ Roadmap

### Phase 1 — Core Platform ✅ (Current)
- [x] Paper upload with file storage
- [x] AI curation pipeline (GLM-5.1)
- [x] SQLite database with seed data
- [x] Browse & article detail pages
- [x] Wallet connection (MetaMask)
- [x] Multilingual UI (EN/ID/CN)
- [x] Smart contract (JournalPayment.sol)

### Phase 2 — 0G Deep Integration 🚧
- [ ] Full 0G Storage SDK integration (replace mock)
- [ ] On-chain paper registration on deploy
- [ ] 0G Compute for AI inference (optional)
- [ ] Content-addressed retrieval from 0G

### Phase 3 — Polish & Launch 📋
- [ ] Demo preparation (seed 3-5 curated papers)
- [ ] Pitch deck & demo video
- [ ] Mobile responsiveness testing
- [ ] SEO & meta tags
- [ ] Production deployment

### Phase 4 — Future 🚀
- [ ] Peer review system (on-chain reputation)
- [ ] Citation network visualization
- [ ] DOI integration
- [ ] Multi-chain support
- [ ] Governance token ($RP)
- [ ] Grant funding marketplace

---

## 👥 Team

| Member     | Role                          |
|------------|-------------------------------|
| akzmee     | Full-stack Developer & Lead   |

> Built with 💜 for the 0G APAC Hackathon 2026

---

## 📄 License

MIT

---

## 🔗 Links

- [Architecture Documentation](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [0G Network](https://0g.ai/)
- [0G APAC Hackathon](https://www.notion.so/0g-hack)
