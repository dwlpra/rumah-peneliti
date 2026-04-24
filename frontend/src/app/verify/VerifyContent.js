"use client";
import { getApiUrl } from "@/lib/api-url";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav, Footer, GlassCard, ScrollReveal } from "@/components/Web3UI";

const EXPLORER = "https://chainscan.0g.ai";
const API = () => getApiUrl();

function ProofBadge({ label, value, color }) {
  if (!value || value === "0x" + "0".repeat(64)) return null;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
      <span style={{ color, fontWeight: 600, fontSize: "0.8rem", minWidth: 100, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "var(--text-primary)", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

export default function VerifyContent() {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!hash.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API()}/api/verify/${hash.trim()}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError("Failed to verify. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      <section style={{ textAlign: "center", padding: "clamp(3rem, 8vw, 5rem) clamp(1rem, 3vw, 2rem) clamp(2rem, 4vw, 3rem)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🔍</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
            Verify <span className="neon-text">Research</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Enter a storage root hash, curation hash, or article hash to verify its authenticity on the 0G blockchain.
          </p>
        </motion.div>
      </section>

      {/* Input */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 clamp(1rem, 3vw, 2rem) 2rem" }}>
        <ScrollReveal>
          <GlassCard neon="cyan" style={{ padding: "2rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--accent-cyan)", marginBottom: "1rem" }}>
              Enter Hash to Verify
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="0x8262dd289a7271b016ab773b47b3ab60c5738a3a4f0b33431b881962f9bbba9b"
                style={{
                  flex: 1, padding: "12px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,240,255,0.15)",
                  borderRadius: 8, color: "var(--text-primary)", fontFamily: "monospace", fontSize: "0.85rem", outline: "none",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleVerify} disabled={loading || !hash.trim()}
                style={{
                  padding: "12px 24px",
                  background: loading || !hash.trim() ? "var(--text-dim)" : "linear-gradient(135deg, var(--accent), #6D28D9)",
                  color: "#fff", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 700, fontSize: "0.9rem", fontFamily: "inherit", whiteSpace: "nowrap",
                }}
              >
                {loading ? "⏳ Verifying..." : "🔍 Verify"}
              </motion.button>
            </div>

            {/* Quick test hashes */}
            <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Quick test:
              <button onClick={() => setHash("0x8262dd289a7271b016ab773b47b3ab60c5738a3a4f0b33431b881962f9bbba9b")}
                style={{ marginLeft: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 6, padding: "4px 10px", color: "var(--accent)", cursor: "pointer", fontSize: "0.7rem", fontFamily: "monospace" }}>
                Storage Root
              </button>
              <button onClick={() => setHash("0x3fbe965eb02b7ac9cee90d9ce44a7d7d5b4449fcd2fb627a3c2939ff4d6cff37")}
                style={{ marginLeft: 4, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 6, padding: "4px 10px", color: "var(--accent-cyan)", cursor: "pointer", fontSize: "0.7rem", fontFamily: "monospace" }}>
                Article Hash
              </button>
            </div>
          </GlassCard>
        </ScrollReveal>
      </section>

      {/* Result */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 clamp(1rem, 3vw, 2rem) 2rem" }}>
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard style={{ padding: "1.5rem", border: "1px solid rgba(239,68,68,0.3)", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>❌</div>
                <p style={{ color: "#f87171" }}>{error}</p>
              </GlassCard>
            </motion.div>
          )}

          {result && !result.verified && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard style={{ padding: "1.5rem", border: "1px solid rgba(239,68,68,0.2)", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</div>
                <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Not Found</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>This hash was not found in any on-chain anchor, article, or NFT record.</p>
              </GlassCard>
            </motion.div>
          )}

          {result?.verified && result.data && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard neon="green" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.2rem" }}>
                  <div style={{ fontSize: "2rem" }}>✅</div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Verified on 0G Blockchain</h3>
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                      background: result.type === "paper_anchor" ? "rgba(245,158,11,0.15)" :
                        result.type === "article_anchor" ? "rgba(6,182,212,0.15)" : "rgba(139,92,246,0.15)",
                      color: result.type === "paper_anchor" ? "#f59e0b" :
                        result.type === "article_anchor" ? "#06b6d4" : "#8b5cf6",
                    }}>
                      {result.type === "paper_anchor" ? "📎 PAPER ANCHOR" :
                        result.type === "article_anchor" ? "📝 ARTICLE ANCHOR" : "🏅 RESEARCH NFT"}
                    </span>
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "1rem" }}>
                  <ProofBadge label="Paper ID" value={`#${result.data.paperId}`} color="#10b981" />
                  <ProofBadge label="Storage Root" value={result.data.storageRoot} color="var(--accent-cyan)" />
                  {result.data.curationHash && <ProofBadge label="Curation Hash" value={result.data.curationHash} color="#8b5cf6" />}
                  {result.data.metadataHash && <ProofBadge label="Metadata Hash" value={result.data.metadataHash} color="#f59e0b" />}
                  {result.data.articleHash && <ProofBadge label="Article Hash" value={result.data.articleHash} color="#06b6d4" />}
                  {result.data.tokenId !== undefined && <ProofBadge label="Token ID" value={`#${result.data.tokenId}`} color="#8b5cf6" />}
                  <ProofBadge label="Author" value={result.data.author || result.data.researcher} color="var(--text-secondary)" />

                  {result.data.blockNumber && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Block #{result.data.blockNumber}
                      </span>
                      {result.data.timestamp && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {new Date(result.data.timestamp * 1000).toLocaleString("en-US")}
                        </span>
                      )}
                    </div>
                  )}

                  <a href={`${EXPLORER}/tx/${result.data.txHash}`} target="_blank" rel="noopener"
                    style={{ display: "inline-block", marginTop: 10, padding: "8px 16px", background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: 8, color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
                    View Transaction on Explorer ↗
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 800, margin: "3rem auto", padding: "clamp(1rem, 3vw, 2rem)" }}>
        <ScrollReveal>
          <GlassCard style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--accent)", marginBottom: "1rem" }}>How Verification Works</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
              <div>
                <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>📤</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>Upload</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.6 }}>Paper uploaded to 0G Storage, generating a unique Merkle root hash</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>⚓</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>Anchor</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.6 }}>Hash anchored on 0G blockchain via PaperAnchor smart contract</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>🔍</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>Verify</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.6 }}>Anyone can verify the hash against on-chain records — trustless proof</div>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
