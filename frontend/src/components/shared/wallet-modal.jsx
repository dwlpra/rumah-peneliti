"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useWallet } from "@/contexts/wallet"

// Wallet identifiers — each wallet extension sets a unique flag on its provider
const KNOWN_WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    check: (p) => p.isMetaMask === true,
    color: "bg-orange-500/10",
    download: "https://metamask.io/download/",
    icon: "metamask",
  },
  {
    id: "backpack",
    name: "Backpack",
    check: (p) => p.isBackpack === true,
    color: "bg-violet-500/10",
    download: "https://backpack.app/",
    icon: "backpack",
  },
  {
    id: "haha",
    name: "HaHa Wallet",
    check: (p) => p.isHaHa === true || p.isHaha === true,
    color: "bg-yellow-500/10",
    download: "https://hahawallet.com/",
    icon: "haha",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    check: (p) => p.isCoinbaseWallet === true,
    color: "bg-blue-500/10",
    download: "https://www.coinbase.com/wallet",
    icon: "coinbase",
  },
  {
    id: "brave",
    name: "Brave Wallet",
    check: (p) => p.isBraveWallet === true,
    color: "bg-orange-600/10",
    download: "https://brave.com/wallet/",
    icon: "brave",
  },
  {
    id: "okx",
    name: "OKX Wallet",
    check: (p) => p.isOkxWallet === true,
    color: "bg-gray-800/10",
    download: "https://www.okx.com/web3",
    icon: "okx",
  },
  {
    id: "rabby",
    name: "Rabby Wallet",
    check: (p) => p.isRabby === true,
    color: "bg-sky-500/10",
    download: "https://rabby.io/",
    icon: "rabby",
  },
]

function getProviders() {
  if (typeof window === "undefined" || !window.ethereum) return []
  // Multiple wallets: providers array exists (EIP-1193 multi-provider)
  if (window.ethereum.providers && window.ethereum.providers.length > 0) {
    return window.ethereum.providers
  }
  return [window.ethereum]
}

function detectWallets() {
  const providers = getProviders()
  if (providers.length === 0) return { detected: [], hasAny: false }

  const detected = []
  const matchedProviders = new Set()

  // For each known wallet, find its provider
  for (const wallet of KNOWN_WALLETS) {
    for (const provider of providers) {
      if (wallet.check(provider)) {
        detected.push({ ...wallet, provider })
        matchedProviders.add(provider)
        break
      }
    }
  }

  // Any unmatched providers → show as generic "EVM Wallet"
  for (const provider of providers) {
    if (!matchedProviders.has(provider)) {
      detected.push({
        id: "evm",
        name: provider._brandingInfo?.name || "EVM Wallet",
        color: "bg-muted",
        provider,
        download: null,
        icon: "generic",
      })
    }
  }

  return { detected, hasAny: true }
}

export function WalletModal({ open, onOpenChange }) {
  const { connect } = useWallet()
  const [connecting, setConnecting] = useState(null) // wallet id being connected
  const { detected, hasAny } = typeof window !== "undefined" ? detectWallets() : { detected: [], hasAny: false }

  const handleConnect = async (wallet) => {
    setConnecting(wallet.id)
    try {
      await connect(wallet.provider)
      onOpenChange(false)
    } finally {
      setConnecting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2.5" />
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </svg>
            Connect Wallet
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to 0G Network.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-2">
          {detected.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet)}
              disabled={connecting !== null}
              className="flex items-center gap-3 w-full rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent hover:border-primary/50 disabled:opacity-50 disabled:cursor-wait"
            >
              <WalletIcon icon={wallet.icon} color={wallet.color} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{wallet.name}</div>
                <div className="text-xs text-muted-foreground">Detected</div>
              </div>
              {connecting === wallet.id ? (
                <span className="text-xs text-muted-foreground animate-pulse whitespace-nowrap">Connecting...</span>
              ) : (
                <span className="text-xs text-primary font-medium whitespace-nowrap">Connect</span>
              )}
            </button>
          ))}

          {/* No wallet at all */}
          {!hasAny && (
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                No wallet detected in your browser.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2"
                >
                  MetaMask
                </a>
                <span className="text-xs text-muted-foreground">&middot;</span>
                <a
                  href="https://backpack.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2"
                >
                  Backpack
                </a>
                <span className="text-xs text-muted-foreground">&middot;</span>
                <a
                  href="https://rabby.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2"
                >
                  Rabby
                </a>
                <span className="text-xs text-muted-foreground">&middot;</span>
                <a
                  href="https://www.okx.com/web3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2"
                >
                  OKX
                </a>
              </div>
            </div>
          )}

          {/* Info note */}
          <p className="text-xs text-muted-foreground text-center pt-1">
            Connects to 0G Mainnet (Chain ID 16661)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WalletIcon({ icon, color }) {
  const bg = color || "bg-muted"
  // Wallets with proper logo files in /wallets/
  if (icon === "metamask" || icon === "backpack") {
    return (
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/wallets/${icon}.svg`}
          alt={icon}
          width={icon === "metamask" ? 26 : 24}
          height={icon === "metamask" ? 26 : 24}
        />
      </div>
    )
  }
  // Coinbase — blue circle with "C" letter
  if (icon === "coinbase") {
    return (
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#0052FF"/>
          <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12c6.26 0 11.427-4.62 12.246-10.667h-6.82C24.805 23.307 22.629 25 20 25c-2.761 0-5-2.239-5-5s2.239-5 5-5c2.629 0 4.805 1.693 5.426 3.667h6.82C31.427 12.62 26.26 8 20 8z" fill="white"/>
        </svg>
      </div>
    )
  }
  // Generic wallet fallback
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2.5"/>
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
      </svg>
    </div>
  )
}
