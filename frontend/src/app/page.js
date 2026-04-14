"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { WalletProvider } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { Nav, Footer, GlassCard, StaggerContainer, StaggerItem, ScrollReveal } from "@/components/Web3UI";

function FeatureCard({ icon, title, desc }) {
  return (
    <StaggerItem>
      <GlassCard style={{ padding: "2rem", cursor: "default" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{icon}</div>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem" }}>{title}</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.7 }}>{desc}</p>
      </GlassCard>
    </StaggerItem>
  );
}

function HomeContent() {
  const { t } = useLanguage();
  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <section style={{ padding: "5rem 2rem 3rem", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1.2rem" }}>
            <span className="neon-text">{t("hero_title_1")}</span><br /><span>{t("hero_title_2")}</span>
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>{t("hero_subtitle")}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <Link href="/browse"><button className="neon-btn">⟠ {t("btn_explore")}</button></Link>
          </div>
        </motion.div>
      </section>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        <ScrollReveal style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>{t("features_title")}</h2>
        </ScrollReveal>
        <StaggerContainer style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <FeatureCard icon="🔗" title={t("feat_decentralized_title")} desc={t("feat_decentralized_desc")} />
          <FeatureCard icon="🤖" title={t("feat_ai_title")} desc={t("feat_ai_desc")} />
          <FeatureCard icon="💰" title={t("feat_payment_title")} desc={t("feat_payment_desc")} />
          <FeatureCard icon="🔒" title={t("feat_verifiable_title")} desc={t("feat_verifiable_desc")} />
        </StaggerContainer>
      </section>
      <Footer />
    </div>
  );
}

export default function Home() { return <WalletProvider><HomeContent /></WalletProvider>; }
export { Nav, Footer } from "@/components/Web3UI";
