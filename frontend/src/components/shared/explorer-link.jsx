import { ExternalLink } from "lucide-react"
import { EXPLORER_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function ExplorerLink({ type = "tx", value, label, className }) {
  if (!value) return null

  const href = `${EXPLORER_URL}/${type}/${value}`
  const displayLabel = label || `${value.slice(0, 10)}...${value.slice(-6)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-sm text-primary hover:underline font-mono",
        className
      )}
    >
      <span>{displayLabel}</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}
