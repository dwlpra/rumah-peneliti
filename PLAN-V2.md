# RumahPeneliti Frontend v2 — Rombak Total

## 🎯 Tujuan
Transformasi frontend dari DeFi/crypto neon aesthetic → **akademik, formal, clean, modern** menggunakan **Tailwind CSS** + **shadcn/ui**.

---

## 📐 Design System

### Prinsip
- **Formal & Akademik** — netral, profesional, terpercaya
- **Clean & Modern** — white space generous, subtle borders, hover halus
- **Konsisten** — design tokens, spacing scale, typography scale统一
- **Accessible** — proper contrast, keyboard nav, screen reader friendly

### Warna
```
Primary:    Blue-700 (#1d4ed8) — link, CTA, branding
Secondary:  Slate-600 (#475569) — secondary text
Success:    Emerald-600 (#059669) — confirmed, free, active
Warning:    Amber-500 (#f59e0b) — pending, caution  
Danger:     Red-600 (#dc2626) — error, locked
Background: White (#ffffff) + Slate-50 (#f8fafc)
Surface:    White cards + slate-200 borders
Text:       Slate-900 (primary), Slate-500 (secondary), Slate-400 (muted)
```

### Tipografi
- **Heading:** Inter / system-ui, bold, tracking tight
- **Body:** Inter / system-ui, regular, leading-relaxed
- **Mono:** JetBrains Mono, untuk address/hash

### Spacing Scale
- `4px 8px 12px 16px 24px 32px 48px 64px`

### shadcn/ui Components
- Button, Card, Badge, Input, Textarea, Label
- NavigationMenu, Sheet (mobile nav)
- Dialog, Tabs, Separator
- Table, Skeleton, Toast
- DropdownMenu (language, theme)

---

## 📂 Struktur File v2

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + providers
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Tailwind base + shadcn vars
│   │   ├── browse/page.tsx         # Browse articles/papers
│   │   ├── article/[id]/page.tsx   # Article detail
│   │   ├── upload/page.tsx         # Upload form
│   │   ├── pipeline/page.tsx       # Pipeline Wizard
│   │   ├── nfts/page.tsx           # NFT Gallery
│   │   ├── profile/page.tsx        # User profile
│   │   ├── verify/page.tsx         # Verify hash
│   │   ├── tech/page.tsx           # Tech stack
│   │   ├── analytics/page.tsx      # Analytics dashboard
│   │   └── leaderboard/page.tsx    # Leaderboard
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── label.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── sheet.tsx
│   │   │   └── toast.tsx
│   │   ├── layout/
│   │   │   ├── navbar.tsx          # Top navigation
│   │   │   ├── footer.tsx          # Site footer
│   │   │   └── mobile-nav.tsx      # Sheet-based mobile nav
│   │   ├── home/
│   │   │   ├── hero.tsx            # Hero section
│   │   │   ├── stats.tsx           # Platform stats
│   │   │   ├── latest-papers.tsx   # Latest curated papers
│   │   │   ├── how-it-works.tsx    # Pipeline overview
│   │   │   └── tech-stack.tsx      # 0G tech stack cards
│   │   ├── papers/
│   │   │   ├── paper-card.tsx      # Card for browse grid
│   │   │   ├── article-card.tsx    # Article card variant
│   │   │   ├── search-bar.tsx      # Search + filter
│   │   │   └── category-pills.tsx  # Category selector
│   │   ├── article/
│   │   │   ├── article-body.tsx    # Article content
│   │   │   ├── paywall.tsx         # Paywall overlay
│   │   │   ├── ai-score.tsx        # AI quality score
│   │   │   ├── ai-chat.tsx         # Chat with AI
│   │   │   ├── sidebar.tsx         # Paper info sidebar
│   │   │   └── on-chain-data.tsx   # On-chain verification
│   │   ├── pipeline/
│   │   │   ├── pipeline-form.tsx   # Upload form
│   │   │   ├── pipeline-steps.tsx  # Step tracker
│   │   │   └── pipeline-result.tsx # Result display
│   │   └── shared/
│   │       ├── wallet-button.tsx   # Connect/disconnect
│   │       ├── language-switcher.tsx
│   │       ├── theme-toggle.tsx
│   │       ├── explorer-link.tsx   # Link to 0G explorer
│   │       └── address-display.tsx # Truncated address
│   ├── contexts/
│   │   ├── language.tsx            # i18n context (refactored)
│   │   ├── theme.tsx               # Theme context (refactored)
│   │   └── wallet.tsx              # Wallet context (refactored)
│   ├── lib/
│   │   ├── api.ts                  # API client (keep, minor refactor)
│   │   ├── api-url.ts              # API URL helper (keep)
│   │   ├── auth.ts                 # Auth (keep)
│   │   ├── utils.ts                # shadcn cn() helper
│   │   └── constants.ts            # Explorer URL, contract addresses
│   └── i18n/
│       └── translations.ts         # Translations (keep)
├── tailwind.config.ts
├── postcss.config.js
├── components.json                 # shadcn config
├── next.config.js
└── package.json
```

---

## 📋 Tasks

### Fase 0: Setup Infrastructure
| # | Task | Detail |
|---|------|--------|
| 0.1 | Install dependencies | `tailwindcss@3`, `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` |
| 0.2 | Setup shadcn/ui | Init `components.json`, configure path aliases |
| 0.3 | Configure `tailwind.config.ts` | Custom colors, fonts, spacing matching design system |
| 0.4 | Rewrite `globals.css` | Tailwind directives + shadcn CSS variables (light/dark), buang semua neon/glass CSS |
| 0.5 | Setup `lib/utils.ts` | `cn()` helper untuk shadcn |
| 0.6 | Create `lib/constants.ts` | Explorer URL, contract addresses, API helpers |
| 0.7 | Add shadcn UI primitives | Install semua component yang dibutuhkan |

### Fase 1: Core Components
| # | Task | Detail |
|---|------|--------|
| 1.1 | Refactor contexts | Pindahkan `WalletContext`, `LanguageContext`, `ThemeProvider` ke `contexts/` — cleanup, keep API compatible |
| 1.2 | Build `Navbar` | `NavigationMenu` + `Sheet` mobile + `DropdownMenu` untuk lang/theme + wallet button |
| 1.3 | Build `Footer` | Clean footer dengan link, copyright, explorer links |
| 1.4 | Build `MobileNav` | Sheet-based drawer untuk mobile menu |
| 1.5 | Build shared components | `WalletButton`, `LanguageSwitcher`, `ThemeToggle`, `ExplorerLink`, `AddressDisplay` |
| 1.6 | Rewrite `layout.tsx` | Root layout dengan proper font loading, providers, metadata |

### Fase 2: Homepage
| # | Task | Detail |
|---|------|--------|
| 2.1 | Build `Hero` | Clean hero dengan heading, subtitle, 2 CTA buttons (Browse, Pipeline) |
| 2.2 | Build `Stats` | 4 stat cards (papers, articles, anchors, NFTs) pake Card component |
| 2.3 | Build `LatestPapers` | Grid 4 artikel terbaru pake Card + Badge |
| 2.4 | Build `HowItWorks` | 3-6 step cards — clean, numbered, dengan icon Lucide |
| 2.5 | Build `TechStack` | 4 cards untuk 0G services — status indicator, description |
| 2.6 | Assemble homepage | Gabung semua section di `page.tsx` |

### Fase 3: Browse Page
| # | Task | Detail |
|---|------|--------|
| 3.1 | Build `SearchBar` | Input + icon, proper Tailwind styling |
| 3.2 | Build `CategoryPills` | Horizontal scrollable pills pake Button variant |
| 3.3 | Build `PaperCard` | Card dengan thumbnail, title, tags, price badge, author |
| 3.4 | Build `ArticleCard` | Variant PaperCard dengan curated title + AI badge |
| 3.5 | Assemble browse | Tabs (Articles/Papers), grid layout, empty states |

### Fase 4: Article Detail Page
| # | Task | Detail |
|---|------|--------|
| 4.1 | Build `ArticleBody` | Clean typography, proper spacing, reading experience |
| 4.2 | Build `Paywall` | Blurred preview + unlock CTA — formal style |
| 4.3 | Build `AIScore` | Card dengan progress bars untuk 4 dimensions |
| 4.4 | Build `AIChat` | Collapsible chat widget — clean, tidak neon |
| 4.5 | Build `Sidebar` | Paper info card, tags, on-chain data |
| 4.6 | Build `OnChainData` | Anchor + NFT info dalam Card |
| 4.7 | Assemble article | 2-column layout (desktop), single column (mobile) |

### Fase 5: Upload Page
| # | Task | Detail |
|---|------|--------|
| 5.1 | Build upload form | Clean form pake shadcn Input, Textarea, Label |
| 5.2 | Build auth gate | Card-based wallet connect + verify flow |
| 5.3 | Build file upload area | Drag & drop zone dengan Lucide UploadCloud icon |
| 5.4 | Build price selector | Toggle free/paid + input field |
| 5.5 | Build progress bar | Upload progress dengan Skeleton state |

### Fase 6: Pipeline Wizard Page
| # | Task | Detail |
|---|------|--------|
| 6.1 | Build `PipelineForm` | Form mirip upload tapi untuk pipeline |
| 6.2 | Build `PipelineSteps` | Step tracker dengan status icons (Lucide) |
| 6.3 | Build `PipelineResult` | Result card dengan links ke explorer |
| 6.4 | Remove guided tour | Simplify — wizard form is self-explanatory |
| 6.5 | Assemble pipeline | Clean layout, step-by-step |

### Fase 7: Secondary Pages
| # | Task | Detail |
|---|------|--------|
| 7.1 | Build NFT Gallery | Grid NFT cards — clean variant tanpa neon |
| 7.2 | Build Profile | Wallet profile + stats + activity list |
| 7.3 | Build Verify | Input hash + result card (verified/not found) |
| 7.4 | Build Tech page | Services grid + pipeline steps + contracts list |
| 7.5 | Build Analytics | Stats cards + bar chart + tables |
| 7.6 | Build Leaderboard | Tabs + ranked list |

### Fase 8: Polish & Testing
| # | Task | Detail |
|---|------|--------|
| 8.1 | Responsive audit | Test semua halaman di mobile/tablet |
| 8.2 | Dark mode | Pastikan semua halaman support dark mode via shadcn |
| 8.3 | Loading states | Skeleton components untuk semua data loading |
| 8.4 | Error states | Proper error UI, tidak ada "broken" states |
| 8.5 | Build test | `npm run build` harus sukses tanpa error |
| 8.6 | Final cleanup | Hapus file lama (Web3UI.js, dll), update .gitignore |

---

## 🔢 Estimasi
- **Fase 0 (Setup):** ~30 min
- **Fase 1 (Core):** ~1-2 jam
- **Fase 2 (Homepage):** ~1-2 jam
- **Fase 3 (Browse):** ~1 jam
- **Fase 4 (Article):** ~1-2 jam
- **Fase 5 (Upload):** ~45 min
- **Fase 6 (Pipeline):** ~45 min
- **Fase 7 (Secondary):** ~2-3 jam
- **Fase 8 (Polish):** ~1 jam
- **Total:** ~8-12 jam kerja

## ⚠️ Yang TIDAK Berubah
- **Backend** — semua API endpoint tetap sama
- **Smart contracts** — tidak tersentuh
- **Business logic** — wallet auth, payment, AI pipeline tetap
- **i18n translations** — reuse translations yang ada
- **Database** — tidak ada perubahan schema

## 🗑️ Yang Dihapus
- `src/components/Web3UI.js` (551 baris neon/glass) → diganti shadcn
- `src/ThemeContext.js` → `src/contexts/theme.tsx`
- `src/LanguageContext.js` → `src/contexts/language.tsx`
- Semua inline `style={{}}` → Tailwind classes
- Semua CSS animasi neon/glass → subtle Tailwind transitions
- `framer-motion` import berlebihan → gunakan sparingly atau CSS transitions
