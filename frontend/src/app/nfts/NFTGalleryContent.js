"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Nav, Footer, GlassCard, ScrollReveal } from "@/components/Web3UI";

const EXPLORER = "https://chainscan.0g.ai";
import { getApiUrl } from "@/lib/api-url";
const API = () => getApiUrl();
const NFT_CONTRACT = "0x78C414367A91917fe5DC8123119467c9910a4B6d";

const COLORS = [
  ["#8b5cf6", "#6366f1"],
  ["#3b82f6", "#06b6d4"],
  ["#10b981", "#06b6d4"],
  ["#f59e0b", "#ef4444"],
  ["#ec4899", "#8b5cf6"],
  ["#06b6d4", "#3b82f6"],
];

function NFTCard({ nft, paper, index }) {
  const [c1, c2] = COLORS[index % COLORS.length];
  const date = nft.timestamp ? new Date(nft.timestamp * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      style={{ background: "var(--bg-card-solid)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}
    >
      <div style={{ height: 200, background: `linear-gradient(135deg, ${c1}33, ${c2}22)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `${c1}15`, filter: "blur(20px)" }} />
        <div style={{ fontSize: "3rem", marginBottom: 8 }}>🏅</div>
        <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, background: `linear-gradient(135deg, ${c1}, ${c2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>#{nft.tokenId}</div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>ERC-721</div>
      </div>
      <div style={{ padding: "1.2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Research NFT #{nft.tokenId}</span>
          <span style={{ background: `linear-gradient(135deg, ${c1}33, ${c2}22)`, padding: "3px 10px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 700, color: c1 }}>ON-CHAIN</span>
        </div>
        {paper && <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{paper.curated_title || paper.paper_title || `Paper #${nft.paperId}`}</p>}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
          <span>Paper #{nft.paperId}</span><span>{date}</span>
        </div>
        <a href={`${EXPLORER}/tx/${nft.txHash}`} target="_blank" rel="noopener" style={{ display: "block", marginTop: 10, fontSize: "0.72rem", color: "var(--accent-cyan)", textDecoration: "none", fontFamily: "monospace", textAlign: "center" }}>Tx: {nft.txHash?.slice(0, 14)}... ↗</a>
      </div>
    </motion.div>
  );
}

export default function NFTGalleryContent() {
  const [nfts, setNfts] = useState([]);
  const [papers, setPapers] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`${API()}/api/activity`).then(r => r.json()),
      fetch(`${API()}/api/nfts/stats`).then(r => r.json()),
    ]).then(([activityData, nftStats]) => {
      const nftItems = (activityData?.activity || []).filter(a => a.type === "nft");
      setNfts(nftItems);
      setTotalSupply(nftStats?.totalSupply || nftItems.length);
      const paperIds = [...new Set(nftItems.map(n => n.paperId))];
      Promise.all(paperIds.map(id => fetch(`${API()}/api/articles/${id}`).then(r => r.json()).then(a => ({ id, ...a })).catch(() => null)))
        .then(results => {
          const m = {};
          results.filter(Boolean).forEach(p => { m[p.id] = p; });
          setPapers(m);
          setLoading(false);
        });
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <section style={{ textAlign: "center", padding: "clamp(3rem, 8vw, 5rem) clamp(1rem, 3vw, 2rem) clamp(2rem, 4vw, 3rem)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", padding: "6px 16px", borderRadius: 20, fontSize: "0.8rem", color: "#8b5cf6", fontWeight: 600, marginBottom: "1rem" }}>🏅 ERC-721 Research NFTs</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, marginBottom: "0.75rem" }}><span className="neon-text">Research NFT</span> Gallery</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>Every curated paper is minted as a unique ERC-721 NFT on 0G blockchain. Gasless. Permanent. Verifiable.</p>
          <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginTop: "1.5rem" }}>
            <div><div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>{totalSupply}</div><div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>NFTs Minted</div></div>
            <div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981" }}>0</div><div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Gas (Sponsored)</div></div>
            <div><div style={{ fontSize: "2rem", fontWeight: 800, color: "#06b6d4" }}>0G</div><div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Network</div></div>
          </div>
        </motion.div>
      </section>

      <section style={{ maxWidth: 800, margin: "0 auto", padding: "0 clamp(1rem, 3vw, 2rem) 2rem" }}>
        <ScrollReveal>
          <GlassCard neon="purple" style={{ padding: "1.2rem 1.5rem", display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#8b5cf6", animation: "pulse 2s infinite" }} />
            <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.85rem" }}>ResearchNFT Contract</span>
            <a href={`${EXPLORER}/address/${NFT_CONTRACT}`} target="_blank" rel="noopener" style={{ color: "#8b5cf6", fontSize: "0.75rem", fontFamily: "monospace", textDecoration: "none" }}>{NFT_CONTRACT.slice(0, 8)}...{NFT_CONTRACT.slice(-6)} ↗</a>
          </GlassCard>
        </ScrollReveal>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}><div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>Loading NFTs from blockchain...</div>
        ) : nfts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}><div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎭</div><p>No NFTs minted yet.</p><Link href="/pipeline" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Try Pipeline →</Link></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {nfts.map((nft, i) => <Link key={nft.tokenId} href={`/article/${nft.paperId}`} style={{ textDecoration: "none", color: "inherit" }}><NFTCard nft={nft} paper={papers[nft.paperId]} index={i} /></Link>)}
          </div>
        )}
      </section>

      <section style={{ maxWidth: 600, margin: "3rem auto", padding: "clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)", textAlign: "center" }}>
        <ScrollReveal>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.7 }}>Publish your research and receive a unique NFT — proof of your contribution, forever on-chain.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/pipeline"><button className="neon-btn pulse-glow" style={{ padding: "12px 28px", fontSize: "0.95rem", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>🧪 Try Pipeline</button></Link>
            <Link href="/upload"><button style={{ padding: "12px 28px", background: "transparent", color: "var(--text-primary)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.95rem", fontFamily: "inherit" }}>📤 Upload Paper</button></Link>
          </div>
        </ScrollReveal>
      </section>
      <Footer />
    </div>
  );
}
