"use client";
import { getApiUrl } from "@/lib/api-url";
import { useState, useEffect } from "react";
import Link from "next/link";
import { WalletProvider, useWallet } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { fetchPapers, fetchArticles } from "@/lib/api";
import { Nav, Footer } from "@/app/page";

const API = () => getApiUrl();

const CATEGORIES = ["All", "blockchain", "machine-learning", "security", "storage", "smart-contracts", "web3", "defi", "nft", "cryptography", "consensus"];

function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null;
  const colors = {
    beginner: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", icon: "🟢" },
    intermediate: { bg: "rgba(234,179,8,0.15)", color: "#eab308", icon: "🟡" },
    advanced: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", icon: "🔴" },
  };
  const c = colors[difficulty] || colors.intermediate;
  return (
    <span style={{ background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 600 }}>
      {c.icon} {difficulty}
    </span>
  );
}

function BrowseContent() {
  const { t } = useLanguage();
  const { address } = useWallet();
  const [articles, setArticles] = useState([]);
  const [papers, setPapers] = useState([]);
  const [tab, setTab] = useState("articles");
  const [search, setSearch] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchPapers(), fetchArticles()])
      .then(([pData, aData]) => {
        setPapers(Array.isArray(pData) ? pData : pData?.papers || []);
        setArticles(Array.isArray(aData) ? aData : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Client-side filtering (papers now come as {papers,total,page,limit} or array)
  const paperList = Array.isArray(papers) ? papers : (papers.papers || []);

  const filteredArticles = articles.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (a.curated_title || "").toLowerCase().includes(q) ||
           (a.summary || "").toLowerCase().includes(q) ||
           (a.tags || []).some((tg) => tg.toLowerCase().includes(q));
  });

  const filteredPapers = paperList.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.title || "").toLowerCase().includes(q) ||
           (p.authors || "").toLowerCase().includes(q);
  });

  // Sort papers
  const sortedPapers = [...filteredPapers].sort((a, b) => {
    if (sort === "oldest") return new Date(a.upload_date) - new Date(b.upload_date);
    if (sort === "title") return (a.title || "").localeCompare(b.title || "");
    return new Date(b.upload_date) - new Date(a.upload_date); // newest
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem) 4rem" }}>
        <h1 className="animate-fade-in" style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
          {t("browse_title")} <span style={{ color: "var(--accent)" }}>{t("browse_subtitle")}</span>
        </h1>
        <p className="animate-fade-in" style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          {t("search_placeholder")}
        </p>

        {/* Search + Filters */}
        <div className="animate-fade-in" style={{ marginBottom: "1rem", position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem" }}>🔍</span>
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "14px 16px 14px 44px",
              background: "var(--bg-card-solid)", border: "1px solid rgba(139,92,246,0.1)",
              borderRadius: 12, color: "var(--text-primary)", fontSize: "0.95rem",
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "rgba(139,92,246,0.3)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(139,92,246,0.1)"}
          />
        </div>

        {/* Category + Sort row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600,
                background: category === cat ? "linear-gradient(135deg, var(--accent), #6D28D9)" : "var(--bg-card-solid)",
                color: category === cat ? "#fff" : "#94A3B8",
                border: category === cat ? "none" : "1px solid rgba(139,92,246,0.1)",
                cursor: "pointer", transition: "all 0.2s",
              }}>
                {cat === "All" ? "🌐 All" : `#${cat}`}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            padding: "8px 12px", borderRadius: 8, background: "var(--bg-card-solid)",
            border: "1px solid rgba(139,92,246,0.1)", color: "var(--text-primary)",
            fontSize: "0.85rem", cursor: "pointer",
          }}>
            <option value="newest">🕐 Newest</option>
            <option value="oldest">🕐 Oldest</option>
            <option value="title">🔤 Title A-Z</option>
          </select>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: "2rem" }}>
          {["articles", "papers"].map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} style={{
              padding: "10px 24px",
              background: tab === tb ? "linear-gradient(135deg, var(--accent), #6D28D9)" : "var(--bg-card-solid)",
              color: tab === tb ? "#fff" : "#94A3B8",
              border: tab === tb ? "none" : "1px solid rgba(139,92,246,0.1)",
              borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
              transition: "all 0.2s",
            }}>
              {tb === "articles" ? `📖 ${t("tab_articles")} (${filteredArticles.length})` : `📄 ${t("tab_papers")} (${sortedPapers.length})`}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.2rem" }}>
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} style={{ background: "var(--bg-card-solid)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)" }}>
                <div style={{ height: 120, background: "linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                <div style={{ padding: "1.2rem" }}>
                  <div style={{ width: 80, height: 18, borderRadius: 10, marginBottom: 10, background: "rgba(139,92,246,0.06)" }} />
                  <div style={{ width: "100%", height: 16, borderRadius: 4, marginBottom: 8, background: "var(--bg-card-hover)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p style={{ color: "#f87171" }}>Error: {error}</p>}

        {/* Articles Grid */}
        {tab === "articles" && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.2rem" }}>
            {filteredArticles.map((a, i) => (
              <Link key={a.id || i} href={`/article/${a.paper_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  background: "var(--bg-card-solid)",
                  borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)",
                  overflow: "hidden", transition: "all 0.25s ease",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(139,92,246,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ height: 120, background: `linear-gradient(135deg, rgba(139,92,246,${0.08 + (i % 3) * 0.04}), rgba(6,182,212,${0.04 + (i % 3) * 0.03}))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>📖</div>
                  <div style={{ padding: "1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
                      <span style={{
                        background: a.price_wei ? "rgba(139,92,246,0.12)" : "rgba(34,197,94,0.12)",
                        color: a.price_wei ? "#A78BFA" : "#22c55e",
                        padding: "2px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
                      }}>
                        {a.price_wei ? `${(Number(a.price_wei) / 1e18).toFixed(4)} 0G` : t("price_free")}
                      </span>
                      {a.classification?.difficulty && <DifficultyBadge difficulty={a.classification.difficulty} />}
                      {a.nft_token_id && (
                        <span style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6", padding: "2px 8px", borderRadius: 10, fontSize: "0.65rem", fontWeight: 700 }}>🏅 NFT</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 6, lineHeight: 1.4, color: "var(--text-primary)" }}>{a.curated_title}</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 10 }}>{a.summary}</p>
                    {a.tags?.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                        {a.tags.slice(0, 3).map((tg, j) => (
                          <span key={j} style={{ background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: 20, fontSize: "0.72rem", color: "var(--accent)" }}>#{tg}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{a.authors ? `👤 ${a.authors.split(",")[0]}` : ""}</span>
                      <span style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600 }}>{t("btn_read")} →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {filteredArticles.length === 0 && !loading && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>No curated articles found</p>
                <p style={{ fontSize: "0.85rem", marginBottom: 16 }}>Upload a paper and run the pipeline to generate curated articles.</p>
                <Link href="/upload" style={{ color: "var(--accent)", textDecoration: "none", padding: "10px 24px", background: "rgba(139,92,246,0.1)", borderRadius: 10, fontWeight: 600, fontSize: "0.9rem", border: "1px solid rgba(139,92,246,0.2)" }}>📤 Upload Paper</Link>
              </div>
            )}
          </div>
        )}

        {/* Papers Grid */}
        {tab === "papers" && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.2rem" }}>
            {sortedPapers.map((p, i) => (
              <Link key={p.id || i} href={`/article/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  background: "var(--bg-card-solid)",
                  borderRadius: 12, border: "1px solid rgba(139,92,246,0.08)",
                  overflow: "hidden", transition: "all 0.25s ease",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(139,92,246,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(139,92,46,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ height: 120, background: `linear-gradient(135deg, rgba(6,182,212,${0.08 + (i % 3) * 0.04}), rgba(139,92,246,${0.04 + (i % 3) * 0.03}))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>📄</div>
                  <div style={{ padding: "1.2rem" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ background: "rgba(139,92,246,0.12)", color: "var(--accent)", padding: "2px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>
                        💰 {(Number(p.price_wei) / 1e18).toFixed(4)} 0G
                      </span>
                      {p.classification?.difficulty && <DifficultyBadge difficulty={p.classification.difficulty} />}
                    </div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 6, lineHeight: 1.4, color: "var(--text-primary)" }}>{p.title}</h3>
                    {p.authors && <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 8 }}>👤 {p.authors}</p>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{new Date(p.upload_date).toLocaleDateString("en-US")}</span>
                      <span style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600 }}>{t("btn_read")} →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {sortedPapers.length === 0 && !loading && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>No papers found</p>
                <p style={{ fontSize: "0.85rem", marginBottom: 16 }}>Be the first to upload your research paper.</p>
                <Link href="/upload" style={{ color: "var(--accent)", textDecoration: "none", padding: "10px 24px", background: "rgba(139,92,246,0.1)", borderRadius: 10, fontWeight: 600, fontSize: "0.9rem", border: "1px solid rgba(139,92,246,0.2)" }}>📤 Upload Paper</Link>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function BrowsePage() {
  return <WalletProvider><BrowseContent /></WalletProvider>;
}
