"use client"

import { Brain, Lightbulb, BookOpen, Microscope, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

const DIMENSIONS = [
  { key: "novelty", label: "Novelty", icon: Lightbulb, color: "text-blue-500" },
  { key: "clarity", label: "Clarity", icon: BookOpen, color: "text-emerald-500" },
  { key: "methodology", label: "Methodology", icon: Microscope, color: "text-amber-500" },
  { key: "impact", label: "Impact", icon: Globe, color: "text-purple-500" },
]

function getScoreColor(score) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

export function AIScore({ score }) {
  if (!score) return null

  const overall = Math.round(
    DIMENSIONS.reduce((sum, d) => sum + (score[d.key] || 0), 0) / DIMENSIONS.length
  )

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm uppercase tracking-wider">
              AI Research Score
            </CardTitle>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${getScoreColor(overall)}`}>
              {overall}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {DIMENSIONS.map((dim) => {
          const val = score[dim.key] || 0
          const Icon = dim.icon
          const reasoning = score[`reasoning_${dim.key}`]

          return (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className={`h-4 w-4 ${dim.color}`} />
                  {dim.label}
                </span>
                <span className={`text-sm font-semibold ${dim.color}`}>{val}</span>
              </div>
              <Progress value={val} className="h-2" />
              {reasoning && (
                <p className="text-xs text-muted-foreground italic mt-1">
                  {reasoning}
                </p>
              )}
            </div>
          )
        })}

        <Separator className="my-2" />

        <p className="text-xs text-muted-foreground">
          Powered by Multi-Agent AI Pipeline on 0G Compute Network
          {score.agents_used && (
            <span className="ml-1">
              &mdash; Agents: {score.agents_used.join(", ")}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  )
}
