"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiSearch, FiUpload, FiCpu, FiTwitter, FiGithub, FiMenu, FiX } from "react-icons/fi";
import { useWallet } from "@/lib/wallet";
import { useLanguage } from "@/LanguageContext";
import { useTheme } from "@/ThemeContext";

/* ─── Flag Icons (SVG) ─── */
function FlagIcon({ code, size = 20 }) {
  const flags = {
    en: <svg width={size} height={Math.round(size*0.67)} viewBox="0 0 60 40" style={{ borderRadius: 3, overflow: "hidden" }}><rect width="60" height="40" fill="#012169"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="6"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4"/><path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="10"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6"/></svg>,
    id: <svg width={size} height={Math.round(size*0.67)} viewBox="0 0 60 40" style={{ borderRadius: 3, overflow: "hidden" }}><rect width="60" height="26.67" fill="#FF0000"/><rect y="26.67" width="60" height="13.33" fill="#fff"/></svg>,
    cn: <svg width={size} height={Math.round(size*0.67)} viewBox="0 0 60 40" style={{ borderRadius: 3, overflow: "hidden" }}><rect width="60" height="40" fill="#DE2910"/><circle cx="15" cy="12" r="6" fill="#FFDE00"/><circle cx="25" cy="6" r="2" fill="#FFDE00"/><circle cx="28" cy="12" r="2" fill="#FFDE00"/><circle cx="25" cy="18" r="2" fill="#FFDE00"/><circle cx="20" cy="20" r="2" fill="#FFDE00"/></svg>,
  };
  return flags[code] || flags.en;
}

/* ─── Navbar (Glassmorphism Floating) ─── */
export function Nav() {
  const { address, connect, disconnect } = useWallet();
  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangDropdown(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  const links = [
    { href: "/", label: t("nav_home"), icon: <FiHome /> },
    { href: "/browse", label: t("nav_browse"), icon: <FiSearch /> },
    { href: "/upload", label: t("nav_upload"), icon: <FiUpload /> },
    { href: "/nfts", label: "NFTs", icon: <span>🏅</span> },
    { href: "/pipeline", label: "Pipeline", icon: <FiCpu /> },
  ];


  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "sticky", top: 12, zIndex: 100, margin: isMobile ? "8px 8px 0" : "12px 16px 0",
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border)",
          borderRadius: isMobile ? 12 : 16, padding: isMobile ? "0 1rem" : "0 1.5rem", height: isMobile ? 52 : 60,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: `0 4px 30px var(--shadow)`,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, minWidth: 44, minHeight: 44, alignItems: "center" }}>
          <span style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>🔮</span>
          <span style={{ fontWeight: 800, fontSize: isMobile ? "1rem" : "1.15rem", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            Rumah<span className="neon-text">Peneliti</span>
          </span>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} style={{
                color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.88rem",
                fontWeight: 500, padding: "8px 16px", borderRadius: 10,
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s", border: "1px solid transparent",
                minHeight: 44,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-cyan)"; e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "var(--glass-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8 }}>
          {/* Desktop only: Theme + Language + Wallet */}
          {!isMobile && (<>
            <button onClick={toggleTheme} style={{
              background: "var(--glass-bg)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "6px 10px", cursor: "pointer",
              color: "var(--text-primary)", fontSize: "1.1rem",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", minHeight: 44, minWidth: 44,
            }} aria-label="Toggle theme">{isDark ? "☀️" : "🌙"}</button>

            <div ref={langRef} style={{ position: "relative" }}>
              <button onClick={() => setLangDropdown(!langDropdown)} style={{
                background: "var(--glass-bg)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: "var(--text-primary)", fontSize: "0.85rem", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", minHeight: 44,
              }}>
                <FlagIcon code={lang} />
                <span style={{ fontWeight: 600 }}>{lang === "en" ? "EN" : lang === "id" ? "ID" : "中文"}</span>
                <span style={{ fontSize: "0.6rem", opacity: 0.5 }}>▼</span>
              </button>
              {langDropdown && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 6,
                  background: "var(--nav-bg)", backdropFilter: "blur(20px)",
                  border: "1px solid var(--border-hover)", borderRadius: 10,
                  padding: 4, minWidth: 160, zIndex: 200,
                  boxShadow: `0 8px 32px var(--shadow)`,
                }}>
                  {[ ["en", "English"], ["id", "Bahasa Indonesia"], ["cn", "中文"] ].map(([code, name]) => (
                    <button key={code} onClick={() => { setLang(code); setLangDropdown(false); }} style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                      background: lang === code ? "var(--glass-bg)" : "transparent",
                      border: "none", color: lang === code ? "var(--accent-cyan)" : "var(--text-primary)",
                      fontWeight: lang === code ? 700 : 400, fontSize: "0.85rem",
                      fontFamily: "inherit", transition: "all 0.2s", textAlign: "left",
                    }}>
                      <FlagIcon code={code} /><span>{name}</span>
                      {lang === code && <span style={{ marginLeft: "auto", fontSize: "0.75rem" }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.button whileTap={{ scale: 0.95 }} onClick={address ? disconnect : connect}
              className={address ? "" : "neon-btn pulse-glow"}
              style={address ? {
                background: "var(--glass-bg)", border: "1px solid var(--border-hover)",
                color: "var(--accent-cyan)", padding: "8px 18px", borderRadius: 10, cursor: "pointer",
                fontWeight: 600, fontSize: "0.82rem", fontFamily: "monospace",
                minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center",
              } : { fontSize: "0.85rem" }}
            >{address ? `${address.slice(0, 4)}...${address.slice(-4)}` : `⟠ ${t("connect_wallet")}`}</motion.button>
          </>)}

          {/* Mobile: only hamburger */}
          {isMobile && (
            <button onClick={() => setOpen(!open)} style={{
              background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer",
              fontSize: "1.3rem", padding: 8, display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: 44, minWidth: 44,
            }}>{open ? <FiX /> : <FiMenu />}</button>
          )}
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobile && open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", top: 68, left: 8, right: 8, zIndex: 99,
              background: "var(--nav-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--border)", borderRadius: 12,
              padding: "0.5rem", boxShadow: `0 8px 32px var(--shadow)`,
            }}
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
                color: "var(--text-primary)", textDecoration: "none", fontSize: "1rem",
                fontWeight: 500, padding: "14px 16px", borderRadius: 10,
                display: "flex", alignItems: "center", gap: 10, minHeight: 48,
              }}>
                <span style={{ fontSize: "1.1rem" }}>{l.icon}</span> {l.label}
              </Link>
            ))}
            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--border)", margin: "4px 12px" }} />
            {/* Language in mobile menu */}
            <div style={{ padding: "8px 16px" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Language</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[ ["en", "EN", "English"], ["id", "ID", "Indonesia"], ["cn", "中文", "Chinese"] ].map(([code, label, name]) => (
                  <button key={code} onClick={() => { setLang(code); }} style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    padding: "10px 8px", borderRadius: 8, cursor: "pointer",
                    background: lang === code ? "var(--glass-bg)" : "transparent",
                    border: lang === code ? "1px solid var(--border-hover)" : "1px solid transparent",
                    color: lang === code ? "var(--accent-cyan)" : "var(--text-secondary)",
                    fontFamily: "inherit", transition: "all 0.2s",
                  }}>
                    <FlagIcon code={code} size={24} />
                    <span style={{ fontSize: "0.7rem", fontWeight: lang === code ? 700 : 400 }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Theme toggle in mobile menu */}
            <button onClick={toggleTheme} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "14px 16px", borderRadius: 10, cursor: "pointer",
              background: "transparent", border: "none", color: "var(--text-primary)",
              fontSize: "1rem", fontWeight: 500, fontFamily: "inherit", textAlign: "left", minHeight: 48,
            }}>
              <span style={{ fontSize: "1.1rem" }}>{isDark ? "☀️" : "🌙"}</span>
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            {/* Wallet in mobile menu */}
            <button onClick={() => { address ? disconnect() : connect(); }} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "14px 16px", borderRadius: 10, cursor: "pointer",
              background: "transparent", border: "none", color: "var(--text-primary)",
              fontSize: "1rem", fontWeight: 500, fontFamily: "inherit", textAlign: "left", minHeight: 48,
            }}>
              <span style={{ fontSize: "1.1rem" }}>⟠</span>
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : t("connect_wallet")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isMobile && open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 98, background: "rgba(0,0,0,0.5)" }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Footer ─── */
export function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{
      borderTop: "1px solid var(--border)", padding: "3rem 1.5rem", marginTop: "4rem",
      background: "var(--glass-bg)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>
            🔮 Rumah<span className="neon-text">Peneliti</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7 }}>
            {t("footer_desc")}
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.9rem", color: "var(--text-secondary)" }}>{t("footer_links")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Link href="/browse" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", minHeight: 44, display: "flex", alignItems: "center" }}>{t("nav_browse")}</Link>
            <Link href="/upload" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", minHeight: 44, display: "flex", alignItems: "center" }}>{t("nav_upload")}</Link>
            <Link href="/pipeline" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", minHeight: 44, display: "flex", alignItems: "center" }}>Pipeline</Link>
            <Link href="/nfts" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", minHeight: 44, display: "flex", alignItems: "center" }}>🏅 NFT Gallery</Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.9rem", color: "var(--text-secondary)" }}>Technology</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7 }}>
            🔗 0G Blockchain<br />🤖 AI Curation<br />💰 Micropayment
          </p>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", color: "var(--text-dim)", fontSize: "0.78rem" }}>
        © 2026 RumahPeneliti.com — {t("footer_built")}
      </div>
    </footer>
  );
}

/* ─── Animated Counter ─── */
export function AnimatedCounter({ target, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const num = parseInt(target.toString().replace(/[^0-9]/g, ""));
    if (isNaN(num)) { setCount(target); return; }
    let start = 0;
    const step = num / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start) + (target.toString().includes("+") ? "+" : "") + (target.toString().includes("K") ? "K" : "") + (target.toString().includes(".") ? "" : ""));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{inView ? (typeof count === "number" ? count : count) : "0"}</span>;
}

/* ─── Glass Card ─── */
export function GlassCard({ children, style = {}, hover = true, neon = "cyan" }) {
  const neonColors = { cyan: "var(--accent-cyan)", purple: "var(--accent)", green: "var(--accent-green)" };
  return (
    <motion.div
      whileHover={hover && typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches ? { y: -6, scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16, overflow: "hidden",
        transition: "border-color 0.3s, box-shadow 0.3s",
        ...style,
      }}
      onMouseEnter={(e) => { if (window.matchMedia('(hover: hover)').matches) { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = `0 8px 32px var(--shadow)`; } }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Particle Background (simple CSS-based) ─── */
export function ParticleGrid() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.03 }}>
        <defs>
          <pattern id="hex" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="var(--accent-cyan)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, background: "radial-gradient(circle, var(--glass-bg) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, var(--glass-bg) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", top: "50%", left: "60%", width: 300, height: 300, background: "radial-gradient(circle, var(--glass-bg) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
    </div>
  );
}

/* ─── Stagger Container ─── */
export function StaggerContainer({ children, style = {} }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} style={style}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, style = {} }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} style={style}>
      {children}
    </motion.div>
  );
}

/* ─── Scroll Reveal ─── */
export function ScrollReveal({ children, style = {} }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, ease: "easeOut" }} style={style}>
      {children}
    </motion.div>
  );
}

/* ─── Reading Progress Bar ─── */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => { const h = document.documentElement; setProgress(Math.min((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100, 100)); };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return <div className="reading-progress" style={{ width: `${progress}%` }} />;
}

/* ─── ETH Icon ─── */
export function EthIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 417" style={{ verticalAlign: "middle", marginRight: 4 }}>
      <g fill="none">
        <polygon fill="var(--accent-cyan)" points="127.9611 0 125.1661 9.5 125.1661 285.168 127.9611 287.958 255.9231 212.32" opacity="0.6"/>
        <polygon fill="var(--accent-cyan)" points="127.962 0 0 212.32 127.962 287.959 127.962 154.158" opacity="0.8"/>
        <polygon fill="var(--accent-cyan)" points="127.9611 312.1866 126.3861 314.1066 126.3861 412.3056 127.9611 416.9066 255.9991 236.5866" opacity="0.6"/>
        <polygon fill="var(--accent-cyan)" points="127.962 416.9052 127.962 312.1852 0 236.5852" opacity="0.8"/>
        <polygon fill="var(--accent-cyan)" points="127.9611 287.9577 255.9211 212.3207 127.9611 154.1587" opacity="0.4"/>
        <polygon fill="var(--accent-cyan)" points="0.0009 212.3208 127.9609 287.9578 127.9609 154.1588" opacity="0.4"/>
      </g>
    </svg>
  );
}
