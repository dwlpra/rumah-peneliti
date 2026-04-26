"use client"

import { CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExplorerLink } from "@/components/shared/explorer-link"

export function PipelineResult({ result }) {
  if (!result) return null

  const paper = result.paper
  const pipeline = result.pipeline

  return (
    <Card className="border-emerald-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="h-5 w-5" />
          Pipeline Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Paper info */}
        <div className="space-y-2">
          {paper?.id && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Paper ID:</span>
              <Badge variant="secondary">{paper.id}</Badge>
            </div>
          )}
          {paper?.title && (
            <div className="text-sm">
              <span className="text-muted-foreground">Title: </span>
              <span className="font-medium">{paper.title}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Transaction info */}
        <div className="space-y-2">
          {pipeline?.chainAnchor && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Transaction:</span>
              <ExplorerLink type="tx" value={pipeline.chainAnchor} />
            </div>
          )}
          {pipeline?.chainPaperId && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">On-chain ID:</span>
              <Badge variant="outline" className="font-mono">
                {pipeline.chainPaperId}
              </Badge>
            </div>
          )}
          {pipeline?.storageUploaded && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Storage:</span>
              <Badge variant="success">Uploaded to 0G</Badge>
            </div>
          )}
          {pipeline?.daProof && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">DA Proof:</span>
              <Badge variant="success">Published</Badge>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {paper?.id && (
            <Button asChild>
              <Link href={`/article/${paper.id}`} className="gap-1.5">
                View Article
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
