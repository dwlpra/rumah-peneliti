"use client"

import Link from "next/link"
import { BookOpen, Tag, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STRIP_GRADIENTS = [
  "from-blue-500/10 to-indigo-500/10",
  "from-sky-500/10 to-cyan-500/10",
  "from-violet-500/10 to-purple-500/10",
  "from-emerald-500/10 to-teal-500/10",
]

export function ArticleCard({ article, index = 0 }) {
  const isFree = !article.price_wei || Number(article.price_wei) === 0
  const priceEth = isFree ? null : (Number(article.price_wei) / 1e18).toFixed(4)
  const gradient = STRIP_GRADIENTS[index % STRIP_GRADIENTS.length]

  return (
    <Link href={`/article/${article.paper_id}`} className="group block">
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
          {/* Badges row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isFree ? (
              <Badge variant="success">Free</Badge>
            ) : (
              <Badge variant="secondary">{priceEth} 0G</Badge>
            )}
            {article.classification?.difficulty && (
              <Badge variant="outline" className="capitalize text-xs">
                {article.classification.difficulty}
              </Badge>
            )}
            {article.nft_token_id && (
              <Badge variant="secondary" className="gap-1">
                <Award className="h-3 w-3" />
                NFT
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.curated_title}
          </h3>

          {/* Summary */}
          {article.summary && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          )}

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
              {article.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>AI Curated</span>
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
