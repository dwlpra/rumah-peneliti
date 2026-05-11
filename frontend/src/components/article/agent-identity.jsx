"use client"

import { useState, useEffect } from "react"
import { Bot, ExternalLink, Shield, Activity, Coffee, Loader2, Fingerprint } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { EXPLORER_URL, CONTRACTS } from "@/lib/constants"
import { getApiUrl } from "@/lib/api-url"

export function AgentIdentity({ article }) {
  const [agentData, setAgentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tipping, setTipping] = useState(false)
  const [tipSuccess, setTipSuccess] = useState(false)

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

  const handleTip = async () => {
    if (!window.ethereum) {
      alert("Please install a wallet to tip agents")
      return
    }

    setTipping(true)
    setTipSuccess(false)
    try {
      const { ethers } = await import("ethers")
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACTS.agentTipJar,
        ["function tipAgent(uint256 tokenId, string calldata message) external payable"],
        signer
      )
      const tx = await contract.tipAgent(BigInt(agentData.tokenId), "", {
        value: BigInt("1000000000000000"), // 0.001 0G
      })
      await tx.wait()
      setTipSuccess(true)
      setTimeout(() => setTipSuccess(false), 3000)
    } catch (e) {
      if (e.code !== 4001) {
        /* Tip error: user rejected or network issue */
      }
    }
    setTipping(false)
  }

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
  const tips = agentData.tips || {}

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

        {/* Tip section */}
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Coffee className="h-3 w-3" />
            <span className="font-medium">Support this Agent</span>
            {Number(tips.totalTips || 0) > 0 && (
              <span className="ml-auto text-[10px] font-mono">
                {Number(tips.totalTips).toFixed(4)} 0G earned
              </span>
            )}
          </div>
          <Button
            onClick={handleTip}
            disabled={tipping}
            size="sm"
            className="w-full gap-1.5"
            variant={tipSuccess ? "outline" : "default"}
          >
            {tipping ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Confirming...
              </>
            ) : tipSuccess ? (
              <>
                <Coffee className="h-3 w-3" />
                Tipped!
              </>
            ) : (
              <>
                <Coffee className="h-3 w-3" />
                Tip 0.001 0G
              </>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Funds agent's 0G Compute usage
          </p>
        </div>

        <Separator />

        {/* On-chain link */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            0G Agentic ID #{agentData.tokenId}
          </span>
          <a
            href={`${EXPLORER_URL}/address/${agentData.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
          >
            Verify on Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* 0G Agentic ID Verification */}
        {agentData.agenticId && (
          <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                0G Agentic ID
              </span>
              <Badge variant="outline" className="text-[9px] border-blue-500 text-blue-600 dark:text-blue-400 ml-auto">
                ERC-7857
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Token #{agentData.agenticId.tokenId} • {agentData.agenticId.intelligentData?.length || 0} on-chain data hashes
            </p>
            <a
              href={agentData.agenticId.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:underline font-mono"
            >
              Verify on Explorer <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        )}

        {!agentData.agenticId && (
          <p className="text-[10px] text-muted-foreground/50 italic">
            ERC-7857 on-chain agent identity
          </p>
        )}
      </CardContent>
    </Card>
  )
}
