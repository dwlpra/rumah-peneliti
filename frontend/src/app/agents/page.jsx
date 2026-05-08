"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bot, ExternalLink, Shield, Loader2, Inbox, Activity, FileText } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ExplorerLink } from "@/components/shared/explorer-link"
import { AgentCard } from "@/components/agents/agent-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CONTRACTS } from "@/lib/constants"
import { getApiUrl } from "@/lib/api-url"
import { PageTransition } from "@/components/shared/page-transition"

function AgentSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Separator />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

function AgentsContent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${getApiUrl()}/api/papers/agents`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || "Failed to load agents")
        setLoading(false)
      })
  }, [])

  const agents = data?.agents || []
  const recentActivity = data?.recentActivity || []

  // Calculate total stats
  const totalPapers = agents.reduce((sum, a) => sum + (a.stats?.papers_curated || 0), 0)
  const activeAgents = agents.filter((a) => a.active).length

  return (
    <PageTransition>
      <>
        <Navbar />

        <div className="flex-1">
          {/* Hero */}
          <section className="border-b bg-muted/30">
            <div className="container mx-auto max-w-screen-xl px-4 py-12 text-center">
              <Badge variant="secondary" className="mb-4">
                <Bot className="mr-1.5 h-3.5 w-3.5" />
                ERC-7857 Inspired
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                AI Agent Registry
              </h1>
              <p className="mt-3 text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Every AI agent in the curation pipeline has a verifiable on-chain identity.
                Track performance, capabilities, and activity of each autonomous agent.
              </p>

              {/* Stats */}
              <div className="mt-8 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{agents.length}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Agent NFTs</span>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span className="text-2xl font-bold">{activeAgents}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Active Agents</span>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-2xl font-bold">{totalPapers}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Papers Curated</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contract info */}
          <section className="container mx-auto max-w-screen-xl px-4 py-6">
            <Card>
              <CardContent className="flex items-center gap-3 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">AgentNFT Contract</span>
                <ExplorerLink
                  type="address"
                  value={CONTRACTS.agentNFT}
                  className="text-xs"
                />
                <Badge variant="outline" className="text-[10px] ml-auto">
                  ERC-7857 Inspired
                </Badge>
              </CardContent>
            </Card>
          </section>

          {/* Agent Grid */}
          <section className="container mx-auto max-w-screen-xl px-4 pb-8">
            <h2 className="text-lg font-semibold mb-4">Registered Agents</h2>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-6">
                {error}
              </div>
            )}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <AgentSkeleton key={i} />
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">No agents registered yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {agents.map((agent) => (
                  <AgentCard key={agent.tokenId} agent={agent} />
                ))}
              </div>
            )}
          </section>

          {/* Recent Agent Activity */}
          {!loading && recentActivity.length > 0 && (
            <section className="container mx-auto max-w-screen-xl px-4 pb-12">
              <Separator className="mb-8" />
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Recent Agent Activity</h2>
              </div>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Paper</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Agent</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Score</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((item, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <Link
                              href={`/article/${item.slug || item.paper_id}`}
                              className="text-primary hover:underline font-medium"
                            >
                              {item.title?.slice(0, 60)}
                              {(item.title?.length || 0) > 60 ? "..." : ""}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className="text-[10px]">
                              {item.agent_name}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {item.ai_score ? (
                              <span className="font-mono font-medium">
                                {Math.round(
                                  (item.ai_score.novelty + item.ai_score.clarity +
                                    item.ai_score.methodology + item.ai_score.impact) / 4
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">--</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {item.created_date ? new Date(item.created_date).toLocaleDateString() : "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}
        </div>

        <Footer />
      </>
    </PageTransition>
  )
}

export default function AgentsPage() {
  return <AgentsContent />
}
