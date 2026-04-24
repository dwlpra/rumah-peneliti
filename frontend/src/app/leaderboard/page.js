"use client";
import { getApiUrl } from "@/lib/api-url";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav, Footer } from "@/app/page";
import { WalletProvider } from "@/lib/wallet";

const API = () => getApiUrl();

function LeaderboardContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("authors");

  useEffect(() => {
    fetch(`${API()}/api/leaderboard`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading leaderboard...</p>
      </div>
      <Footer />
    </div>
  );

  const { topAuthors, topPapers, verified } = data || {};

  const medalEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem) 4rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
          🏆 <span style={{ color: "var(--accent)" }}>Leaderboard</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Top contributors and research papers</p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: "2rem", flexWrap: "wrap" }}>
          {[
            { key: "authors", label: "👥 Top Authors" },
            { key: "papers", label: "📊 Top Papers (AI Score)" },
            { key: "verified", label: "✅ Verified Papers" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "10px 20px",
              background: tab === t.key ? "linear-gradient(135deg, var(--accent), #6D28D9)" : "var(--bg-card-solid)",
              color: tab === t.key ? "#fff" : "#94A3B8",
              border: tab === t.key ? "none" : "1px solid rgba(139,92,246,0.1)",
              borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
              transition: "all 0.2s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Top Authors */}
        {tab === "authors" && (
          <div style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)", overflow: "hidden" }}>
            {(topAuthors?.length > 0 ? topAuthors : [
              { name: "Dr. Sarah Chen, Marcus Williams", wallet: "0x1234567890abcdef1234567890abcdef12345678", papers: 5 },
              { name: "Dr. James Park", wallet: "0xabcdef1234567890abcdef1234567890abcdef12", papers: 3 },
              { name: "0G Researcher", wallet: "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55", papers: 2 },
            ]).map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "1rem 1.5rem",
                borderBottom: "1px solid rgba(139,92,246,0.05)",
                background: i < 3 ? `rgba(139,92,246,${0.03 - i * 0.01})` : "transparent",
              }}>
                <span style={{ fontSize: i < 3 ? "1.5rem" : "0.9rem", fontWeight: 700, width: 48, textAlign: "center" }}>
                  {medalEmoji(i)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                    {a.name?.split(",")[0] || "Anonymous"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {a.wallet?.slice(0, 10)}...{a.wallet?.slice(-6)}
                  </div>
                </div>
                <div style={{
                  background: "rgba(139,92,246,0.12)", color: "var(--accent)",
                  padding: "6px 16px", borderRadius: 20, fontSize: "0.85rem", fontWeight: 700,
                }}>
                  {a.papers} 📄
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Papers by AI Score */}
        {tab === "papers" && (
          <div style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)", overflow: "hidden" }}>
            {(topPapers?.length > 0 ? topPapers : []).map((p, i) => (
              <Link key={i} href={`/article/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "1rem 1.5rem",
                  borderBottom: "1px solid rgba(139,92,246,0.05)",
                }}>
                  <span style={{ fontSize: i < 3 ? "1.5rem" : "0.9rem", fontWeight: 700, width: 48, textAlign: "center" }}>
                    {medalEmoji(i)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{p.title?.slice(0, 60)}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{p.authors?.split(",")[0]}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fbbf24" }}>
                      {p.ai_score?.overall ? `${(p.ai_score.overall * 10).toFixed(1)}` : "—"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>AI Score</div>
                  </div>
                </div>
              </Link>
            ))}
            {(!topPapers || topPapers.length === 0) && (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)" }}>AI scores will appear once papers are curated</p>
              </div>
            )}
          </div>
        )}

        {/* Verified Papers */}
        {tab === "verified" && (
          <div style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)", overflow: "hidden" }}>
            {(verified?.length > 0 ? verified : []).map((p, i) => (
              <Link key={i} href={`/article/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "1rem 1.5rem",
                  borderBottom: "1px solid rgba(139,92,246,0.05)",
                }}>
                  <span style={{ fontSize: "1.2rem" }}>✅</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{p.title?.slice(0, 60)}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      🔗 {p.storage_hash?.slice(0, 16)}...
                    </div>
                  </div>
                  <span style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600 }}>View →</span>
                </div>
              </Link>
            ))}
            {(!verified || verified.length === 0) && (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)" }}>Verified papers will appear here after on-chain anchoring</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function LeaderboardPage() {
  return <WalletProvider><LeaderboardContent /></WalletProvider>;
}
