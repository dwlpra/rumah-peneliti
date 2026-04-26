"use client"

import { useState, useEffect } from "react"
import { Pin, Award, FileText, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ExplorerLink } from "@/components/shared/explorer-link"
import { getApiUrl } from "@/lib/api-url"

export function OnChainData({ paperId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!paperId) return
    fetch(`${getApiUrl()}/api/papers/${paperId}/onchain`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [paperId])

  if (loading) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    )
  }

  if (!data?.anchor && !data?.nft) {
    return (
      <Card className="mt-4">
        <CardContent className="py-6 text-center">
          <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Not yet processed through the pipeline
          </p>
        </CardContent>
      </Card>
    )
  }

  const isZeroRoot = (root) =>
    !root || root === "0x" + "0".repeat(64)

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
          On-Chain Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Anchor */}
        {data.anchor && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Pin className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Anchored on 0G</span>
              <Badge variant="success">CONFIRMED</Badge>
            </div>
            <ExplorerLink
              type="tx"
              value={data.anchor.txHash}
              label={`Tx: ${data.anchor.txHash.slice(0, 16)}...`}
              className="text-xs"
            />
            {!isZeroRoot(data.anchor.storageRoot) && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-mono">
                <Package className="h-3 w-3" />
                <span>Storage: {data.anchor.storageRoot.slice(0, 18)}...</span>
              </div>
            )}
          </div>
        )}

        {/* NFT */}
        {data.nft && (
          <>
            {data.anchor && <Separator />}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-semibold">
                  Research NFT #{data.nft.tokenId}
                </span>
                <Badge variant="secondary">MINTED</Badge>
              </div>
              <ExplorerLink
                type="tx"
                value={data.nft.txHash}
                label={`Tx: ${data.nft.txHash.slice(0, 16)}...`}
                className="text-xs"
              />
            </div>
          </>
        )}

        {/* Article anchors count */}
        {data.articleAnchors?.length > 0 && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">
              {data.articleAnchors.length} article(s) anchored
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
