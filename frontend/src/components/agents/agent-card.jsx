"use client"

import { Bot, ExternalLink, Shield, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { EXPLORER_URL, CONTRACTS } from "@/lib/constants"

function getScoreColor(score) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

export function AgentCard({ agent }) {
  const stats = agent.stats || {}

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">
                Agent NFT #{agent.tokenId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {agent.active && (
              <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600 dark:text-emerald-400">
                <Shield className="h-3 w-3 mr-0.5" />
                VERIFIED
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px]">
              {agent.agentTypeName}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {agent.description}
        </p>

        {/* Model */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Model:</span>
          <span className="font-mono text-[11px] truncate">{agent.model}</span>
        </div>

        {/* Capabilities */}
        {agent.capabilities?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.map((cap, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">
                {cap}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span className="font-medium">Performance Stats</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-lg font-bold">{stats.papers_curated || 0}</p>
              <p className="text-[10px] text-muted-foreground">Papers Curated</p>
            </div>
            <div>
              <p className={`text-lg font-bold ${getScoreColor(stats.avg_score || 0)}`}>
                {stats.avg_score || 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Avg Score /100</p>
            </div>
          </div>

          {/* Score breakdown */}
          {(stats.avg_novelty > 0 || stats.avg_clarity > 0 || stats.avg_methodology > 0 || stats.avg_impact > 0) && (
            <div className="space-y-2">
              {[
                { label: "Novelty", value: stats.avg_novelty || 0, color: "bg-blue-500" },
                { label: "Clarity", value: stats.avg_clarity || 0, color: "bg-emerald-500" },
                { label: "Methodology", value: stats.avg_methodology || 0, color: "bg-amber-500" },
                { label: "Impact", value: stats.avg_impact || 0, color: "bg-purple-500" },
              ].map((dim) => (
                <div key={dim.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground">{dim.label}</span>
                    <span className="text-[10px] font-medium">{dim.value}</span>
                  </div>
                  <Progress value={dim.value} className="h-1.5" />
                </div>
              ))}
            </div>
          )}

          {stats.last_activity && (
            <p className="text-[10px] text-muted-foreground">
              Last active: {new Date(stats.last_activity).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-2">
          <a
            href={`${EXPLORER_URL}/address/${CONTRACTS.agentNFT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
          >
            View Contract <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
