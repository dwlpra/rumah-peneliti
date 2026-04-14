"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WalletProvider } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { Nav, Footer, GlassCard, StaggerContainer, StaggerItem, ScrollReveal, ParticleGrid, AnimatedCounter, EthIcon } from "@/components/Web3UI";

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

function HomeContent() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    import("@/lib/api").then(({ fetchArticles }) => {
      fetchArticles().then(setArticles).catch(() => {});
    });
  }, []);

  const latestArticles = Array.isArray(articles) ? articles.slice(0, 4) : [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <ParticleGrid />
      <Nav />

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
              <Link href="/upload" style={{ flex: "1 1 auto", maxWidth: 280, minWidth: 200 }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "15px 28px", background: "transparent", color: "var(--text-primary)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "clamp(0.9rem, 2vw, 1rem)", fontFamily: "inherit", width: "100%", minHeight: 48 }}>
                  📤 {t("btn_upload")}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
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

      {/* Latest Papers */}
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

      {/* Stats */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal>
          <GlassCard neon="cyan" style={{ padding: "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1.5rem" }}>
            <StatItem value="150+" label={t("stats_papers")} />
            <StatItem value="340+" label={t("stats_articles")} />
            <StatItem value="2.4K" label={t("stats_readers")} />
            <StatItem value="12" label="Institutions" />
          </GlassCard>
        </ScrollReveal>
      </section>

      {/* Rewards */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
            Earn <span className="neon-text">Rewards</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.2rem" }}>
            {[
              { title: t("nav_upload") + " Paper", reward: "50 RP", progress: 72, color: "var(--accent-cyan)" },
              { title: "AI Curation Bonus", reward: "25 RP", progress: 45, color: "var(--accent)" },
              { title: "Reader Tips", reward: "Variable", progress: 88, color: "#00FF88" },
            ].map((b, i) => (
              <GlassCard key={i} neon={i === 0 ? "cyan" : i === 1 ? "purple" : "green"} style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{b.title}</span>
                  <span className="neon-text" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{b.reward}</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, height: 6, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${b.progress}%` }} transition={{ duration: 1.5, delay: 0.3 }} viewport={{ once: true }} style={{ height: "100%", background: `linear-gradient(90deg, ${b.color}, ${b.color}88)`, borderRadius: 8, boxShadow: `0 0 10px ${b.color}44` }} />
                </div>
              </GlassCard>
            ))}
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
