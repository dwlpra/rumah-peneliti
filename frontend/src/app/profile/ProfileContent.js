"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Nav, Footer, GlassCard, ScrollReveal } from "@/components/Web3UI";
import { useWallet } from "@/lib/wallet";

const EXPLORER = "https://chainscan-galileo.0g.ai";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function StatBox({ label, value, icon, color }) {
  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ActivityRow({ item, index }) {
  const isNft = item.type === "nft";
  const date = item.timestamp ? new Date(item.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10, padding: "0.75rem 1rem",
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{isNft ? "🏅" : "📌"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
          {isNft ? `NFT #${item.tokenId} Minted` : `Paper #${item.paperId} Anchored`}
          <span style={{ marginLeft: 8, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 8,
            background: isNft ? "rgba(139,92,246,0.15)" : "rgba(245,158,11,0.15)",
            color: isNft ? "#8b5cf6" : "#f59e0b", fontWeight: 700
          }}>{isNft ? "ERC-721" : "ANCHOR"}</span>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>
          Block #{item.blockNumber} • {date}
        </div>
      </div>
      <a href={`${EXPLORER}/tx/${item.txHash}`} target="_blank" rel="noopener"
        style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", textDecoration: "none", fontFamily: "monospace" }}>
        {item.txHash?.slice(0, 8)}... ↗
      </a>
    </motion.div>
  );
}

export default function ProfileContent() {
  const { address, connect } = useWallet();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`${API}/api/profile/${address}`)
      .then(r => r.json())
      .then(d => { setProfile(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [address]);

  if (!address) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Nav />
        <div style={{ maxWidth: 500, margin: "8rem auto", textAlign: "center", padding: "0 2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👤</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Connect Your Wallet</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Connect your wallet to view your research profile, owned NFTs, and on-chain activity.
          </p>
          <button onClick={connect} className="neon-btn pulse-glow"
            style={{ padding: "12px 32px", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "1rem", fontFamily: "inherit" }}>
            🦊 Connect Wallet
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = profile?.stats || { papersAuthored: 0, papersPurchased: 0, nftsMinted: 0, totalAnchors: 0 };
  const allActivity = [
    ...(profile?.onChain?.anchors || []).map(a => ({ ...a, type: "anchor" })),
    ...(profile?.onChain?.nfts || []).map(n => ({ ...n, type: "nft" })),
  ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      {/* Header */}
      <section style={{ textAlign: "center", padding: "clamp(3rem, 8vw, 5rem) clamp(1rem, 3vw, 2rem) clamp(2rem, 4vw, 3rem)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👤</div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
            Research Profile
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "monospace" }}>
            {address.slice(0, 10)}...{address.slice(-8)}
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "0 clamp(1rem, 3vw, 2rem) 2rem" }}>
        <ScrollReveal>
          <GlassCard neon="cyan" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.5rem" }}>
            <StatBox icon="📄" value={stats.papersAuthored} label="Papers" color="var(--accent-cyan)" />
            <StatBox icon="⚓" value={stats.totalAnchors} label="Anchors" color="#f59e0b" />
            <StatBox icon="🏅" value={stats.nftsMinted} label="NFTs" color="#8b5cf6" />
            <StatBox icon="💰" value={stats.papersPurchased} label="Purchased" color="#10b981" />
          </GlassCard>
        </ScrollReveal>
      </section>

      {/* Authored Papers */}
      {profile?.authoredPapers?.length > 0 && (
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)" }}>
          <ScrollReveal>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>📄 Your Papers</h2>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {profile.authoredPapers.map((paper, i) => (
                <Link key={paper.id || i} href={`/article/${paper.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10, padding: "1rem 1.2rem", transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                          {paper.curated_title || paper.title || `Paper #${paper.id}`}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {paper.authors && `By ${paper.authors} • `}{new Date(paper.upload_date).toLocaleDateString("en-US")}
                          {paper.storage_hash && " • 📦 On-chain"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {paper.storage_hash && (
                          <span style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", padding: "3px 10px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 600 }}>ANCHORED</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* NFTs */}
      {profile?.onChain?.nfts?.length > 0 && (
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)" }}>
          <ScrollReveal>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>🏅 Your Research NFTs</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {profile.onChain.nfts.map((nft, i) => (
                <Link key={nft.tokenId} href={`/article/${nft.paperId}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <GlassCard style={{ padding: "1.2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏅</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", marginBottom: 4 }}>#{nft.tokenId}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Paper #{nft.paperId}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace", marginTop: 4 }}>
                      Block #{nft.blockNumber}
                    </div>
                    <a href={`${EXPLORER}/tx/${nft.txHash}`} target="_blank" rel="noopener"
                      style={{ fontSize: "0.65rem", color: "var(--accent-cyan)", textDecoration: "none" }}>
                      Tx ↗
                    </a>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* On-Chain Activity */}
      {allActivity.length > 0 && (
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)" }}>
          <ScrollReveal>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>⛓️ On-Chain Activity</h2>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {allActivity.slice(0, 15).map((item, i) => <ActivityRow key={i} item={item} index={i} />)}
            </div>
          </ScrollReveal>
        </section>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>⏳ Loading profile...</div>
      )}

      {!loading && profile && allActivity.length === 0 && (
        <section style={{ maxWidth: 500, margin: "2rem auto", textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>No on-chain activity yet. Start by uploading a paper!</p>
          <Link href="/pipeline"><button className="neon-btn" style={{ padding: "10px 24px", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>🧪 Try Pipeline</button></Link>
        </section>
      )}

      <div style={{ marginTop: "3rem" }} />
      <Footer />
    </div>
  );
}
