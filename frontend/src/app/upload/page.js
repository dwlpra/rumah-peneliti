"use client";
import { useState, useRef } from "react";
import { WalletProvider, useWallet } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { Nav, Footer } from "@/app/page";

function UploadForm() {
  const { t } = useLanguage();
  const { address } = useWallet();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "2.5rem 2rem 4rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>{t("upload_title")}</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>{t("upload_subtitle")}</p>
        <form style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <input type="text" placeholder={t("label_title")} value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: "12px 16px", background: "var(--bg-card-solid)", border: "1px solid rgba(139,92,246,0.1)", borderRadius: 8, color: "var(--text-primary)", fontSize: "0.95rem", width: "100%" }} />
          <button type="submit" className="neon-btn">📤 {t("btn_submit")}</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default function UploadPage() { return <WalletProvider><UploadForm /></WalletProvider>; }
