"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function AddressDisplay({ address, className }) {
  const [copied, setCopied] = useState(false)

  if (!address) return null

  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      title={address}
    >
      <span>{truncated}</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  )
}
