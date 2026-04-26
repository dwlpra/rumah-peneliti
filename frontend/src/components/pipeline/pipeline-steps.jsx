"use client"

import { useState } from "react"
import {
  Upload,
  Brain,
  Database,
  ShieldCheck,
  Link2,
  Award,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "upload", title: "Upload", desc: "Paper uploaded to server", icon: Upload, color: "#3b82f6" },
  { id: "ai", title: "AI Curation", desc: "Multi-agent AI pipeline processing", icon: Brain, color: "#8b5cf6" },
  { id: "storage", title: "0G Storage", desc: "Upload to decentralized storage", icon: Database, color: "#06b6d4" },
  { id: "da", title: "DA Proof", desc: "Data availability proof", icon: ShieldCheck, color: "#10b981" },
  { id: "anchor", title: "On-chain Anchor", desc: "Anchor paper hash on blockchain", icon: Link2, color: "#f59e0b" },
  { id: "nft", title: "NFT Minting", desc: "Mint research NFT (ERC-721)", icon: Award, color: "#ec4899" },
]

function StatusIcon({ status }) {
  switch (status) {
    case "running":
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />
    case "completed":
      return <CheckCircle className="h-5 w-5 text-emerald-600" />
    case "error":
      return <AlertCircle className="h-5 w-5 text-destructive" />
    default:
      return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
  }
}

function StatusBadge({ status }) {
  switch (status) {
    case "running":
      return <Badge variant="default">Running</Badge>
    case "completed":
      return <Badge variant="success">Completed</Badge>
    case "error":
      return <Badge variant="destructive">Error</Badge>
    default:
      return <Badge variant="secondary">Pending</Badge>
  }
}

export function PipelineSteps({ stepState, currentStep }) {
  const [expanded, setExpanded] = useState(null)

  const toggleExpand = (stepId) => {
    setExpanded((prev) => (prev === stepId ? null : stepId))
  }

  return (
    <div className="space-y-3">
      {STEPS.map((step, i) => {
        const state = stepState[step.id] || { status: "pending", logs: [] }
        const Icon = step.icon
        const isActive = currentStep === step.id
        const isExpanded = expanded === step.id

        return (
          <Card
            key={step.id}
            className={cn(
              "overflow-hidden transition-all",
              isActive && "border-primary shadow-md",
              state.status === "completed" && "border-emerald-500/30",
              state.status === "error" && "border-destructive/30"
            )}
          >
            <div className="flex items-center gap-4 p-4">
              {/* Step number + icon */}
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <Icon className="h-5 w-5" style={{ color: step.color }} />
              </div>

              {/* Title + desc */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    state.status === "completed" && "text-emerald-700 dark:text-emerald-400"
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>

              {/* Status */}
              <StatusBadge status={state.status} />

              {/* Status icon */}
              <StatusIcon status={state.status} />

              {/* Expand toggle */}
              {state.logs.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleExpand(step.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Expandable logs */}
            {isExpanded && state.logs.length > 0 && (
              <CardContent className="border-t bg-muted/30 pt-0">
                <div className="space-y-1 font-mono text-xs">
                  {state.logs.map((log, j) => (
                    <p
                      key={j}
                      className={cn(
                        "py-0.5",
                        log.includes("completed") ||
                          log.includes("success") ||
                          log.includes("Success")
                          ? "text-emerald-600 dark:text-emerald-400"
                          : log.includes("Error") ||
                            log.includes("error") ||
                            log.includes("failed")
                            ? "text-destructive"
                            : log.includes("skipped") || log.includes("Skipped")
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                      )}
                    >
                      {log}
                    </p>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
