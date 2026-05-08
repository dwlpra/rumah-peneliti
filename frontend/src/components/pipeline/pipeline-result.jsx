"use client"

import { CheckCircle, ExternalLink, Award, Bot } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ExplorerLink } from "@/components/shared/explorer-link"

export function PipelineResult({ result }) {
  if (!result) return null

  const paper = result.paper
  const pipeline = result.pipeline
  const article = result.article
  const nft = result.nft

  // Compute AI score average
  const aiScore = article?.ai_score
  const avgScore = aiScore
    ? Math.round((aiScore.novelty + aiScore.clarity + aiScore.methodology + aiScore.impact) / 4)
    : null

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
          {article?.curated_title && article.curated_title !== paper?.title && (
            <div className="text-sm">
              <span className="text-muted-foreground">Curated Title: </span>
              <span className="font-medium">{article.curated_title}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* AI Score */}
        {aiScore && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-semibold">AI Research Score</span>
              <Badge variant={avgScore >= 70 ? "success" : avgScore >= 50 ? "secondary" : "destructive"} className="ml-auto font-mono">
                {avgScore}/100
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Novelty", value: aiScore.novelty, color: "bg-blue-500" },
                { label: "Clarity", value: aiScore.clarity, color: "bg-emerald-500" },
                { label: "Methodology", value: aiScore.methodology, color: "bg-amber-500" },
                { label: "Impact", value: aiScore.impact, color: "bg-purple-500" },
              ].map((dim) => (
                <div key={dim.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{dim.label}</span>
                    <span className="font-mono font-medium">{dim.value}</span>
                  </div>
                  <Progress value={dim.value} className="h-1.5" />
                </div>
              ))}
            </div>
            {article?.is_mock && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                Note: AI was unavailable, scores are estimated.
              </p>
            )}
          </div>
        )}

        <Separator />

        {/* On-chain results */}
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
          {nft && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">NFT:</span>
              <Award className="h-3.5 w-3.5 text-pink-500" />
              <Badge variant="success">#{nft.tokenId}</Badge>
              {nft.txHash && <ExplorerLink type="tx" value={nft.txHash} className="text-xs" />}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {paper?.id && (
            <Button asChild>
              <Link href={`/article/${paper.slug || paper.id}`} className="gap-1.5">
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
