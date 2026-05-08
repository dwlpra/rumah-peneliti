"use client"

import { useState } from "react"
import { Bot, ExternalLink, Shield, Activity, Coffee, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { EXPLORER_URL, CONTRACTS } from "@/lib/constants"

const TIP_AMOUNTS = [
  { label: "0.001", wei: "1000000000000000" },
  { label: "0.005", wei: "5000000000000000" },
  { label: "0.01", wei: "10000000000000000" },
]

function getScoreColor(score) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

export function AgentCard({ agent }) {
  const stats = agent.stats || {}
  const tips = agent.tips || {}
  const [selectedTip, setSelectedTip] = useState(0)
  const [tipping, setTipping] = useState(false)
  const [tipSuccess, setTipSuccess] = useState(false)

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

      const amount = TIP_AMOUNTS[selectedTip].wei
      const tx = await contract.tipAgent(BigInt(agent.tokenId), "", {
        value: BigInt(amount),
      })
      await tx.wait()
      setTipSuccess(true)
      setTimeout(() => setTipSuccess(false), 3000)
    } catch (e) {
      if (e.code !== 4001) {
        console.error("Tip failed:", e)
      }
    }
    setTipping(false)
  }

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
                { label: "Novelty", value: stats.avg_novelty || 0 },
                { label: "Clarity", value: stats.avg_clarity || 0 },
                { label: "Methodology", value: stats.avg_methodology || 0 },
                { label: "Impact", value: stats.avg_impact || 0 },
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

        <Separator />

        {/* Tip Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Coffee className="h-3 w-3" />
            <span className="font-medium">Tip this Agent</span>
            {Number(tips.totalTips || 0) > 0 && (
              <span className="ml-auto text-[10px] font-mono">
                {Number(tips.totalTips).toFixed(4)} 0G earned
              </span>
            )}
          </div>

          {/* Amount selector */}
          <div className="flex gap-1.5">
            {TIP_AMOUNTS.map((amt, i) => (
              <button
                key={i}
                onClick={() => setSelectedTip(i)}
                className={`flex-1 rounded-md border px-2 py-1 text-[11px] font-mono transition-colors ${
                  selectedTip === i
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {amt.label}
              </button>
            ))}
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
                Tip {TIP_AMOUNTS[selectedTip].label} 0G
              </>
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            Funds agent's 0G Compute usage
          </p>
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
