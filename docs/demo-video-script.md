# 🎬 Skrip Video Demo Hackathon — RumahPeneliti
# Durasi: 5 menit | Format: Screen recording + narasi
# Untuk: 0G APAC Hackathon 2026 — Track 3: Agentic Economy

---

## SECTION 1: HOOK & MASALAH (0:00 - 0:45)

### VISUAL
- Screen: Statistik industri publishing akademik
- B-roll: Paper di balik paywall, researcher frustasi

### NARASI (Bahasa Inggris)

"Academic publishing is broken.

65% of the world's researchers can't afford to read the papers they need.
Publishers make over 10 billion dollars a year — while authors get ZERO.
Peer review takes 6 to 18 months. Some research never sees daylight.

Introducing **RumahPeneliti** — a fully decentralized research platform built on the 0G Network that eliminates publishers from the equation."

---

## SECTION 2: SOLUSI & ARSITEKTUR (0:45 - 1:45)

### VISUAL
- Screen: Architecture diagram (dari README)
- Animasi sederhana: flow Author → 0G → AI → Blockchain → Reader

### NARASI

"RumahPeneliti replaces the traditional publisher model with a decentralized pipeline. Here's how it works:

Instead of storing papers on a publisher's server, we use **0G Storage Network** — papers live on decentralized nodes, censorship-resistant, and forever accessible.

Instead of waiting months for peer review, we use **0G Compute Network** running a multi-agent AI pipeline powered by GLM-5 that automatically summarizes, scores, and classifies papers.

And instead of opaque review processes, every paper is anchored on **0G Chain** with Data Availability proofs — tamper-evident and publicly verifiable.

We integrate ALL FOUR 0G pillars: Storage, DA Layer, Compute, and Chain."

---

## SECTION 3: DEMO LIVE — UPLOAD & SIGNATURE (1:45 - 3:00)

### VISUAL
- Screen: Buka http://localhost:3000
- Tunjukkan homepage

### NARASI

"Let me show you how it works.

This is the RumahPeneliti homepage. A clean, modern interface for researchers.

Let's upload a paper."

### VISUAL
- Klik "Upload" di navbar
- Tunjukkan halaman upload — connect wallet dulu

### NARASI

"First, the author connects their MetaMask wallet. This is crucial — because in our system, the smart contract acts as a GATE before the AI can execute."

### VISUAL
- Klik "Connect Wallet"
- MetaMask popup muncul → approve
- Tunjukkan "Sign to Verify" step
- MetaMask popup kedua → sign login

### NARASI

"The author signs a message to prove wallet ownership. This is wallet-based authentication — no centralized login, no password."

### VISUAL
- Isi form: Title, Authors, Abstract
- Drag & drop file PDF
- Klik "Sign & Upload Paper"
- **MetaMask popup ketiga muncul** → TUNJUKKAN PESAN SIGNATURE

### NARASI

"Now here's the key innovation — the **Smart Contract Gate**.

Before the paper is submitted, MetaMask asks the author to sign a submission approval message. This message contains the paper title, timestamp, and an explicit approval for AI processing.

If the author rejects this signature — the upload is cancelled. The AI Agent does NOT run. Nothing happens.

This is what we call **signature-gated AI execution** — the smart contract ensures AI agents only execute when the author has cryptographically approved the submission."

### VISUAL
- Sign → Progress bar muncul
- Tunjukkan "Uploading & Processing..."
- Response sukses muncul dengan pipeline data

### NARASI

"Once the signature is verified, the 6-step decentralized pipeline kicks in automatically."

---

## SECTION 4: PIPELINE BREAKDOWN (3:00 - 3:50)

### VISUAL
- Screen: Tunjukkan pipeline response JSON
- Optional: Buka 0G explorer untuk tunjukkan transaksi

### NARASI

"In about 40 seconds, this is what happens:

**Step 1:** The paper is uploaded to **0G Storage Network** — decentralized, permanent.

**Step 2:** A **Data Availability proof** is published on-chain, proving the data exists and is retrievable.

**Step 3:** The storage hash is anchored on **0G Chain** via our PaperAnchor smart contract — creating an immutable, publicly verifiable record.

**Step 4:** Three AI agents run in parallel on **0G Compute**: one summarizes, one scores for quality, and one classifies the paper's domain and research type.

**Step 5:** The AI-generated article hash is also anchored on-chain, linking the curation result to the original paper.

**Step 6:** A **Research NFT** is minted as an ERC-721 token — the paper becomes a ownable digital asset."

---

## SECTION 5: BROWSE & FITUR (3:50 - 4:30)

### VISUAL
- Screen: Browse page — tunjukkan list papers
- Klik salah satu paper → halaman artikel

### NARASI

"After curation, papers appear in the browse page with AI-generated scores, tags, and classifications.

Each paper has a detailed article page with:

- AI-curated summary and key takeaways
- Quality scores — novelty, clarity, methodology, impact
- Domain classification
- On-chain verification data with direct links to the blockchain explorer
- An AI chat feature where readers can ask questions about the paper"

### VISUAL
- Scroll ke on-chain data section
- Tunjukkan hash, tx link ke explorer
- Coba AI chat — ketik pertanyaan

### NARASI

"Every piece of data is verifiable on-chain. Readers can check the storage hash, anchor transaction, and NFT directly on the 0G block explorer.

And with micropayments via smart contracts, readers pay directly to authors — zero middleman."

---

## SECTION 6: CLOSING & IMPACT (4:30 - 5:00)

### VISUAL
- Screen: Tampilkan semua fitur dalam grid/gallery
- Tech stack summary
- Logo 0G Network

### NARASI

"RumahPeneliti demonstrates the full power of the 0G ecosystem:

- **0G Storage** for decentralized paper storage
- **0G DA Layer** for data availability proofs  
- **0G Compute** for verifiable AI curation
- **0G Chain** for smart contracts, payments, and NFTs

But most importantly, we've built a system where **smart contracts and AI agents work in true synergy** — AI only executes when the blockchain verifies the author's signature, and every AI result is permanently recorded on-chain.

No more paywalls. No more gatekeepers. Research belongs to everyone.

This is RumahPeneliti. Thank you."

### VISUAL
- Logo RumahPeneliti
- GitHub: github.com/dwlpra/rumah-peneliti
- Website: rumahpeneliti.com
- "Built for 0G APAC Hackathon 2026"

---

## 📋 CHECKLIST SEBELUM REKAM

- [ ] MetaMask sudah punya 0G testnet token
- [ ] Frontend & backend jalan di localhost
- [ ] Database ada data sample (papers + articles)
- [ ] Test upload flow end-to-end sekali sebelum rekam
- [ ] Browser zoom 125-150% supaya teks terbaca di video
- [ ] Close tab & notification yang tidak perlu
- [ ] Screen recorder siap (OBS / Loom / QuickTime)

## 🎯 KEY HIGHLIGHTS UNTUK JURY

1. **4/4 0G Pillars** — Storage, DA, Compute, Chain semua terintegrasi
2. **Signature-Gated AI** — Smart contract sebagai gate sebelum AI jalan (FITUR BARU)
3. **6-Step Pipeline** — Dari upload ke NFT dalam ~40 detik
4. **3 Smart Contracts** — PaperAnchor, ResearchNFT, JournalPayment (deployed & verified)
5. **Multi-Agent AI** — 3 agent parallel: Summarizer, Scorer, Tagger
6. **Real Product** — Bukan prototype, bisa dipakai end-to-end
