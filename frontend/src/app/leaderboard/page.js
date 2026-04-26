"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Trophy,
  FileText,
  Award,
  CheckCircle,
  Crown,
  Inbox,
  Loader2,
  Medal,
  Users,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ExplorerLink } from "@/components/shared/explorer-link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { WalletProvider } from "@/contexts/wallet"
import { getApiUrl } from "@/lib/api-url"

function MedalBadge({ rank }) {
  if (rank === 0)
    return (
      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0 gap-1">
        <Crown className="h-3 w-3" />1st
      </Badge>
    )
  if (rank === 1)
    return (
      <Badge className="bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-600/80 border-0 gap-1">
        <Medal className="h-3 w-3" />2nd
      </Badge>
    )
  if (rank === 2)
    return (
      <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-0 gap-1">
        <Medal className="h-3 w-3" />3rd
      </Badge>
    )
  return (
    <Badge variant="secondary" className="gap-1">
      #{rank + 1}
    </Badge>
  )
}

function LeaderboardContent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${getApiUrl()}/api/leaderboard`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const { topAuthors, topPapers, verified } = data || {}

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex-1">
          <div className="container mx-auto max-w-screen-xl px-4 py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="flex-1">
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-screen-xl px-4 py-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Leaderboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Top contributors and research papers
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-screen-xl px-4 py-8">
          <Tabs defaultValue="authors" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="authors" className="gap-1.5">
                <Users className="h-4 w-4" />
                Top Authors
              </TabsTrigger>
              <TabsTrigger value="papers" className="gap-1.5">
                <Trophy className="h-4 w-4" />
                Top Papers
              </TabsTrigger>
              <TabsTrigger value="verified" className="gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Verified Papers
              </TabsTrigger>
            </TabsList>

            {/* Top Authors */}
            <TabsContent value="authors">
              <Card>
                <CardContent className="py-4">
                  {!topAuthors?.length ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Inbox className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No author data yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {topAuthors.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-muted/50"
                        >
                          <MedalBadge rank={i} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {a.name?.split(",")[0] ||
                                `${a.wallet?.slice(0, 6)}...${a.wallet?.slice(-4)}`}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {a.wallet?.slice(0, 10)}...
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {a.count} papers
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Papers (AI Score) */}
            <TabsContent value="papers">
              <Card>
                <CardContent className="py-4">
                  {!topPapers?.length ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Inbox className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No scored papers yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {topPapers.map((p, i) => (
                        <Link
                          key={i}
                          href={`/article/${p.id}`}
                          className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors"
                        >
                          <MedalBadge rank={i} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {p.title}
                            </p>
                            {p.difficulty && (
                              <p className="text-xs text-muted-foreground capitalize">
                                {p.difficulty}
                              </p>
                            )}
                          </div>
                          {p.aiScore != null && (
                            <Badge
                              variant={
                                p.aiScore >= 80
                                  ? "secondary"
                                  : "outline"
                              }
                              className="shrink-0"
                            >
                              AI: {p.aiScore}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verified Papers */}
            <TabsContent value="verified">
              <Card>
                <CardContent className="py-4">
                  {!verified?.length ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Inbox className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No verified papers yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {verified.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-muted/50"
                        >
                          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {p.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.anchorDate
                                ? `Anchored ${new Date(
                                    p.anchorDate
                                  ).toLocaleDateString()}`
                                : "On-chain"}
                            </p>
                          </div>
                          {p.txHash && (
                            <ExplorerLink
                              type="tx"
                              value={p.txHash}
                              className="text-xs shrink-0"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default function LeaderboardPage() {
  return (
    <WalletProvider>
      <div className="flex min-h-screen flex-col">
        <LeaderboardContent />
      </div>
    </WalletProvider>
  )
}
