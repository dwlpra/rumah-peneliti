"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiSearch, FiUpload, FiMenu, FiX } from "react-icons/fi";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const links = [
    { href: "/", label: "Home", icon: <FiHome /> },
    { href: "/browse", label: "Browse", icon: <FiSearch /> },
    { href: "/upload", label: "Upload", icon: <FiUpload /> },
  ];

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{
      position: "sticky", top: 12, zIndex: 100, margin: "12px 16px 0",
      background: "var(--nav-bg)", backdropFilter: "blur(20px)",
      border: "1px solid var(--border)", borderRadius: 16, padding: "0 1.5rem", height: 60,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "1.5rem" }}>🔮</span>
        <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--text-primary)" }}>
          Rumah<span className="neon-text">Peneliti</span>
        </span>
      </Link>
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500, padding: "8px 16px", borderRadius: 10, display: "flex", alignItems: "center", gap: 6 }}>
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
      )}
      {isMobile && (
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.3rem", padding: 8 }}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      )}
    </motion.nav>
  );
}

export function GlassCard({ children, style = {} }) {
  return (
    <motion.div style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)", borderRadius: 16, ...style }}>
      {children}
    </motion.div>
  );
}

export function ScrollReveal({ children, style = {} }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} style={style}>{children}</motion.div>;
}

export function StaggerContainer({ children, style = {} }) {
  return <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} style={style}>{children}</motion.div>;
}

export function StaggerItem({ children, style = {} }) {
  return <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={style}>{children}</motion.div>;
}

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "3rem 1.5rem", marginTop: "4rem", background: "var(--glass-bg)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>🔮 RumahPeneliti</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Decentralized research platform.</p>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.9rem", color: "var(--text-secondary)" }}>Quick Links</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Link href="/browse" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>Browse</Link>
            <Link href="/upload" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>Upload</Link>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", color: "var(--text-dim)", fontSize: "0.78rem" }}>
        © 2026 RumahPeneliti.com — Built for 0G APAC Hackathon 2026
      </div>
    </footer>
  );
}
