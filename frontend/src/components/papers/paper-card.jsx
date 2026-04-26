"use client"

import Link from "next/link"
import { FileText, User, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STRIP_GRADIENTS = [
  "from-blue-500/10 to-indigo-500/10",
  "from-sky-500/10 to-cyan-500/10",
  "from-violet-500/10 to-purple-500/10",
  "from-emerald-500/10 to-teal-500/10",
]

export function PaperCard({ paper, index = 0 }) {
  const isFree = !paper.price_wei || Number(paper.price_wei) === 0
  const priceEth = isFree ? null : (Number(paper.price_wei) / 1e18).toFixed(4)
  const gradient = STRIP_GRADIENTS[index % STRIP_GRADIENTS.length]

  return (
    <Link href={`/article/${paper.id}`} className="group block">
      <Card
        className={cn(
          "overflow-hidden transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-md"
        )}
      >
        {/* Colored top strip */}
        <div
          className={cn(
            "h-1.5 bg-gradient-to-r",
            gradient,
            "group-hover:h-2 transition-all duration-200"
          )}
        />

        <CardContent className="p-4 space-y-3">
          {/* Price badge */}
          <div className="flex items-center gap-2">
            {isFree ? (
              <Badge variant="success">Free</Badge>
            ) : (
              <Badge variant="secondary">
                {priceEth} 0G
              </Badge>
            )}
            {paper.classification?.difficulty && (
              <Badge variant="outline" className="capitalize text-xs">
                {paper.classification.difficulty}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {paper.title}
          </h3>

          {/* Authors */}
          {paper.authors && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{paper.authors}</span>
            </div>
          )}

          {/* Footer: date + read more */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {paper.upload_date
                  ? new Date(paper.upload_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Read more →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
