"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { WalletProvider, useWallet } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { fetchArticle, fetchPaper, checkAccess } from "@/lib/api";
import { Nav, Footer } from "@/app/page";

function ArticleContent() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { address, connect } = useWallet();
  const [article, setArticle] = useState(null);
  const [paper, setPaper] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchArticle(id), fetchPaper(id)])
      .then(([a, p]) => { setArticle(a); setPaper(p); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (id && address) {
      checkAccess(id, address).then((res) => { if (res.hasAccess) setUnlocked(true); }).catch(() => {});
    }
  }, [id, address]);

  const handleUnlock = async () => {
    if (!window.ethereum) { alert("Please install MetaMask first!"); return; }
    if (!address) { await connect(); return; }
    setPaying(true);
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xF5E23E98a6a93Db2c814a033929F68D5B74445E2";
      const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "16602");

      // Switch to 0G testnet if needed
      const currentChain = await window.ethereum.request({ method: "eth_chainId" });
      if (parseInt(currentChain, 16) !== chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: `0x${chainId.toString(16)}`,
                chainName: "0G Galileo Testnet",
                nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
                rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || "https://evmrpc-testnet.0g.ai"],
                blockExplorerUrls: ["https://chainscan-galileo.0g.ai"],
              }],
            });
          } else throw switchError;
        }
      }

      // Call purchasePaper(uint256) on the contract
      const priceWei = paper?.price_wei || "1000000000000000";
      // Function signature: purchasePaper(uint256) = 0x6047a3d7 + padded paperId
      const paperIdParam = BigInt(id).toString(16).padStart(64, "0");
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to: contractAddress,
          data: `0x6047a3d7${paperIdParam}`,
          value: `0x${BigInt(priceWei).toString(16)}`,
        }],
      });

      // Record purchase in backend
      const { purchasePaper } = await import("@/lib/api");
      await purchasePaper(id, address, txHash, priceWei);
      setUnlocked(true);
    } catch (e) {
      console.error("Payment error:", e);
      if (e.code === 4001) { /* user rejected */ }
      else { alert("Payment failed: " + (e.message || "Unknown error")); }
    }
    setPaying(false);
  };

  if (loading) return (
    <div><Nav /><div style={{ textAlign: "center", padding: "6rem 2rem" }}><div style={{ fontSize: "2rem", marginBottom: "1rem", animation: "pulse 1.5s ease-in-out infinite" }}>⏳</div><p style={{ color: "var(--text-muted)" }}>Loading...</p></div></div>
  );

  if (error || !article) return (
    <div><Nav /><div style={{ maxWidth: 800, margin: "4rem auto", padding: "0 2rem", textAlign: "center" }}><div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div><p style={{ color: "#f87171", marginBottom: "1rem" }}>{error || "Article not available yet."}</p><Link href="/browse" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>← {t("nav_browse")}</Link></div></div>
  );

  const priceEth = paper ? (Number(paper.price_wei) / 1e18).toFixed(4) : "0.001";
  const bodyParagraphs = (article.body || "").split("\n\n").filter(Boolean);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      <div className="article-layout" style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)", display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        <main className="animate-fade-in" style={{ minWidth: 0 }}>
          <Link href="/browse" style={{ color: "var(--accent)", fontSize: "0.9rem", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>← {t("nav_browse")}</Link>

          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, marginTop: "1.2rem", lineHeight: 1.25, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>{article.curated_title}</h1>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: "1rem", flexWrap: "wrap" }}>
            {paper?.authors && <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>👤 {paper.authors}</span>}
            {paper?.upload_date && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>📅 {new Date(paper.upload_date).toLocaleDateString("en-US")}</span>}
          </div>

          {article.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: "1rem", flexWrap: "wrap" }}>
              {article.tags.map((tg, i) => (<span key={i} style={{ background: "rgba(139,92,246,0.1)", padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem", color: "var(--accent)", fontWeight: 500 }}>#{tg}</span>))}
            </div>
          )}

          {/* Summary */}
          <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.05))", padding: "1.5rem", borderRadius: 12, marginTop: "2rem", border: "1px solid rgba(139,92,246,0.12)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--accent)", marginBottom: "0.75rem" }}>📋 {t("article_summary")}</div>
            <p style={{ lineHeight: 1.8, color: "var(--text-primary)", fontSize: "0.95rem" }}>{article.summary}</p>
          </div>

          {/* Key Takeaways */}
          {article.key_takeaways?.length > 0 && (
            <div style={{ background: "var(--bg-card-solid)", padding: "1.5rem", borderRadius: 12, marginTop: "1.5rem", border: "1px solid rgba(139,92,246,0.08)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--accent-cyan)", marginBottom: "1rem" }}>💡 {t("article_takeaways")}</div>
              {article.key_takeaways.map((tk, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--accent-green)", fontSize: "0.9rem", marginTop: 2, flexShrink: 0 }}>✅</span>
                  <span style={{ color: "var(--text-primary)", lineHeight: 1.7, fontSize: "0.95rem" }}>{tk}</span>
                </div>
              ))}
            </div>
          )}

          {/* Body or Paywall */}
          {unlocked ? (
            <div style={{ marginTop: "2rem" }}>
              {bodyParagraphs.length > 0 ? bodyParagraphs.map((para, i) => (
                <p key={i} style={{ marginBottom: "1.2rem", color: "var(--text-primary)", lineHeight: 1.9, fontSize: "1.02rem" }}>{para}</p>
              )) : <p style={{ color: "var(--text-muted)" }}>Full article not available yet.</p>}
            </div>
          ) : (
            <div style={{ marginTop: "2rem", position: "relative", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none", opacity: 0.4, maxHeight: 300, overflow: "hidden" }}>
                {bodyParagraphs.slice(0, 3).map((para, i) => (<p key={i} style={{ marginBottom: "1rem", color: "var(--text-primary)", lineHeight: 1.9, padding: "0 2rem" }}>{para}</p>))}
              </div>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent, var(--bg-primary) 40%, var(--bg-primary))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
                <p style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>{t("paywall_title")}</p>
                <p style={{ color: "var(--accent)", fontWeight: 800, fontSize: "1.5rem", marginBottom: "1.5rem" }}>{priceEth} ETH</p>
                <button onClick={handleUnlock} disabled={paying} style={{
                  padding: "14px 36px", background: paying ? "var(--text-dim)" : "linear-gradient(135deg, var(--accent), #6D28D9)",
                  color: "#fff", border: "none", borderRadius: 8, cursor: paying ? "not-allowed" : "pointer",
                  fontWeight: 700, fontSize: "1rem", transition: "all 0.2s",
                  boxShadow: paying ? "none" : "0 4px 20px rgba(139,92,246,0.3)",
                }}>
                  {paying ? "⏳ Processing..." : !address ? `🦊 ${t("connect_wallet")}` : `🔓 ${t("btn_unlock")} (${priceEth} ETH)`}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="animate-fade-in animate-fade-in-delay-2" style={{ position: "relative", top: "auto", alignSelf: "auto" }}>
          <div style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--accent)", marginBottom: "1rem" }}>Paper Info</div>
            {article.paper_title && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 4 }}>{t("article_original")}</div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.5, fontStyle: "italic" }}>{article.paper_title}</p>
              </div>
            )}
            {paper?.authors && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 4 }}>{t("label_authors")}</div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{paper.authors}</p>
              </div>
            )}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 4 }}>{t("article_price")}</div>
              <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent)" }}>{priceEth} ETH</p>
            </div>
            <div style={{ padding: "0.75rem", borderRadius: 8, background: unlocked ? "rgba(34,197,94,0.1)" : "rgba(139,92,246,0.08)", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: unlocked ? "#22c55e" : "#94A3B8" }}>
              {unlocked ? "✅ Unlocked" : "🔒 Locked"}
            </div>
          </div>

          {article.tags?.length > 0 && (
            <div style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)", padding: "1.5rem", marginTop: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Tags</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {article.tags.map((tg, i) => (<span key={i} style={{ background: "rgba(139,92,246,0.1)", padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem", color: "var(--accent)" }}>#{tg}</span>))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <Footer />
    </div>
  );
}

export default function ArticlePage() {
  return <WalletProvider><ArticleContent /></WalletProvider>;
}
