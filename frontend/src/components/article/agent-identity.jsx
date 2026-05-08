"use client"

import { useState, useEffect } from "react"
import { Bot, ExternalLink, Shield, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EXPLORER_URL } from "@/lib/constants"
import { getApiUrl } from "@/lib/api-url"

export function AgentIdentity({ article }) {
  const [agentData, setAgentData] = useState(null)
  const [loading, setLoading] = useState(true)

  const agentTokenId = article?.agent_token_id
  const agentMeta = article?.agent_meta

  useEffect(() => {
    if (!agentTokenId) {
      setLoading(false)
      return
    }
    fetch(`${getApiUrl()}/api/papers/agent/${agentTokenId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setAgentData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [agentTokenId])

  if (loading) return null

  // Fallback: show pipeline info from agent_meta without on-chain data
  if (!agentData) {
    if (agentMeta?.agents_used?.length > 0) {
      return (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                AI Curation Agent
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Multi-Agent Pipeline: {agentMeta.agents_used.join(", ")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Powered by 0G Compute Network
            </p>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  const stats = agentData.stats

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              On-Chain Agent Identity
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600 dark:text-emerald-400">
            <Shield className="h-3 w-3 mr-1" />
            VERIFIED
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Agent name and type */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold">{agentData.name}</span>
            <Badge variant="secondary" className="text-[10px]">
              {agentData.agentTypeName}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {agentData.description}
          </p>
        </div>

        <Separator />

        {/* Model */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Model:</span>
          <span className="font-mono text-[11px]">{agentData.model}</span>
        </div>

        {/* Capabilities */}
        {agentData.capabilities?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agentData.capabilities.map((cap, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">
                {cap}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        {stats && stats.papers_curated > 0 && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span className="font-medium">Performance</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Papers curated</span>
                  <p className="font-semibold">{stats.papers_curated}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg score</span>
                  <p className="font-semibold">{stats.avg_score}/100</p>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* On-chain link */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Agent NFT #{agentData.tokenId}
          </span>
          <a
            href={`${EXPLORER_URL}/address/${agentData.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
          >
            View Contract
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <p className="text-[10px] text-muted-foreground/50 italic">
          ERC-7857 inspired on-chain agent identity
        </p>
      </CardContent>
    </Card>
  )
}
