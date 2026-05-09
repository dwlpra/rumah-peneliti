"use client"

/**
 * Research NFT Trading Card — SVG Generator
 *
 * Layout rules (Yu-Gi-Oh / Pokemon inspired):
 *   1. Top bar    → Field badge (type) + Rarity stars
 *   2. Art frame  → Gradient + geometric pattern based on classification
 *   3. Title bar  → Paper title (truncated)
 *   4. Stats bar  → AI Score (like HP), Paper ID
 *   5. Body       → Summary snippet (2-3 lines)
 *   6. Footer     → Tags, Network badge, 0G logo
 *
 * Color scheme rules:
 *   - Blockchain/Crypto  → Deep blue (#1e40af)
 *   - AI/ML              → Purple (#7c3aed)
 *   - DeFi/Fintech       → Emerald (#059669)
 *   - Security           → Red (#dc2626)
 *   - Storage/Infra      → Amber (#d97706)
 *   - Default            → Slate (#475569)
 *
 * Card dimensions: 480 x 672 (2.5:3.5 ratio, same as standard trading cards)
 */

const FIELD_COLORS = {
  blockchain: { primary: "#1e40af", secondary: "#3b82f6", glow: "rgba(59,130,246,0.3)", pattern: "nodes" },
  crypto: { primary: "#1e40af", secondary: "#3b82f6", glow: "rgba(59,130,246,0.3)", pattern: "nodes" },
  ai: { primary: "#7c3aed", secondary: "#a78bfa", glow: "rgba(167,139,250,0.3)", pattern: "circuits" },
  ml: { primary: "#7c3aed", secondary: "#a78bfa", glow: "rgba(167,139,250,0.3)", pattern: "circuits" },
  defi: { primary: "#059669", secondary: "#34d399", glow: "rgba(52,211,153,0.3)", pattern: "waves" },
  fintech: { primary: "#059669", secondary: "#34d399", glow: "rgba(52,211,153,0.3)", pattern: "waves" },
  security: { primary: "#dc2626", secondary: "#f87171", glow: "rgba(248,113,113,0.3)", pattern: "shields" },
  storage: { primary: "#d97706", secondary: "#fbbf24", glow: "rgba(251,191,36,0.3)", pattern: "grid" },
  infrastructure: { primary: "#d97706", secondary: "#fbbf24", glow: "rgba(251,191,36,0.3)", pattern: "grid" },
  default: { primary: "#475569", secondary: "#94a3b8", glow: "rgba(148,163,184,0.3)", pattern: "dots" },
}

function getFieldStyle(tags, classification) {
  const search = `${(tags || []).join(" ")} ${(classification || "")}`.toLowerCase()
  for (const [key, style] of Object.entries(FIELD_COLORS)) {
    if (key === "default") continue
    if (search.includes(key)) return style
  }
  if (search.includes("learn") || search.includes("neural") || search.includes("model")) return FIELD_COLORS.ai
  if (search.includes("chain") || search.includes("smart contract") || search.includes("decentrali")) return FIELD_COLORS.blockchain
  if (search.includes("finance") || search.includes("payment") || search.includes("token")) return FIELD_COLORS.defi
  return FIELD_COLORS.default
}

function getRarity(score) {
  if (!score) return { label: "COMMON", stars: 1, color: "#94a3b8" }
  const s = typeof score === "object"
    ? Math.round(((score.novelty || 0) + (score.clarity || 0) + (score.methodology || 0) + (score.impact || 0)) / 4)
    : Number(score)
  if (s >= 90) return { label: "MYTHIC", stars: 5, color: "#f59e0b" }
  if (s >= 75) return { label: "RARE", stars: 4, color: "#8b5cf6" }
  if (s >= 60) return { label: "UNCOMMON", stars: 3, color: "#3b82f6" }
  return { label: "COMMON", stars: 2, color: "#94a3b8" }
}

function truncate(str, maxLen) {
  if (!str || typeof str !== "string") return ""
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str
}

function wrapText(text, maxCharsPerLine, maxLines) {
  if (!text || typeof text !== "string") return []
  const words = text.split(" ")
  const lines = []
  let current = ""
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine && current) {
      lines.push(current.trim())
      current = word
    } else {
      current = (current + " " + word).trim()
    }
    if (lines.length >= maxLines) break
  }
  if (current && lines.length < maxLines) lines.push(current.trim())
  return lines.slice(0, maxLines)
}

function PatternOverlay({ type, color, opacity = 0.08 }) {
  switch (type) {
    case "nodes":
      return (
        <>
          <circle cx="100" cy="80" r="20" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 2} />
          <circle cx="200" cy="50" r="30" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 2} />
          <circle cx="350" cy="90" r="25" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 2} />
          <circle cx="150" cy="130" r="15" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 2} />
          <circle cx="300" cy="60" r="18" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 2} />
          <line x1="100" y1="80" x2="200" y2="50" stroke={color} strokeWidth="0.5" opacity={opacity} />
          <line x1="200" y1="50" x2="350" y2="90" stroke={color} strokeWidth="0.5" opacity={opacity} />
          <line x1="100" y1="80" x2="150" y2="130" stroke={color} strokeWidth="0.5" opacity={opacity} />
          <line x1="150" y1="130" x2="300" y2="60" stroke={color} strokeWidth="0.5" opacity={opacity} />
          <line x1="300" y1="60" x2="350" y2="90" stroke={color} strokeWidth="0.5" opacity={opacity} />
        </>
      )
    case "circuits":
      return (
        <>
          <path d="M80,60 L120,60 L120,100 L160,100" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 1.5} />
          <path d="M300,40 L300,80 L340,80 L340,120" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 1.5} />
          <path d="M180,100 L180,140 L220,140" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 1.5} />
          <circle cx="120" cy="60" r="3" fill={color} opacity={opacity * 3} />
          <circle cx="160" cy="100" r="3" fill={color} opacity={opacity * 3} />
          <circle cx="340" cy="80" r="3" fill={color} opacity={opacity * 3} />
          <circle cx="220" cy="140" r="3" fill={color} opacity={opacity * 3} />
          <rect x="380" y="40" width="12" height="12" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 2} />
          <rect x="60" y="110" width="10" height="10" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 2} />
        </>
      )
    case "waves":
      return (
        <>
          <path d="M0,80 Q60,60 120,80 T240,80 T360,80 T480,80" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 1.5} />
          <path d="M0,110 Q60,90 120,110 T240,110 T360,110 T480,110" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity} />
          <path d="M0,50 Q60,30 120,50 T240,50 T360,50 T480,50" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 0.8} />
        </>
      )
    case "shields":
      return (
        <>
          <path d="M120,50 L140,40 L160,50 L160,75 L140,85 L120,75 Z" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 2} />
          <path d="M300,60 L325,47 L350,60 L350,92 L325,105 L300,92 Z" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 2} />
          <path d="M200,100 L215,92 L230,100 L230,118 L215,126 L200,118 Z" fill="none" stroke={color} strokeWidth="0.6" opacity={opacity * 1.5} />
        </>
      )
    case "grid":
      return (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={40 + i * 20} x2="480" y2={40 + i * 20} stroke={color} strokeWidth="0.3" opacity={opacity * 0.8} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`v${i}`} x1={50 + i * 45} y1="30" x2={50 + i * 45} y2="180" stroke={color} strokeWidth="0.3" opacity={opacity * 0.8} />
          ))}
        </>
      )
    default:
      return (
        <>
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={40 + (i % 6) * 80} cy={50 + Math.floor(i / 6) * 60} r="2" fill={color} opacity={opacity * 3} />
          ))}
        </>
      )
  }
}

export function NFTCardSVG({ nft, article }) {
  const style = getFieldStyle(article?.tags, article?.classification)
  const rarity = getRarity(article?.ai_score)
  const score = article?.ai_score
    ? typeof article.ai_score === "object"
      ? Math.round(((article.ai_score.novelty || 0) + (article.ai_score.clarity || 0) + (article.ai_score.methodology || 0) + (article.ai_score.impact || 0)) / 4)
      : Math.round(Number(article.ai_score))
    : 0

  const rawTitle = nft.paperTitle || article?.curated_title || `Research #${nft.tokenId}`
  const titleLines = wrapText(rawTitle, 36, 2)
  const ty = titleLines.length > 1 ? 12 : 0  // extra offset for 2-line title
  const summary = truncate(article?.summary || "", 140)
  const summaryLines = wrapText(summary, 44, 3)
  const tags = (article?.tags || []).slice(0, 3)
  const fieldLabel = truncate(
    (typeof article?.classification === "string" ? article.classification : "") ||
    (typeof tags[0] === "string" ? tags[0] : "") ||
    "Research",
    14
  ) || "RESEARCH"

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 480 ${672 + ty}`}
      width="100%"
      height="100%"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif", display: "block" }}
    >
      <defs>
        <linearGradient id={`bg-${nft.tokenId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id={`art-${nft.tokenId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={style.primary} />
          <stop offset="100%" stopColor={style.secondary} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`title-${nft.tokenId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={style.primary} stopOpacity="0.9" />
          <stop offset="100%" stopColor={style.primary} stopOpacity="0.4" />
        </linearGradient>
        <filter id={`glow-${nft.tokenId}`}>
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Card background */}
      <rect width="480" height={672 + ty} rx="16" fill={`url(#bg-${nft.tokenId})`} />

      {/* Border glow */}
      <rect x="1" y="1" width="478" height={670 + ty} rx="16" fill="none" stroke={style.primary} strokeWidth="1.5" opacity="0.4" />

      {/* ── TOP BAR: Field badge + Rarity ── */}
      <rect x="20" y="16" width="440" height="32" rx="6" fill={style.primary} opacity="0.15" />
      <text x="36" y="38" fill={style.secondary} fontSize="11" fontWeight="700" letterSpacing="1.5">{fieldLabel.toUpperCase()}</text>

      {/* Rarity stars */}
      {Array.from({ length: rarity.stars }, (_, i) => (
        <text key={i} x={370 + i * 18} y="39" fill={rarity.color} fontSize="14">★</text>
      ))}
      <text x="330" y="38" fill={rarity.color} fontSize="9" fontWeight="600" textAnchor="end">{rarity.label}</text>

      {/* ── ART FRAME: Gradient + Pattern ── */}
      <rect x="24" y="56" width="432" height="220" rx="10" fill={`url(#art-${nft.tokenId})`} opacity="0.3" />
      <rect x="24" y="56" width="432" height="220" rx="10" fill="none" stroke={style.primary} strokeWidth="1" opacity="0.3" />

      {/* Pattern overlay */}
      <PatternOverlay type={style.pattern} color={style.secondary} />

      {/* Center icon — large token number */}
      <text x="240" y="185" textAnchor="middle" fill={style.secondary} fontSize="90" fontWeight="800" opacity="0.15">#{nft.tokenId}</text>

      {/* AI Score ring */}
      <circle cx="240" cy="155" r="45" fill="none" stroke={style.primary} strokeWidth="2" opacity="0.3" />
      <text x="240" y="148" textAnchor="middle" fill="white" fontSize="28" fontWeight="800">{score}</text>
      <text x="240" y="168" textAnchor="middle" fill={style.secondary} fontSize="10" fontWeight="600" letterSpacing="1">AI SCORE</text>

      {/* ── TITLE BAR ── */}
      <rect x="20" y="286" width="440" height={titleLines.length > 1 ? 56 : 44} rx="8" fill={`url(#title-${nft.tokenId})`} />
      {titleLines.length === 1 ? (
        <text x="240" y="314" textAnchor="middle" fill="white" fontSize="15" fontWeight="700">{titleLines[0]}</text>
      ) : (
        <>
          <text x="240" y="308" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{titleLines[0]}</text>
          <text x="240" y="328" textAnchor="middle" fill="white" fontSize="13" fontWeight="600" opacity="0.9">{titleLines[1]}</text>
        </>
      )}

      {/* ── STATS BAR ── */}
      <rect x="20" y={340 + ty} width="210" height="36" rx="6" fill="white" opacity="0.05" />
      <text x="36" y={363 + ty} fill="#94a3b8" fontSize="10" fontWeight="600" letterSpacing="0.5">PAPER ID</text>
      <text x="200" y={363 + ty} textAnchor="end" fill="white" fontSize="14" fontWeight="700" fontFamily="monospace">#{nft.paperId}</text>

      <rect x="250" y={340 + ty} width="210" height="36" rx="6" fill="white" opacity="0.05" />
      <text x="266" y={363 + ty} fill="#94a3b8" fontSize="10" fontWeight="600" letterSpacing="0.5">NETWORK</text>
      <circle cx="420" cy={358 + ty} r="4" fill="#10b981" />
      <text x="445" y={363 + ty} textAnchor="end" fill="white" fontSize="11" fontWeight="600">0G</text>

      {/* ── SUMMARY ── */}
      {summaryLines.length > 0 && (
        <rect x="20" y={388 + ty} width="440" height={summaryLines.length * 22 + 16} rx="8" fill="white" opacity="0.03" />
      )}
      {summaryLines.map((line, i) => (
        <text key={i} x="36" y={410 + ty + i * 22} fill="#94a3b8" fontSize="12" fontWeight="400">
          {line}
        </text>
      ))}

      {/* ── TAGS ── */}
      {tags.length > 0 && (
        <g>
          {tags.map((tag, i) => {
            const x = 24 + i * 120
            return (
              <g key={i}>
                <rect x={x} y={540 + ty} width="110" height="26" rx="13" fill={style.primary} opacity="0.15" />
                <text x={x + 55} y={558 + ty} textAnchor="middle" fill={style.secondary} fontSize="10" fontWeight="600">#{tag}</text>
              </g>
            )
          })}
        </g>
      )}

      {/* ── FOOTER ── */}
      <rect x="20" y={580 + ty} width="440" height="1" fill="white" opacity="0.06" />

      {/* Researcher address */}
      <text x="36" y={608 + ty} fill="#64748b" fontSize="10" fontWeight="500">RESEARCHER</text>
      <text x="36" y={626 + ty} fill="#94a3b8" fontSize="11" fontFamily="monospace">
        {nft.researcher ? `${nft.researcher.slice(0, 8)}...${nft.researcher.slice(-6)}` : "Unknown"}
      </text>

      {/* Timestamp */}
      <text x="444" y={608 + ty} textAnchor="end" fill="#64748b" fontSize="10" fontWeight="500">MINTED</text>
      <text x="444" y={626 + ty} textAnchor="end" fill="#94a3b8" fontSize="11" fontFamily="monospace">
        {nft.timestamp ? new Date(Number(nft.timestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
      </text>

      {/* Branding */}
      <rect x="20" y={640 + ty} width="440" height="24" rx="4" fill="white" opacity="0.02" />
      <text x="240" y={656 + ty} textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600" letterSpacing="2">
        RUMAHPENELITI × 0G NETWORK
      </text>
    </svg>
  )
}
