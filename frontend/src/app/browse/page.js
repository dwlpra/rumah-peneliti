"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { WalletProvider } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { Nav, Footer } from "@/app/page";

function BrowseContent() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("articles");

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem" }}>
          {t("browse_title")} <span style={{ color: "var(--accent)" }}>{t("browse_subtitle")}</span>
        </h1>
        <div style={{ display: "flex", gap: 8, marginBottom: "2rem" }}>
          <button onClick={() => setTab("articles")} style={{ padding: "10px 24px", background: tab === "articles" ? "linear-gradient(135deg, var(--accent), #6D28D9)" : "var(--bg-card-solid)", color: tab === "articles" ? "#fff" : "#94A3B8", border: tab === "articles" ? "none" : "1px solid rgba(139,92,246,0.1)", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            📖 {t("tab_articles")}
          </button>
          <button onClick={() => setTab("papers")} style={{ padding: "10px 24px", background: tab === "papers" ? "linear-gradient(135deg, var(--accent), #6D28D9)" : "var(--bg-card-solid)", color: tab === "papers" ? "#fff" : "#94A3B8", border: tab === "papers" ? "none" : "1px solid rgba(139,92,246,0.1)", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            📄 {t("tab_papers")}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function BrowsePage() { return <WalletProvider><BrowseContent /></WalletProvider>; }
