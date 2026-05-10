"use client"

import { useState } from "react"
import { Wallet, LogOut, ChevronDown, User, Trophy, Copy, Check, Sun, Moon, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useWallet } from "@/contexts/wallet"
import { useTheme } from "@/contexts/theme"
import { useLanguage } from "@/contexts/language"
import { WalletModal } from "@/components/shared/wallet-modal"

const LANGUAGES = [
  { code: "en", label: "English", flag: "EN" },
  { code: "id", label: "Bahasa Indonesia", flag: "ID" },
  { code: "cn", label: "中文", flag: "CN" },
]

export function WalletButton() {
  const { address, disconnect, balance } = useWallet()
  const { toggleTheme, isDark } = useTheme()
  const { lang, setLang } = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!address) {
    return (
      <>
        <Button onClick={() => setModalOpen(true)} size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </Button>
        <WalletModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="font-mono text-sm">{address.slice(0, 6)}...{address.slice(-4)}</span>
          {balance && (
            <Badge variant="secondary" className="text-xs">
              {balance} 0G
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-mono text-xs flex items-center gap-1.5">
          {address.slice(0, 10)}...{address.slice(-8)}
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(address)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              } catch {}
            }}
            className="inline-flex items-center p-0.5 rounded hover:bg-muted transition-colors"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3 opacity-50" />
            )}
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {balance && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Balance: <span className="font-semibold text-foreground">{balance} 0G</span>
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer sm:hidden">
          {isDark ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          {isDark ? "Light Mode" : "Dark Mode"}
        </DropdownMenuItem>
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`cursor-pointer sm:hidden ${lang === l.code ? "bg-accent" : ""}`}
          >
            <Globe className="mr-2 h-4 w-4" />
            <span className="font-semibold mr-1">{l.flag}</span> {l.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="sm:hidden" />
        <DropdownMenuItem asChild>
          <Link href="/leaderboard" className="flex items-center cursor-pointer">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnect} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
