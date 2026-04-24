"use client";
import { getApiUrl } from "@/lib/api-url";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Nav, Footer } from "@/app/page";
import { WalletProvider } from "@/lib/wallet";

const API = () => getApiUrl();

function AnalyticsContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API()}/api/analytics/dashboard`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📊</div>
        <p style={{ color: "var(--text-secondary)" }}>Loading analytics...</p>
      </div>
      <Footer />
    </div>
  );

  const { stats, chart, topAuthors, recentPapers, recentArticles, difficulties } = data || {};
  const maxChart = Math.max(...(chart?.map(c => c.papers) || [1]), 1);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem) 4rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
          📊 Platform <span style={{ color: "var(--accent)" }}>Analytics</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Real-time insights into RumahPeneliti</p>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { label: "Papers", value: stats?.papers || 0, icon: "📄", color: "#8b5cf6" },
            { label: "AI Articles", value: stats?.articles || 0, icon: "📖", color: "#06b6d4" },
            { label: "Purchases", value: stats?.purchases || 0, icon: "💰", color: "#22c55e" },
            { label: "Anchored", value: stats?.papers || 0, icon: "⛓️", color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-card-solid)", borderRadius: 12,
              border: `1px solid ${s.color}22`, padding: "1.5rem",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = `${s.color}44`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = `${s.color}22`; }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Top Authors side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          {/* Activity Chart */}
          <div style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>📈 Papers (Last 7 Days)</h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 180 }}>
              {chart?.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent)" }}>{d.papers}</span>
                  <div style={{
                    width: "100%", borderRadius: "6px 6px 0 0",
                    background: `linear-gradient(180deg, var(--accent), rgba(139,92,246,0.3))`,
                    height: Math.max((d.papers / maxChart) * 140, 4),
                    transition: "height 0.5s ease",
                    minHeight: 4,
                  }} />
                  <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.2 }}>
                    {d.label.split(",")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Authors */}
          <div style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🏆 Top Authors</h3>
            {(topAuthors?.length > 0 ? topAuthors : [
              { wallet: "0x7Aef...Af55", name: "Demo Author", count: 13 },
              { wallet: "0x1234...5678", name: "Dr. Sarah Chen", count: 2 },
            ]).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(139,92,246,0.05)" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#cd7f32", width: 28 }}>
                  #{i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {a.name?.split(",")[0] || `${a.wallet?.slice(0, 6)}...${a.wallet?.slice(-4)}`}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {a.wallet?.slice(0, 10)}...
                  </div>
                </div>
                <span style={{
                  background: "rgba(139,92,246,0.12)", color: "var(--accent)",
                  padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700,
                }}>
                  {a.count} 📄
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Distribution + Recent Activity */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
          {/* Difficulty */}
          <div style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>📊 Difficulty Distribution</h3>
            {["beginner", "intermediate", "advanced"].map(d => {
              const count = difficulties?.[d] || 0;
              const total = Object.values(difficulties || {}).reduce((a, b) => a + b, 0) || 1;
              const pct = (count / total) * 100;
              const colors = { beginner: "#22c55e", intermediate: "#eab308", advanced: "#ef4444" };
              return (
                <div key={d} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", textTransform: "capitalize" }}>{d}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: colors[d], borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>⚡ Recent Activity</h3>
            {recentPapers?.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(139,92,246,0.05)", alignItems: "center" }}>
                <span style={{ fontSize: "1rem" }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{p.title?.slice(0, 40)}...</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{p.upload_date}</div>
                </div>
              </div>
            ))}
            {recentArticles?.slice(0, 3).map((a, i) => (
              <div key={`a${i}`} style={{ display: "flex", gap: 10, padding: "8px 0", alignItems: "center" }}>
                <span style={{ fontSize: "1rem" }}>📖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{a.curated_title?.slice(0, 40)}...</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>AI Curated • {a.created_date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function AnalyticsPage() {
  return <WalletProvider><AnalyticsContent /></WalletProvider>;
}
