"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WalletProvider, useWallet } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { uploadPaper } from "@/lib/api";
import { loginWithWallet, getStoredToken, logout as authLogout, getStoredAddress, checkAuth } from "@/lib/auth";
import { Nav, Footer } from "@/app/page";

const inputStyle = {
  padding: "12px 16px", background: "var(--bg-card-solid)", border: "1px solid rgba(139,92,246,0.1)",
  borderRadius: 8, color: "var(--text-primary)", fontSize: "0.95rem", width: "100%",
  outline: "none", transition: "border-color 0.2s", fontFamily: "inherit",
};

const labelStyle = { display: "block", marginBottom: 6, color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500 };

function UploadForm() {
  const { t } = useLanguage();
  const { address, connect } = useWallet();
  const router = useRouter();
  const fileRef = useRef(null);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [abstract, setAbstract] = useState("");
  const [priceWei, setPriceWei] = useState("0");
  const [isFree, setIsFree] = useState(true);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  // Auth state
  const [isAuthed, setIsAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Cek apakah sudah auth saat page load
  useEffect(() => {
    const token = getStoredToken();
    const storedAddr = getStoredAddress();
    if (token && storedAddr && address && storedAddr.toLowerCase() === address.toLowerCase()) {
      setIsAuthed(true);
    } else {
      setIsAuthed(false);
    }
  }, [address]);

  // Login: connect wallet → sign message → get token
  const handleAuth = async () => {
    setAuthError(null);
    try {
      // Step 1: Connect wallet kalau belum
      let walletAddr = address;
      if (!walletAddr) {
        await connect();
        return; // Will re-trigger useEffect on next render
      }

      setAuthLoading(true);

      // Step 2: Sign message & verify with backend
      const result = await loginWithWallet(walletAddr);
      setIsAuthed(true);
      setAuthLoading(false);
    } catch (err) {
      setAuthError(err.message || "Authentication failed");
      setAuthLoading(false);
    }
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true); setResult(null); setProgress(0);
    const interval = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 15, 90)), 500);
    const fd = new FormData();
    // Attach auth token ke FormData
    const token = getStoredToken();
    fd.append("author_wallet", address || "");
    if (file) fd.append("file", file);
    try {
      // Kirim dengan auth header
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${baseUrl}/api/papers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      clearInterval(interval); setProgress(100); setResult(data);
      if (data.success) setTimeout(() => router.push("/browse"), 2000);
      if (data.error) throw new Error(data.error);
    } catch (err) { clearInterval(interval); setResult({ error: err.message }); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "2.5rem 2rem 4rem" }}>
        <h1 className="animate-fade-in" style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          {t("upload_title")}
        </h1>
        <p className="animate-fade-in" style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          {t("upload_subtitle")}
        </p>

        {/* ═══ Auth Gate ═══ */}
        {!address && (
          <div className="animate-fade-in" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", padding: "2rem", borderRadius: 12, marginBottom: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Connect Wallet to Upload</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>You need to connect your wallet and verify ownership before uploading papers.</p>
            <button onClick={connect} style={{ padding: "12px 28px", background: "linear-gradient(135deg, var(--accent), #6D28D9)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}>
              ⟠ Connect Wallet
            </button>
          </div>
        )}

        {address && !isAuthed && (
          <div className="animate-fade-in" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", padding: "1.5rem", borderRadius: 12, marginBottom: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>✍️</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Verify Your Wallet</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>Sign a message to prove you own <code style={{ background: "rgba(139,92,246,0.1)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: "0.8rem" }}>{address.slice(0, 6)}...{address.slice(-4)}</code></p>
            {authError && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "0.8rem" }}>❌ {authError}</p>}
            <button onClick={handleAuth} disabled={authLoading} style={{ padding: "12px 28px", background: authLoading ? "var(--text-dim)" : "linear-gradient(135deg, var(--accent), #6D28D9)", color: "#fff", border: "none", borderRadius: 8, cursor: authLoading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.95rem" }}>
              {authLoading ? "⏳ Waiting for signature..." : "✍️ Sign to Verify"}
            </button>
          </div>
        )}

        {address && isAuthed && !address && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", padding: "1rem 1.2rem", borderRadius: 8, marginBottom: "1.5rem", color: "#FBBF24", fontSize: "0.9rem" }}>
            ⚠️ Connect your wallet first to receive payments
          </div>
        )}

        {/* ═══ Upload Form (only show if authed) ═══ */}
        {address && isAuthed && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div className="animate-fade-in animate-fade-in-delay-1">
            <label style={labelStyle}>{t("label_title")} *</label>
            <input type="text" placeholder={t("label_title")} value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = "rgba(139,92,246,0.3)"} onBlur={(e) => e.target.style.borderColor = "rgba(139,92,246,0.1)"} />
          </div>
          <div className="animate-fade-in animate-fade-in-delay-1">
            <label style={labelStyle}>{t("label_authors")}</label>
            <input type="text" placeholder={t("label_authors")} value={authors} onChange={(e) => setAuthors(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "rgba(139,92,246,0.3)"} onBlur={(e) => e.target.style.borderColor = "rgba(139,92,246,0.1)"} />
          </div>
          <div className="animate-fade-in animate-fade-in-delay-2">
            <label style={labelStyle}>{t("label_abstract")}</label>
            <textarea placeholder={t("label_abstract")} value={abstract} onChange={(e) => setAbstract(e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical" }} onFocus={(e) => e.target.style.borderColor = "rgba(139,92,246,0.3)"} onBlur={(e) => e.target.style.borderColor = "rgba(139,92,246,0.1)"} />
          </div>
          <div className="animate-fade-in animate-fade-in-delay-2">
            <label style={labelStyle}>{t("label_file")}</label>
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()} style={{ padding: "2rem", background: dragOver ? "rgba(139,92,246,0.08)" : "var(--bg-card-solid)", border: dragOver ? "2px dashed var(--accent)" : "2px dashed rgba(139,92,246,0.15)", borderRadius: 8, textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{file ? "📎" : "📁"}</div>
              {file ? <p style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>{file.name} <span style={{ color: "var(--text-muted)" }}>({(file.size / 1024).toFixed(1)} KB)</span></p> : <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Drag & drop or <span style={{ color: "var(--accent)" }}>browse</span></p>}
              <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
            </div>
          </div>
          <div className="animate-fade-in animate-fade-in-delay-3">
            <label style={labelStyle}>{t("label_price")}</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <button type="button" onClick={() => { setIsFree(true); setPriceWei("0"); }} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${isFree ? "var(--accent)" : "rgba(139,92,246,0.1)"}`,
                background: isFree ? "rgba(139,92,246,0.12)" : "var(--bg-card-solid)", color: isFree ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
              }}>🆓 Free Access</button>
              <button type="button" onClick={() => { setIsFree(false); setPriceWei("10000000000000000"); }} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${!isFree ? "var(--accent)" : "rgba(139,92,246,0.1)"}`,
                background: !isFree ? "rgba(139,92,246,0.12)" : "var(--bg-card-solid)", color: !isFree ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
              }}>💎 Set Price</button>
            </div>
            {!isFree && (
              <div>
                <input type="text" value={priceWei} onChange={(e) => setPriceWei(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "rgba(139,92,246,0.3)"} onBlur={(e) => e.target.style.borderColor = "rgba(139,92,246,0.1)"} />
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 4 }}>≈ {(Number(priceWei) / 1e18).toFixed(4)} 0G per access</p>
              </div>
            )}
            {isFree && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>📖 Free to read. Readers can still donate to support your research.</p>
            )}
          </div>
          {loading && (
            <div style={{ background: "var(--bg-card-solid)", borderRadius: 8, overflow: "hidden", height: 6 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-cyan))", borderRadius: 8, transition: "width 0.3s" }} />
            </div>
          )}
          <button type="submit" disabled={loading} className="animate-fade-in animate-fade-in-delay-3" style={{
            padding: "14px", background: loading ? "var(--text-dim)" : "linear-gradient(135deg, var(--accent), #6D28D9)",
            color: "#fff", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700, fontSize: "1rem", transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 4px 20px rgba(139,92,246,0.25)",
          }}>
            {loading ? `⏳ ${t("uploading")}` : `📤 ${t("btn_submit")}`}
          </button>
        </form>
        )}

        {result && (
          <div className="animate-fade-in" style={{ marginTop: "1.5rem", padding: "1.2rem", borderRadius: 8, background: result.error ? "rgba(248,113,113,0.08)" : "rgba(34,197,94,0.08)", border: result.error ? "1px solid rgba(248,113,113,0.15)" : "1px solid rgba(34,197,94,0.15)", color: result.error ? "#f87171" : "#22c55e", fontSize: "0.95rem" }}>
            {result.error ? `❌ ${result.error}` : `✅ Paper uploaded successfully! AI is processing...`}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function UploadPage() {
  return <WalletProvider><UploadForm /></WalletProvider>;
}
