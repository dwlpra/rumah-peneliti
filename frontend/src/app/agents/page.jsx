"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bot, ExternalLink, Shield, Loader2, Inbox, Activity, FileText, Coffee } from "lucide-react"
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
import { useLanguage } from "@/contexts/language"

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
  const { t } = useLanguage()

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
  const totalTips = agents.reduce((sum, a) => sum + Number(a.tips?.totalTips || 0), 0)

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
                {t('agents_badge')}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t('agents_title')}
              </h1>
              <p className="mt-3 text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {t('agents_desc')}
              </p>

              {/* Stats */}
              <div className="mt-8 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{agents.length}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t('agents_nft_count')}</span>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span className="text-2xl font-bold">{activeAgents}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t('agents_active_count')}</span>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-2xl font-bold">{totalPapers}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t('agents_papers_count')}</span>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Coffee className="h-4 w-4 text-amber-500" />
                    <span className="text-2xl font-bold">{totalTips.toFixed(4)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t('agents_tips_count')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contract info */}
          <section className="container mx-auto max-w-screen-xl px-4 py-6">
            <Card>
              <CardContent className="flex flex-wrap items-center gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium">Agent NFT</span>
                  <ExplorerLink type="address" value={CONTRACTS.agentNFT} className="text-xs" />
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-medium">0G Agentic ID</span>
                  <ExplorerLink type="address" value={CONTRACTS.agenticId || "0x82c5e31880929de181E5DF78D60f342168d18115"} className="text-xs" />
                  <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-600 dark:text-blue-400">
                    ERC-7857
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Agent Grid */}
          <section className="container mx-auto max-w-screen-xl px-4 pb-8">
            <h2 className="text-lg font-semibold mb-4">{t('agents_registered')}</h2>
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
                <p className="text-lg font-medium">{t('agents_no_agents')}</p>
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
                <h2 className="text-lg font-semibold">{t('agents_recent_title')}</h2>
              </div>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">{t('agents_th_paper')}</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">{t('agents_th_agent')}</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">{t('agents_th_score')}</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">{t('agents_th_date')}</th>
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
