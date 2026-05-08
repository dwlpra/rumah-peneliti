"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Home,
  Search,
  Upload,
  Trophy,
  Award,
  ShieldCheck,
  Settings2,
  BarChart3,
  Bot,
  Menu,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { LanguageSwitcher } from "@/components/shared/language-switcher"
import { WalletButton } from "@/components/shared/wallet-button"
import { useLanguage } from "@/contexts/language"
import { cn } from "@/lib/utils"

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "16661", 10)
const NETWORK_NAME = CHAIN_ID === 16661 ? "0G Mainnet" : "0G Testnet"

const MAIN_LINKS = [
  { href: "/", labelKey: "nav_home", icon: Home },
  { href: "/browse", labelKey: "nav_browse", icon: Search },
  { href: "/upload", labelKey: "nav_upload", icon: Upload },
  { href: "/nfts", label: "NFTs", icon: Award },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
]

const MORE_LINKS = [
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/tech", label: "Tech", icon: Settings2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

export function Navbar() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const renderLink = (link, mobile = false) => {
    const Icon = link.icon
    const label = link.labelKey ? t(link.labelKey) : link.label
    const active = isActive(link.href)

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => mobile && setMobileOpen(false)}
        className={cn(
          "flex items-center gap-2 text-sm font-medium transition-colors",
          mobile && "px-3 py-2 rounded-md",
          active
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-xl items-center px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center gap-2 font-bold">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-lg">
            Rumah<span className="text-primary">Peneliti</span>
          </span>
        </Link>

        {/* Desktop: Main links */}
        <nav className="hidden md:flex items-center gap-5">
          {MAIN_LINKS.map((link) => renderLink(link))}
        </nav>

        {/* Desktop: More dropdown */}
        <div className="hidden md:block ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
                <span className="text-xs">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {MORE_LINKS.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="flex items-center gap-2 cursor-pointer">
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1.5 rounded-md border px-2 py-1 hover:bg-accent transition-colors">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                <span className="text-xs font-medium">{NETWORK_NAME}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2" disabled={CHAIN_ID !== 16661}>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                <span className="text-xs font-medium">0G Mainnet</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" disabled>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                <span className="text-xs text-muted-foreground">0G Testnet</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <WalletButton />
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden ml-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Rumah<span className="text-primary">Peneliti</span>
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <div className="flex flex-col gap-1.5 px-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                  <span className="text-xs font-medium">{NETWORK_NAME}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-40">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground">0G Testnet</span>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {MAIN_LINKS.map((link) => renderLink(link, true))}
                <Separator className="my-2" />
                {MORE_LINKS.map((link) => renderLink(link, true))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
