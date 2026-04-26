"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "All",
  "blockchain",
  "machine-learning",
  "security",
  "storage",
  "smart-contracts",
  "web3",
  "defi",
  "nft",
  "cryptography",
  "consensus",
]

export function CategoryPills({ active, onChange }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat
        return (
          <Button
            key={cat}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(cat)}
            className={cn(
              "shrink-0 rounded-full text-xs font-medium capitalize",
              isActive && "shadow-sm"
            )}
          >
            {cat === "All" ? "All" : `#${cat}`}
          </Button>
        )
      })}
    </div>
  )
}
