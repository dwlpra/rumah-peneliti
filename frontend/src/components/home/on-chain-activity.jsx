"use client"

import { useState, useEffect } from "react"
import { Pin, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExplorerLink } from "@/components/shared/explorer-link"
import { getApiUrl } from "@/lib/api-url"

function ActivityRow({ item }) {
  const isNft = item.type === "nft"

  return (
    <div className="flex items-center gap-3 border-b py-3 last:border-b-0">
      {/* Icon */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        isNft ? "bg-purple-100 dark:bg-purple-900/30" : "bg-amber-100 dark:bg-amber-900/30"
      }`}>
        {isNft ? (
          <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        ) : (
          <Pin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          {isNft
            ? `NFT #${item.tokenId} Minted`
            : `Paper #${item.paperId} Anchored`
          }
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          Block #{item.blockNumber || "?"}
        </p>
      </div>

      {/* Explorer link */}
      {item.txHash && (
        <ExplorerLink
          type="tx"
          value={item.txHash}
          label={`${item.txHash.slice(0, 8)}...`}
          className="text-xs shrink-0"
        />
      )}
    </div>
  )
}

export function OnChainActivity() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${getApiUrl()}/api/activity`)
      .then(r => r.json())
      .then(d => {
        setActivity(d.activity || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="bg-background pb-12 md:pb-16">
      <div className="container mx-auto max-w-screen-xl px-4 pt-12 md:pt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent On-chain Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No on-chain activity yet. Be the first to anchor a paper!
              </p>
            ) : (
              <div>
                {activity.slice(0, 6).map((item, i) => (
                  <ActivityRow key={item.txHash || i} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
