"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  BookOpen,
  ShoppingBag,
  Link2,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { WalletProvider } from "@/contexts/wallet"
import { getApiUrl } from "@/lib/api-url"

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex items-end gap-2 h-44">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <Skeleton className="w-full rounded-t-md" style={{ height: `${30 + Math.random() * 100}px` }} />
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  )
}

function AnalyticsContent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${getApiUrl()}/api/analytics/dashboard`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const { stats, chart, topAuthors, recentPapers, recentArticles, difficulties } =
    data || {}
  const maxChart = Math.max(...(chart?.map((c) => c.papers) || [1]), 1)

  return (
    <>
      <Navbar />

      <div className="flex-1">
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-screen-xl px-4 py-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Platform Analytics
            </h1>
            <p className="mt-2 text-muted-foreground">
              Real-time insights into RumahPeneliti
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-screen-xl px-4 py-8 space-y-8">
          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="flex items-center gap-4 py-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                icon={FileText}
                label="Papers"
                value={stats?.papers || 0}
                color="text-violet-500"
              />
              <StatCard
                icon={BookOpen}
                label="AI Articles"
                value={stats?.articles || 0}
                color="text-blue-500"
              />
              <StatCard
                icon={ShoppingBag}
                label="Purchases"
                value={stats?.purchases || 0}
                color="text-emerald-500"
              />
              <StatCard
                icon={Link2}
                label="Anchored"
                value={stats?.papers || 0}
                color="text-amber-500"
              />
            </div>
          )}

          {/* Chart + Top Authors */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Papers (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <div className="flex items-end gap-2 h-44">
                    {chart?.map((d, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <span className="text-xs font-semibold text-primary">
                          {d.papers}
                        </span>
                        <div
                          className="w-full rounded-t-md bg-primary/80 transition-all duration-500 min-h-[4px]"
                          style={{
                            height: `${Math.max(
                              (d.papers / maxChart) * 140,
                              4
                            )}px`,
                          }}
                        />
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">
                          {d.label.split(",")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Authors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Top Authors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                        <div className="flex-1" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(topAuthors?.length > 0
                      ? topAuthors
                      : [
                          {
                            wallet: "0x7Aef...Af55",
                            name: "Demo Author",
                            count: 13,
                          },
                          {
                            wallet: "0x1234...5678",
                            name: "Dr. Sarah Chen",
                            count: 2,
                          },
                        ]
                    ).map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            i === 0
                              ? "bg-amber-500/10 text-amber-600"
                              : i === 1
                              ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              : "bg-orange-500/10 text-orange-600"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {a.name?.split(",")[0] ||
                              `${a.wallet?.slice(0, 6)}...${a.wallet?.slice(-4)}`}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {a.wallet?.slice(0, 10)}...
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {a.count} papers
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Difficulty + Recent Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Difficulty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Difficulty Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-2 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  ["beginner", "intermediate", "advanced"].map((d) => {
                    const count = difficulties?.[d] || 0
                    const total = Object.values(difficulties || {}).reduce(
                      (a, b) => a + b,
                      0
                    ) || 1
                    const pct = Math.round((count / total) * 100)
                    const colors = {
                      beginner: "text-emerald-500",
                      intermediate: "text-amber-500",
                      advanced: "text-red-500",
                    }
                    return (
                      <div key={d}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-sm capitalize font-medium ${colors[d]}`}
                          >
                            {d}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3.5 w-3/4" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentPapers?.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {p.title?.slice(0, 40)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.upload_date}
                          </p>
                        </div>
                      </div>
                    ))}
                    {recentArticles?.slice(0, 3).map((a, i) => (
                      <div
                        key={`a${i}`}
                        className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                      >
                        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {a.curated_title?.slice(0, 40)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            AI Curated &middot; {a.created_date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default function AnalyticsPage() {
  return (
    <WalletProvider>
      <div className="flex min-h-screen flex-col">
        <AnalyticsContent />
      </div>
    </WalletProvider>
  )
}
