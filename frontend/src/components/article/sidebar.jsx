"use client"

import { FileText, User, Tag, CheckCircle, Lock, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { OnChainData } from "@/components/article/on-chain-data"
import { useLanguage } from "@/contexts/language"
import { getApiUrl } from "@/lib/api-url"

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "16661", 10)
const NETWORK_NAME = CHAIN_ID === 16661 ? "0G Mainnet" : "0G Testnet"

export function Sidebar({ article, paper, unlocked, isFree, priceEth, address }) {
  const { t } = useLanguage()

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      {/* Network */}
      <div className="flex items-center gap-2 px-1">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
        <Badge variant="secondary" className="text-xs font-medium">
          {NETWORK_NAME}
        </Badge>
      </div>

      {/* Paper Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Paper Info
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Original title */}
          {article.paper_title && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("article_original") || "Original Title"}
              </p>
              <p className="text-sm leading-relaxed italic">
                {article.paper_title}
              </p>
            </div>
          )}

          {/* Authors */}
          {paper?.authors && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {t("label_authors") || "Authors"}
                </p>
              </div>
              <p className="text-sm">{paper.authors}</p>
            </div>
          )}

          <Separator />

          {/* Price */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {t("article_price") || "Price"}
            </p>
            <p
              className={`text-lg font-bold ${
                isFree ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
              }`}
            >
              {isFree ? "Free" : `${priceEth} 0G`}
            </p>
          </div>

          {/* Access status */}
          <div
            className={`rounded-md p-3 text-center text-sm font-medium ${
              unlocked || isFree
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {unlocked || isFree ? (
              <span className="flex items-center justify-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Free Access
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Lock className="h-4 w-4" />
                Locked
              </span>
            )}
          </div>

          {/* Download from 0G Storage */}
          {(unlocked || isFree) && paper?.storage_hash && (
            <a
              href={`${getApiUrl()}/api/papers/${paper.id}/download${address ? `?wallet=${address}` : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <Download className="h-4 w-4" />
              Download from 0G Storage
            </a>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      {article.tags?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Tags
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tg, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  #{tg}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* On-Chain Data */}
      <OnChainData paperId={paper?.id || article?.paper_id} />
    </aside>
  )
}
