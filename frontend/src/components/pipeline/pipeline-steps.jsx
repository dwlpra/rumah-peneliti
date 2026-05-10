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
  Bot,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language"

function PipelineConfig({ t }) {
  const STEPS = [
    { id: "upload", title: t('pl_step_upload_title'), desc: t('pl_step_upload_desc'), icon: Upload, color: "text-blue-500" },
    { id: "storage", title: t('pl_step_storage_title'), desc: t('pl_step_storage_desc'), icon: Database, color: "text-cyan-500" },
    { id: "da", title: t('pl_step_da_title'), desc: t('pl_step_da_desc'), icon: ShieldCheck, color: "text-emerald-500" },
    { id: "anchor", title: t('pl_step_anchor_title'), desc: t('pl_step_anchor_desc'), icon: Link2, color: "text-amber-500" },
    { id: "ai", title: t('pl_step_ai_title'), desc: t('pl_step_ai_desc'), icon: Brain, color: "text-violet-500" },
    { id: "nft", title: t('pl_step_nft_title'), desc: t('pl_step_nft_desc'), icon: Award, color: "text-pink-500" },
  ]

  const AI_AGENTS = [
    { name: t('pl_agent_summarizer'), desc: t('pl_agent_summarizer_desc') },
    { name: t('pl_agent_scorer'), desc: t('pl_agent_scorer_desc') },
    { name: t('pl_agent_tagger'), desc: t('pl_agent_tagger_desc') },
  ]

  return { STEPS, AI_AGENTS }
}

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

function StatusBadgeWithT({ status, t }) {
  switch (status) {
    case "running":
      return <Badge variant="default">{t('pl_running')}</Badge>
    case "completed":
      return <Badge variant="success">{t('pl_completed')}</Badge>
    case "error":
      return <Badge variant="destructive">{t('pl_error')}</Badge>
    default:
      return <Badge variant="secondary">{t('pl_pending')}</Badge>
  }
}

function AgentActivity({ stepState, t, AI_AGENTS }) {
  const aiState = stepState.ai
  const isRunning = aiState?.status === "running"
  const isCompleted = aiState?.status === "completed"

  if (!isRunning && !isCompleted) return null

  return (
    <div className="border-t bg-muted/20 px-4 py-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Bot className="h-3.5 w-3.5 text-violet-500" />
        <span className="text-xs font-medium text-muted-foreground">
          {isRunning ? t('pl_agents_working') : t('pl_agents_done')}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {AI_AGENTS.map((agent) => (
          <div
            key={agent.name}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
              isRunning && "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30",
              isCompleted && "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
            )}
          >
            {isRunning ? (
              <Loader2 className="h-3 w-3 animate-spin text-violet-500" />
            ) : (
              <CheckCircle className="h-3 w-3 text-emerald-500" />
            )}
            <span className={cn("font-medium", isRunning && "text-violet-700 dark:text-violet-300")}>
              {agent.name}
            </span>
            <span className="text-muted-foreground hidden sm:inline">— {agent.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PipelineSteps({ stepState, currentStep }) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(null)
  const { STEPS, AI_AGENTS } = PipelineConfig({ t })

  const toggleExpand = (stepId) => {
    setExpanded((prev) => (prev === stepId ? null : stepId))
  }

  // Count completed steps
  const completedCount = STEPS.filter(s => stepState[s.id]?.status === "completed").length

  return (
    <div className="space-y-3">
      {/* Progress overview */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{t('pl_progress')}</h3>
        <Badge variant={completedCount === STEPS.length ? "success" : "secondary"}>
          {completedCount}/{STEPS.length} {t('pl_steps')}
        </Badge>
      </div>

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
                <Icon className={cn("h-5 w-5", step.color)} />
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
              <StatusBadgeWithT status={state.status} t={t} />

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

            {/* AI Agent activity display */}
            {step.id === "ai" && (state.status === "running" || state.status === "completed") && (
              <AgentActivity stepState={stepState} t={t} AI_AGENTS={AI_AGENTS} />
            )}

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
