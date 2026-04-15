# RumahPeneliti.com — 0G APAC Hackathon

## Overview
Platform jurnal terdesentralisasi dengan AI kurasi dan micropayment.

## Alur MVP
```
Upload paper → 0G Storage → AI Kurasi → Micropayment → Baca Artikel
```

## Tech Stack
- **0G Storage** — simpan paper (SDK TypeScript)
- **0G Chain** — smart contract micropayment (Solidity, EVM)
- **AI Agent** — kurasi paper jadi artikel menarik (LLM API)
- **Frontend** — RumahPeneliti.com (Next.js/React)
- **Backend** — API server (Node.js/Express)

## Struktur Folder
- `contracts/` — Solidity smart contracts (micropayment)
- `backend/` — API server + AI agent + 0G Storage integration
- `frontend/` — Web UI
- `agents/` — AI agent scripts (kurasi, parser)
- `docs/` — Dokumentasi project

## Deadline
16 Mei 2026

## Roadmap
### Minggu 1 (18-24 Apr): Setup & Infrastructure
- [ ] Setup project & dependencies
- [ ] Pelajari 0G Storage SDK
- [ ] Pelajari 0G Chain (deploy contract)
- [ ] Buat smart contract micropayment

### Minggu 2 (25 Apr-1 Mei): Core Features
- [ ] 0G Storage integration (upload/download paper)
- [ ] AI Agent kurasi paper → artikel
- [ ] Backend API

### Minggu 3 (2-8 Mei): Frontend & Integration
- [ ] Frontend RumahPeneliti.com
- [ ] Integrasi semua komponen
- [ ] Testing

### Minggu 4 (9-15 Mei): Polish & Submit
- [ ] Demo video
- [ ] Pitch deck
- [ ] Dokumentasi
- [ ] Submit!
