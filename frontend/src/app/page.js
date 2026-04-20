"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletProvider } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { Nav, Footer, GlassCard, StaggerContainer, StaggerItem, ScrollReveal, ParticleGrid, AnimatedCounter, EthIcon } from "@/components/Web3UI";

const EXPLORER = "https://chainscan-galileo.0g.ai";

/* ─── Feature Card ─── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <StaggerItem>
      <GlassCard neon="purple" style={{ padding: "2rem", cursor: "default" }}>
        <motion.div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }} animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: delay * 0.3 }}>{icon}</motion.div>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)" }}>{title}</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.7 }}>{desc}</p>
      </GlassCard>
    </StaggerItem>
  );
}

/* ─── Stat Item ─── */
function StatItem({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 800, background: "linear-gradient(135deg, var(--accent-cyan), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        <AnimatedCounter target={value} />
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ─── Paper Card ─── */
function PaperCard({ title, summary, tags, price, href }) {
  const { t } = useLanguage();
  const isFree = price === "FREE";
  return (
    <StaggerItem>
      <Link href={href || "/browse"} style={{ textDecoration: "none", color: "inherit" }}>
        <GlassCard neon={isFree ? "green" : "cyan"}>
          <div style={{ height: 140, background: "linear-gradient(135deg, rgba(0,240,255,0.08), rgba(139,92,246,0.06))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", position: "relative", overflow: "hidden" }}>
            📄
            <div style={{ position: "absolute", top: 12, right: 12 }}>
              <span className={isFree ? "badge-free" : "badge-premium"}>
                {isFree ? t("price_free") : <><EthIcon size={10} />{price}</>}
              </span>
            </div>
          </div>
          <div style={{ padding: "1.2rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6, lineHeight: 1.4, color: "var(--text-primary)" }}>{title}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{summary}</p>
            {tags?.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                {tags.slice(0, 3).map((tg, i) => (
                  <span key={i} style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.12)", padding: "2px 8px", borderRadius: 20, fontSize: "0.72rem", color: "var(--accent-cyan)" }}>#{tg}</span>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </Link>
    </StaggerItem>
  );
}

/* ─── Pipeline Step (How it Works) ─── */
function PipelineStep({ step, icon, title, desc, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "2rem",
        cursor: "default",
      }}
    >
      <div style={{ position: "absolute", top: -12, right: -12, width: 32, height: 32, background: `linear-gradient(135deg, ${color}, ${color}88)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
        {step}
      </div>
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{icon}</div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#fff" }}>{title}</h3>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", lineHeight: 1.7 }}>{desc}</p>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: delay + 0.5 }}
        style={{ height: 3, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 4, marginTop: "1.2rem" }}
      />
    </motion.div>
  );
}

/* ─── 0G Tech Stack Card ─── */
function TechCard({ icon, name, label, desc, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${color}22`,
        borderRadius: 16,
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{icon}</div>
      <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>{name}</h4>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
        <span style={{ color: "#10b981", fontSize: "0.75rem", fontWeight: 600 }}>{label}</span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", lineHeight: 1.6 }}>{desc}</p>
    </motion.div>
  );
}

/* ─── Problem/Solution Card ─── */
function ProblemCard({ problem, solution, desc, icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "2rem",
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{icon}</div>
      <div style={{ color: "#ef4444", fontWeight: 600, fontSize: "0.9rem", marginBottom: 8 }}>❌ {problem}</div>
      <div style={{ color: "#10b981", fontWeight: 600, fontSize: "0.9rem", marginBottom: 12 }}>✅ {solution}</div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", lineHeight: 1.7 }}>{desc}</p>
    </motion.div>
  );
}

/* ─── Contract Badge ─── */
function ContractBadge({ name, address, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}33`,
        borderRadius: 12,
        padding: "1rem 1.2rem",
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, animation: "pulse 2s infinite" }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>{name}</div>
        <a href={`${EXPLORER}/address/${address}`} target="_blank" style={{ color: color, fontSize: "0.75rem", textDecoration: "none", fontFamily: "monospace" }}>
          {address.slice(0, 10)}...{address.slice(-8)} ↗
        </a>
      </div>
    </motion.div>
  );
}

/* ─── Home Content ─── */
function HomeContent() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState(null);

  useEffect(() => {
    import("@/lib/api").then(({ fetchArticles }) => {
      fetchArticles().then(setArticles).catch(() => {});
    });
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/pipeline/status`)
      .then(r => r.json())
      .then(setPipelineStatus)
      .catch(() => {});
  }, []);

  const latestArticles = Array.isArray(articles) ? articles.slice(0, 4) : [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <ParticleGrid />
      <Nav />

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", overflow: "hidden", padding: "clamp(4rem, 10vw, 7rem) clamp(1rem, 3vw, 2rem) clamp(3rem, 6vw, 5rem)", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} style={{ display: "inline-block", background: "rgba(0,240,255,0.06)", border: "1px solid rgba(0,240,255,0.15)", padding: "6px 18px", borderRadius: 20, fontSize: "0.8rem", color: "var(--accent-cyan)", marginBottom: "1.5rem", fontWeight: 600 }}>
            ⟠ {t("hero_badge")}
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} style={{ fontSize: "clamp(2.2rem, 5.5vw, 4rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.2rem", letterSpacing: "-1.5px" }}>
            <span className="neon-text" style={{ animation: "textGlow 3s ease-in-out infinite" }}>{t("hero_title_1")}</span>
            <br />
            <span style={{ color: "var(--text-primary)" }}>{t("hero_title_2")}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }} style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)", color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: 580, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7, padding: "0 0.5rem" }}>
            {t("hero_subtitle")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
              <Link href="/browse" style={{ flex: "1 1 auto", maxWidth: 280, minWidth: 200 }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-btn pulse-glow" style={{ padding: "15px 28px", fontSize: "clamp(0.9rem, 2vw, 1rem)", width: "100%" }}>
                  ⟠ {t("btn_explore")}
                </motion.button>
              </Link>
              <Link href="/pipeline" style={{ flex: "1 1 auto", maxWidth: 280, minWidth: 200 }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-btn pulse-glow" style={{ padding: "15px 28px", fontSize: "clamp(0.9rem, 2vw, 1rem)", width: "100%", background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}>
                  🧪 Try Pipeline
                </motion.button>
              </Link>
              <Link href="/upload" style={{ flex: "1 1 auto", maxWidth: 280, minWidth: 200 }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "15px 28px", background: "transparent", color: "var(--text-primary)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "clamp(0.9rem, 2vw, 1rem)", fontFamily: "inherit", width: "100%", minHeight: 48 }}>
                  📤 {t("btn_upload")}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 0G TECH STACK ═══ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "6px 16px", borderRadius: 20, fontSize: "0.8rem", color: "#10b981", fontWeight: 600, marginBottom: "1rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
            All Systems Operational
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Built on <span className="neon-text">0G Network</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: 600, margin: "0 auto" }}>
            Full decentralized infrastructure — Storage, DA Layer, Compute, and Chain
          </p>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          <TechCard icon="🗄️" name="0G Storage" label="ACTIVE" desc="Decentralized permanent storage with cryptographic Merkle proof" color="#3b82f6" delay={0} />
          <TechCard icon="📡" name="0G DA Layer" label="ACTIVE" desc="Data availability proof with blob commitment verification" color="#8b5cf6" delay={0.1} />
          <TechCard icon="⚙️" name="0G Compute" label="ACTIVE" desc="Verifiable AI processing with TEE attestation for curation" color="#10b981" delay={0.2} />
          <TechCard icon="🔗" name="0G Chain" label="ACTIVE" desc="Immutable blockchain anchoring on Galileo Testnet (ID: 16602)" color="#f59e0b" delay={0.3} />
        </div>
      </section>

      {/* ═══ HOW IT WORKS (6-Step Pipeline) ═══ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            How <span className="neon-text">RumahPeneliti</span> Works
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            6-step automated pipeline from upload to NFT
          </p>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <PipelineStep step={1} icon="📤" title="0G Storage Upload" desc="Paper uploaded to decentralized storage network with Merkle root hash" color="#3b82f6" delay={0} />
          <PipelineStep step={2} icon="📡" title="DA Proof" desc="Data availability proof published with blob commitment on 0G DA layer" color="#8b5cf6" delay={0.1} />
          <PipelineStep step={3} icon="⚓" title="On-Chain Anchor" desc="Paper hash anchored to 0G blockchain via PaperAnchor smart contract" color="#f59e0b" delay={0.2} />
          <PipelineStep step={4} icon="🤖" title="AI Curation" desc="0G Compute generates curated summary with key takeaways and tags" color="#10b981" delay={0.3} />
          <PipelineStep step={5} icon="📝" title="Article Anchor" desc="AI curation hash anchored on-chain for verification" color="#06b6d4" delay={0.4} />
          <PipelineStep step={6} icon="🎭" title="NFT Minting" desc="Gasless ERC-721 NFT minted as proof of publication (backend-sponsored)" color="#6366f1" delay={0.5} />
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/pipeline">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "12px 32px", background: "linear-gradient(135deg, #8b5cf6, #6366f1)", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: "1rem", fontFamily: "inherit" }}>
              🧪 Try Pipeline Demo →
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ═══ PROBLEM / SOLUTION ═══ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Problems We <span style={{ color: "#10b981" }}>Solve</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Transforming academic publishing with blockchain technology
          </p>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.2rem" }}>
          <ProblemCard problem="Expensive Paywalls" solution="Micropayments" desc="Readers pay directly to authors via smart contracts. No middleman, no $50 paper access fees." icon="💰" delay={0} />
          <ProblemCard problem="No Transparency" solution="On-Chain Verification" desc="Every paper hash anchored on 0G blockchain. Peer review process is transparent and auditable." icon="🔍" delay={0.15} />
          <ProblemCard problem="Centralized Control" solution="Decentralized Storage" desc="Papers stored on 0G Storage network — immutable, censorship-resistant, permanently available." icon="🗄️" delay={0.3} />
          <ProblemCard problem="No Author Incentive" solution="NFT Ownership" desc="Each curated paper minted as ERC-721 NFT. Authors own and monetize their research forever." icon="🎭" delay={0.45} />
          <ProblemCard problem="Slow Peer Review" solution="AI Curation" desc="0G Compute provides instant AI-powered summarization with key takeaways and quality assessment." icon="🤖" delay={0.6} />
          <ProblemCard problem="Data Loss Risk" solution="DA Proofs" desc="0G DA Layer guarantees data availability with cryptographic proofs — research never disappears." icon="📡" delay={0.75} />
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            {t("features_title")}
          </h2>
        </ScrollReveal>
        <StaggerContainer style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <FeatureCard icon="🔗" title={t("feat_decentralized_title")} desc={t("feat_decentralized_desc")} delay={0} />
          <FeatureCard icon="🤖" title={t("feat_ai_title")} desc={t("feat_ai_desc")} delay={1} />
          <FeatureCard icon="💰" title={t("feat_payment_title")} desc={t("feat_payment_desc")} delay={2} />
          <FeatureCard icon="🔒" title={t("feat_verifiable_title")} desc={t("feat_verifiable_desc")} delay={3} />
        </StaggerContainer>
      </section>

      {/* ═══ LATEST PAPERS ═══ */}
      {latestArticles.length > 0 && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)" }}>
          <ScrollReveal style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>{t("latest_title")}</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 4 }}>{t("latest_subtitle")}</p>
            </div>
            <Link href="/browse" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>
              View All →
            </Link>
          </ScrollReveal>
          <StaggerContainer style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {latestArticles.map((a, i) => (
              <PaperCard key={a.id || i}
                title={a.curated_title || a.paper_title || "Untitled"}
                summary={a.summary || ""}
                tags={a.tags || []}
                price={a.price_wei ? `${(Number(a.price_wei) / 1e18).toFixed(4)} ETH` : "FREE"}
                href={`/article/${a.paper_id || a.id}`}
              />
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* ═══ SMART CONTRACTS ═══ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Smart <span className="neon-text">Contracts</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Deployed on 0G Galileo Testnet (Chain ID: 16602)
          </p>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
          <ContractBadge name="📄 JournalPayment" address="0xF5E23E98a6a93Db2c814a033929F68D5B74445E2" color="#3b82f6" />
          <ContractBadge name="⚓ PaperAnchor" address="0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE" color="#f59e0b" />
          <ContractBadge name="🎭 ResearchNFT (ERC-721)" address="0x5495b92aca76B4414C698f60CdaAD85B364011a1" color="#8b5cf6" />
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal>
          <GlassCard neon="cyan" style={{ padding: "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1.5rem" }}>
            <StatItem value="3" label="Smart Contracts" />
            <StatItem value="6" label="Pipeline Steps" />
            <StatItem value="4" label="0G Services" />
            <StatItem value="0" label="Gas (Sponsored)" />
          </GlassCard>
        </ScrollReveal>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)", textAlign: "center" }}>
        <ScrollReveal>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1rem" }}>
            Ready to Publish <span className="neon-text">On-Chain</span>?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.7 }}>
            Upload your research paper and let our 6-step pipeline handle everything — from decentralized storage to NFT minting. Gasless.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/pipeline">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-btn pulse-glow" style={{ padding: "14px 32px", fontSize: "1rem" }}>
                🧪 Start Pipeline
              </motion.button>
            </Link>
            <Link href="/upload">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "14px 32px", background: "transparent", color: "#fff", border: "1px solid rgba(0,240,255,0.3)", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "1rem", fontFamily: "inherit" }}>
                📤 Upload Paper
              </motion.button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}

export default function Home() {
  return <WalletProvider><HomeContent /></WalletProvider>;
}

export { Nav, Footer } from "@/components/Web3UI";
