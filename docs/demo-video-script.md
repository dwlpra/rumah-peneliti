# Demo Video Script — RumahPeneliti

**Track:** Track 3 — Agentic Economy & Autonomous Applications
**Duration:** ~5 minutes
**Tone:** Clear, technical but accessible, show-don't-tell

---

## Section 1: The Hook (0:00 — 0:30)

**VISUAL: Dark background, text appears with typing animation**

> "What if AI agents could earn money, pay for their own compute, and sustain themselves — without any human paying the bill?"

**NARASI (English)**

"Hi, I'm [NAME], solo developer of RumahPeneliti — an Agent-as-a-Service platform with a self-sustaining Agentic Economy, fully on-chain on 0G Mainnet.

Today I'll show you: AI agents that curate research papers, earn tips from readers, and automatically recycle those tips to fund their own AI inference. A closed-loop agent economy."

**VISUAL: Badge row — 0G Mainnet | Agentic Economy | Agent-as-a-Service | Auto Billing**

---

## Section 2: The Problem (0:30 — 1:00)

**VISUAL: Side-by-side comparison — Traditional Journal vs RumahPeneliti**

"Research papers today have two problems:

**One** — they live on centralized servers. When a journal shuts down, the papers vanish. Years of research, gone.

**Two** — they're boring PDFs. Dense walls of text that nobody wants to read.

But there's a deeper problem with AI platforms today: **AI agents don't have identity, and they don't have an economy.** Someone always has to pay the compute bill. What if agents could pay for themselves?"

---

## Section 3: The Solution — Agent-as-a-Service (1:00 — 1:45)

**VISUAL: Architecture diagram — System Overview from README**

"RumahPeneliti solves this with a self-sustaining Agentic Economy built entirely on 0G.

We have **4 AI agents**, each registered as an NFT on-chain. The AgentNFT contract stores their identity — name, model, capabilities — verifiable on the 0G explorer.

When a researcher uploads a paper, the 6-step pipeline runs:
1. Paper stored on **0G Storage** — permanent, Merkle-verified
2. DA proof published on the **0G DA Layer**
3. Paper anchored on **0G Chain** via PaperAnchor contract
4. **3 AI agents run in parallel** via **0G Compute** — Summarizer, Scorer, Tagger
5. Article hash anchored on-chain
6. Paper minted as NFT — researcher owns their work

Let me show you the live app."

---

## Section 4: Live Demo — Upload Pipeline (1:45 — 2:45)

**VISUAL: Open https://rumahpeneliti.com — dark mode homepage**

"I'll upload a research paper now."

**ACTION: Navigate to Upload page**

**VISUAL: Upload page with form**

**ACTION: Click "Connect Wallet" → MetaMask popup → approve**

"First, I connect my wallet and sign a message — this gates the upload and prevents spam. No centralized login. No password."

**ACTION: Fill form, drag-drop PDF, click "Sign & Upload Paper"**

"Before the AI runs, MetaMask asks for one more signature — explicitly approving AI processing. If the author rejects, nothing happens. The AI agent does NOT run."

**ACTION: Sign → pipeline progress bar appears**

"The 6-step decentralized pipeline kicks in..."

**VISUAL: Pipeline progress — Steps 1 through 6**

"Step 1 — uploading to 0G Storage.
Step 2 — publishing DA proof.
Step 3 — anchoring on-chain.
Step 4 — 3 AI agents run in parallel through 0G Compute. Summarizer creates the article, Scorer rates quality across 4 dimensions, Tagger classifies the domain.
Step 5 — article hash anchored.
Step 6 — NFT minted. Done in about 40 seconds."

**VISUAL: Article page with full AI curation result**

"Here's the result. The boring PDF has been transformed into a readable article — curated title, summary, key takeaways, AI quality score, and tags."

---

## Section 5: Agent Identity — On-Chain Verification (2:45 — 3:15)

**VISUAL: Article page — Agent Identity Card in sidebar**

"Now look at the sidebar. This is the **Agent Identity Card**.

It says: this article was curated by **AI Kurator — Agent NFT #1**. The model is GLM-5-FP8 via 0G Compute."

**ACTION: Click "View Contract" link**

**VISUAL: 0G Explorer — AgentNFT contract, token #1 details**

"Click 'View Contract' — it takes me to the 0G Explorer. I can verify the agent's on-chain metadata: name, description, model, capabilities. All stored on-chain.

Not 'some AI'. A specific, identifiable agent with a blockchain identity. This is what Agent-as-a-Service means — each agent is a verifiable, accountable service provider."

---

## Section 6: The Agentic Economy — Self-Sustaining Loop (3:15 — 4:00)

**VISUAL: Agentic Economy flow diagram**

"Now here's the core innovation — the **Agentic Economy**.

**Step 1: Readers tip agents.** When a reader finds an article valuable, they tip the agent directly."

**ACTION: Navigate to Agents page, click tip button**

**VISUAL: MetaMask popup — send 0.001 0G to AgentTipJar**

"I tip the Scorer agent 0.001 0G. This goes directly to the AgentTipJar contract on-chain. Reader to contract. No backend involved. Transparent."

**VISUAL: On-chain tip transaction on 0G Explorer**

"**Step 2: Auto-recycle.** Before the next AI curation run, the backend automatically sweeps all accumulated tips from the AgentTipJar, and deposits them into the **0G Compute ledger**."

**VISUAL: On-chain withdrawal transaction on 0G Explorer**

"Here's the proof — this transaction withdrew tips from the contract. These funds now pay for the agent's next inference run."

"**Step 3: Self-sustaining loop.** Better curation → more tips → more compute funding → better curation. The agent economy sustains itself. No human needs to pay the AI's compute bill."

---

## Section 7: Financial Rails — Micropayments & Revenue Sharing (4:00 — 4:20)

**VISUAL: Browse page — papers with price badges**

"RumahPeneliti also has full financial rails. Authors set a price in 0G tokens. Readers pay directly to the author via the JournalPayment smart contract — **0% platform cut**."

**VISUAL: Article page — purchase button**

"Free papers allow reader donations. Either way, payment goes directly on-chain from reader to author. No middleman. Author earns, agent earns — both transparent, both on-chain."

---

## Section 8: 0G Integration — All 4 Components (4:20 — 4:45)

**VISUAL: Contract addresses table from README, then switch to 0G Explorer tabs**

"Every 0G component is deeply integrated:

- **0G Storage** — permanent file hosting with Merkle proofs
- **0G Compute** — TEE AI inference. Agent tips are auto-deposited here. Agents fund their own compute.
- **0G DA Layer** — blob commitments for proof-of-existence
- **0G Chain** — 5 smart contracts powering the entire economy

All 5 contracts deployed and verified on 0G Mainnet, Chain ID 16661."

**VISUAL: Quick scroll through 5 contracts on 0G Explorer**

---

## Section 9: Scale & Roadmap (4:45 — 5:00)

**VISUAL: GitHub repo — project structure + stats**

"RumahPeneliti is a full monorepo — Express.js backend with 11 controllers, Next.js 14 frontend with 12 pages, 5 Solidity contracts, Ponder indexer, multi-agent AI pipeline. 39 tests passing. Built by one developer.

Roadmap: Q3 adds agent autonomy with self-custodial wallets, a Journal SDK for integrating with traditional publishers, and on-chain peer review."

---

## Section 10: Closing (5:00 — 5:15)

**VISUAL: Closing slide — key points**

"RumahPeneliti is a working **Agent-as-a-Service** platform with a **self-sustaining Agentic Economy**.

AI agents have on-chain identity. They earn tips. Tips auto-fund their compute. The economy sustains itself.

All on 0G Mainnet. All open source."

**VISUAL: Links**

- Live app: rumahpeneliti.com
- GitHub: github.com/akzmee/rumah-peneliti
- Built for 0G APAC Hackathon 2026 — Track 3: Agentic Economy & Autonomous Applications

---

## Production Notes

| Section | Duration | Key Visual |
|:---|:---:|:---|
| Hook | 30s | Badge animation + tagline |
| Problem | 30s | Side-by-side comparison |
| Solution | 45s | Architecture diagram |
| Upload Demo | 60s | Live upload + pipeline progress |
| Agent Identity | 30s | Agent card → 0G Explorer |
| Agentic Economy | 45s | Tip flow + on-chain withdrawal proof |
| Micropayments | 20s | Purchase/donate UI |
| 0G Integration | 25s | 5 contract explorer links |
| Scale & Roadmap | 15s | GitHub repo + stats |
| Closing | 15s | Summary + links |

---

## Pre-Recording Checklist

- [ ] MetaMask connected with 0G Mainnet tokens (for tipping + upload demo)
- [ ] Frontend & backend running (or use live app at rumahpeneliti.com)
- [ ] Database has sample papers + articles (at least 3 papers)
- [ ] Test full upload flow once before recording
- [ ] Pre-warm: upload a paper 5 min before recording so AI is cached
- [ ] Browser at 1440px width, zoom 125% for readable text
- [ ] Close unnecessary tabs and notifications
- [ ] Screen record at 1080p minimum (OBS / Loom / QuickTime)
- [ ] Prepare backup screenshots of 0G Explorer transactions (in case RPC slow)
- [ ] Dark mode enabled (default in app)

## Key Highlights for Jury

1. **Self-Sustaining Agentic Economy** — agents earn tips → auto-fund 0G Compute → self-sustaining loop
2. **Agent-as-a-Service** — 4 AI agents as on-chain NFTs with verifiable identity
3. **Automated Agent Billing** — tips auto-recycled to Compute ledger, no manual payment
4. **All 4 0G Components** — Storage, Compute, DA Layer, Chain deeply integrated
5. **5 Smart Contracts on Mainnet** — AgentNFT, AgentTipJar, PaperAnchor, ResearchNFT, JournalPayment
6. **Financial Rails** — micropayments with 0% cut, revenue sharing between authors and agents
7. **Real Product** — not a prototype, end-to-end working pipeline with 9 papers curated
