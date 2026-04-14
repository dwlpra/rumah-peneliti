"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { WalletProvider } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { Nav, Footer } from "@/components/Web3UI";

function HomeContent() {
  const { t } = useLanguage();
  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <section style={{ padding: "5rem 2rem 3rem", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.2rem" }}>
            <span className="neon-text">{t("hero_title_1")}</span><br />
            <span>{t("hero_title_2")}</span>
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {t("hero_subtitle")}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <Link href="/browse"><button className="neon-btn">⟠ {t("btn_explore")}</button></Link>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
}

export default function Home() { return <WalletProvider><HomeContent /></WalletProvider>; }
export { Nav, Footer } from "@/components/Web3UI";
