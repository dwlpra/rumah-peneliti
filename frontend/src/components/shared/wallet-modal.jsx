"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useWallet } from "@/contexts/wallet"

// Wallet definitions with multiple detection strategies
// Each wallet can be detected via:
//   - Provider flags on window.ethereum (isMetaMask, isRabby, etc.)
//   - Separate injection points (window.rabby, window.okxwallet, etc.)
const KNOWN_WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    flags: ["isMetaMask"],
    injectPoint: null,
    color: "bg-orange-500/10",
    download: "https://metamask.io/download/",
    icon: "metamask",
  },
  {
    id: "rabby",
    name: "Rabby Wallet",
    flags: ["isRabby"],
    injectPoint: "rabby",
    color: "bg-sky-500/10",
    download: "https://rabby.io/",
    icon: "rabby",
  },
  {
    id: "okx",
    name: "OKX Wallet",
    flags: ["isOkxWallet"],
    injectPoint: "okxwallet",
    color: "bg-gray-800/10",
    download: "https://www.okx.com/web3",
    icon: "okx",
  },
  {
    id: "backpack",
    name: "Backpack",
    flags: ["isBackpack"],
    injectPoint: "backpack",
    color: "bg-violet-500/10",
    download: "https://backpack.app/",
    icon: "backpack",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    flags: ["isCoinbaseWallet"],
    injectPoint: "coinbaseWalletExtension",
    color: "bg-blue-500/10",
    download: "https://www.coinbase.com/wallet",
    icon: "coinbase",
  },
  {
    id: "haha",
    name: "HaHa Wallet",
    flags: ["isHaHa", "isHaha"],
    injectPoint: "hahaWallet",
    color: "bg-yellow-500/10",
    download: "https://hahawallet.com/",
    icon: "haha",
  },
  {
    id: "brave",
    name: "Brave Wallet",
    flags: ["isBraveWallet"],
    injectPoint: null,
    color: "bg-orange-600/10",
    download: "https://brave.com/wallet/",
    icon: "brave",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    flags: ["isTrust"],
    injectPoint: "trustwallet",
    color: "bg-blue-600/10",
    download: "https://trustwallet.com/",
    icon: "trust",
  },
  {
    id: "bitget",
    name: "BitGet Wallet",
    flags: ["isBitKeep", "isBitget"],
    injectPoint: "bitkeep",
    color: "bg-emerald-500/10",
    download: "https://web3.bitget.com/",
    icon: "bitget",
  },
  {
    id: "phantom",
    name: "Phantom",
    flags: ["isPhantom"],
    injectPoint: "phantom",
    color: "bg-purple-500/10",
    download: "https://phantom.app/",
    icon: "phantom",
  },
]

/**
 * Collect ALL available EIP-1193 providers from every possible source:
 *   1. window.ethereum.providers (multi-wallet)
 *   2. window.ethereum itself (single wallet override)
 *   3. Wallet-specific injection points (window.rabby, window.okxwallet, etc.)
 */
function getAllProviders() {
  if (typeof window === "undefined") return []

  const providers = []
  const seen = new Set()

  function addProvider(p) {
    if (!p || seen.has(p)) return
    seen.add(p)
    providers.push(p)
  }

  // 1) window.ethereum.providers array (EIP-1193 multi-wallet)
  if (window.ethereum?.providers) {
    for (const p of window.ethereum.providers) {
      addProvider(p)
    }
  }

  // 2) window.ethereum itself
  if (window.ethereum) {
    addProvider(window.ethereum)
  }

  // 3) Wallet-specific injection points
  for (const wallet of KNOWN_WALLETS) {
    if (!wallet.injectPoint) continue
    const injected = window[wallet.injectPoint]
    if (injected) {
      // Some wallets expose the provider directly, others have .ethereum or .provider
      const provider = injected.ethereum || injected.provider || injected
      if (provider && typeof provider.request === "function") {
        addProvider(provider)
      }
    }
  }

  return providers
}

/**
 * Check if a provider matches a known wallet via its flags
 */
function providerMatches(provider, wallet) {
  for (const flag of wallet.flags) {
    if (provider[flag] === true) return true
  }
  return false
}

/**
 * Detect all available wallets
 */
function detectWallets() {
  const providers = getAllProviders()
  if (providers.length === 0) return { detected: [], hasAny: false }

  const detected = []
  const detectedIds = new Set()
  const matchedProviders = new Set()

  // Match known wallets (each wallet only once)
  for (const wallet of KNOWN_WALLETS) {
    if (detectedIds.has(wallet.id)) continue
    for (const provider of providers) {
      if (matchedProviders.has(provider)) continue
      if (providerMatches(provider, wallet)) {
        detected.push({ ...wallet, provider })
        detectedIds.add(wallet.id)
        matchedProviders.add(provider)
        break
      }
    }
  }

  // Unmatched providers → generic wallet, but skip if same wallet identity already detected
  for (const provider of providers) {
    if (matchedProviders.has(provider)) continue

    // Skip if this provider matches a known wallet we already found (different object, same wallet)
    let alreadyDetected = false
    for (const wallet of KNOWN_WALLETS) {
      if (detectedIds.has(wallet.id) && providerMatches(provider, wallet)) {
        alreadyDetected = true
        break
      }
    }
    if (alreadyDetected) continue

    const name = guessWalletName(provider) || provider._brandingInfo?.name || "Browser Wallet"
    detected.push({
      id: `evm-${detected.length}`,
      name,
      color: "bg-muted",
      provider,
      download: null,
      icon: "generic",
    })
    matchedProviders.add(provider)
  }

  return { detected, hasAny: detected.length > 0 }
}

/**
 * Try to guess wallet name from provider flags for generic entries
 */
function guessWalletName(provider) {
  const hints = []
  if (provider.isMetaMask) hints.push("MetaMask")
  if (provider.isRabby) hints.push("Rabby")
  if (provider.isBackpack) hints.push("Backpack")
  if (provider.isOkxWallet) hints.push("OKX")
  if (provider.isCoinbaseWallet) hints.push("Coinbase")
  if (provider.isTrust) hints.push("Trust")
  if (provider.isBitKeep) hints.push("BitGet")
  if (provider.isBitget) hints.push("BitGet")
  if (provider.isBraveWallet) hints.push("Brave")
  if (provider.isHaHa || provider.isHaha) hints.push("HaHa")
  if (provider.isPhantom) hints.push("Phantom")
  return hints.length > 0 ? hints.join(" / ") : null
}

export function WalletModal({ open, onOpenChange }) {
  const { connect } = useWallet()
  const [connecting, setConnecting] = useState(null)
  const [wallets, setWallets] = useState({ detected: [], hasAny: false })

  // Re-detect wallets every time modal opens
  useEffect(() => {
    if (open) {
      setWallets(detectWallets())
    }
  }, [open])

  const handleConnect = async (wallet) => {
    setConnecting(wallet.id)
    try {
      await connect(wallet.provider)
      onOpenChange(false)
    } finally {
      setConnecting(null)
    }
  }

  const { detected, hasAny } = wallets

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
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-2">MetaMask</a>
                <span className="text-xs text-muted-foreground">&middot;</span>
                <a href="https://rabby.io/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-2">Rabby</a>
                <span className="text-xs text-muted-foreground">&middot;</span>
                <a href="https://backpack.app/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-2">Backpack</a>
                <span className="text-xs text-muted-foreground">&middot;</span>
                <a href="https://www.okx.com/web3" target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-2">OKX</a>
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
