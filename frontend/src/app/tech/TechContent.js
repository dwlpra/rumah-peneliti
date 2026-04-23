"use client";
import { motion } from "framer-motion";
import { Nav, Footer, GlassCard, ScrollReveal } from "@/components/Web3UI";

const EXPLORER = "https://chainscan-galileo.0g.ai";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const contracts = [
  { name: "JournalPayment", icon: "💰", desc: "Micropayment contract for paper purchases. Readers pay directly to authors.", address: "0xF5E23E98a6a93Db2c814a033929F68D5B74445E2", color: "#3b82f6" },
  { name: "PaperAnchor", icon: "⚓", desc: "Anchors paper hashes on-chain. Immutable proof of existence and timestamp.", address: "0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE", color: "#f59e0b" },
  { name: "ResearchNFT (ERC-721)", icon: "🏅", desc: "Gasless NFT minting for verified research papers. Backend-sponsored.", address: "0x5495b92aca76B4414C698f60CdaAD85B364011a1", color: "#8b5cf6" },
];

const services = [
  { name: "0G Storage", icon: "🗄️", status: "ACTIVE", color: "#3b82f6",
    desc: "Decentralized permanent storage with Merkle root verification",
    details: ["SDK: @0gfoundation/0g-ts-sdk v1.2.1", "Indexer: indexer-storage-testnet-turbo.0g.ai", "Root hash stored on-chain & in DB"] },
  { name: "0G DA Layer", icon: "📡", status: "ACTIVE", color: "#8b5cf6",
    desc: "Data availability proof with blob commitment verification",
    details: ["Endpoint: da-testnet.0g.ai", "Blob commitment with KZG proofs", "Guarantees permanent data availability"] },
  { name: "0G Compute", icon: "⚙️", status: "ACTIVE", color: "#10b981",
    desc: "Autonomous AI Research Agent: quality scoring, summarization, chat, and verifiable analysis",
    details: ["Priority: 0G Compute → GLM API → Mock", "Outputs: summary, key takeaways, tags", "Quality assessment with curation hash"] },
  { name: "0G Chain", icon: "🔗", status: "ACTIVE", color: "#f59e0b",
    desc: "Immutable blockchain anchoring on Galileo Testnet",
    details: ["Chain ID: 16602", "RPC: evmrpc-testnet.0g.ai", "3 deployed smart contracts", "Explorer: chainscan-galileo.0g.ai"] },
];

const pipeline = [
  { step: 1, icon: "📤", title: "0G Storage Upload", tech: "0G Storage SDK", desc: "Paper file uploaded to decentralized storage. Merkle root hash generated as integrity proof." },
  { step: 2, icon: "📡", title: "DA Proof Publish", tech: "0G DA Layer", desc: "Data availability proof published with blob commitment. Ensures data persists forever." },
  { step: 3, icon: "⚓", title: "On-Chain Anchor", tech: "PaperAnchor.sol", desc: "Paper metadata hash anchored to 0G blockchain via smart contract. Immutable timestamp proof." },
  { step: 4, icon: "🤖", title: "AI Research Agent", tech: "0G Compute", desc: "AI agent analyzes quality, generates summary, scores research dimensions, and provides conversational Q&A." },
  { step: 5, icon: "📝", title: "Article Anchor", tech: "PaperAnchor.sol", desc: "AI curation hash anchored on-chain. Enables verification of AI output integrity." },
  { step: 6, icon: "🏅", title: "NFT Minting", tech: "ResearchNFT.sol", desc: "Gasless ERC-721 NFT minted as certificate of publication. Backend sponsors all gas fees." },
];

function TechCard({ s, i }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}22`, borderRadius: 14, padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.color}10`, filter: "blur(25px)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
        <div>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>{s.name}</span>
          <span style={{ marginLeft: 8, background: `${s.color}22`, color: s.color, padding: "2px 8px", borderRadius: 8, fontSize: "0.65rem", fontWeight: 700 }}>{s.status}</span>
        </div>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 10 }}>{s.desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {s.details.map((d, j) => (
          <div key={j} style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>• {d}</div>
        ))}
      </div>
    </motion.div>
  );
}

export default function TechPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      <section style={{ textAlign: "center", padding: "clamp(3rem, 8vw, 5rem) clamp(1rem, 3vw, 2rem) clamp(2rem, 4vw, 3rem)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "6px 16px", borderRadius: 20, fontSize: "0.8rem", color: "#10b981", fontWeight: 600, marginBottom: "1rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
            All Systems Operational
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
            Built on <span className="neon-text">0G Network</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
            Full 0G ecosystem integration — Storage, DA Layer, Compute, and Chain. Every component serves a real purpose.
          </p>
        </motion.div>
      </section>

      {/* 0G Services */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center" }}>0G Stack Integration</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {services.map((s, i) => <TechCard key={i} s={s} i={i} />)}
          </div>
        </ScrollReveal>
      </section>

      {/* Pipeline */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center" }}>6-Step Verification Pipeline</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {pipeline.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{
                  display: "grid", gridTemplateColumns: "60px 1fr auto", gap: "1rem", alignItems: "center",
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "1rem 1.2rem",
                }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent-cyan)", marginBottom: 2 }}>STEP {p.step}</div>
                  <div style={{ fontSize: "1.8rem" }}>{p.icon}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{p.desc}</div>
                </div>
                <div style={{ fontSize: "0.7rem", padding: "4px 10px", borderRadius: 8, background: "rgba(139,92,246,0.1)", color: "var(--accent)", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {p.tech}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Smart Contracts */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center" }}>Deployed Smart Contracts</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {contracts.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${c.color}22`, borderRadius: 12, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: "1.5rem" }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 2 }}>{c.desc}</div>
                </div>
                <a href={`${EXPLORER}/address/${c.address}`} target="_blank" rel="noopener"
                  style={{ fontSize: "0.7rem", color: c.color, fontFamily: "monospace", textDecoration: "none", whiteSpace: "nowrap" }}>
                  {c.address.slice(0, 8)}...{c.address.slice(-6)} ↗
                </a>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Indexer */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal>
          <GlassCard neon="purple" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: "1.3rem" }}>📊</span>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>Ponder Blockchain Indexer</span>
              <span style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6", padding: "2px 8px", borderRadius: 8, fontSize: "0.65rem", fontWeight: 700 }}>REALTIME</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 10 }}>
              Real-time event indexing using Ponder v0.7 with PGlite embedded database. All on-chain events from PaperAnchor, ResearchNFT, and JournalPayment contracts are indexed and queryable via GraphQL API.
            </p>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
              • Events indexed: PaperAnchored, ArticleAnchored, ResearchMinted, PaperPurchased<br />
              • Database: PGlite (embedded PostgreSQL)<br />
              • API: GraphQL at /graphql, REST at /api/activity<br />
              • Auto-sync: listens to new blocks in real-time
            </div>
          </GlassCard>
        </ScrollReveal>
      </section>

      <div style={{ marginTop: "3rem" }} />
      <Footer />
    </div>
  );
}
