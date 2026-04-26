"use client"

import { useState, useEffect } from "react"
import { FileText, BookOpen, Link2, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/contexts/language"
import { getApiUrl } from "@/lib/api-url"

const STAT_ICONS = [FileText, BookOpen, Link2, Award]

function StatCard({ icon: Icon, value, label, loading }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <span className="text-3xl font-bold tracking-tight">{value}</span>
        )}
        <span className="text-sm text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  )
}

export function Stats() {
  const { t } = useLanguage()
  const [stats, setStats] = useState({ papers: 0, articles: 0, anchors: 0, nfts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${getApiUrl()}/api/health`)
        .then(r => r.json())
        .then(d => ({ papers: d.papers || 0, articles: d.articles || 0 }))
        .catch(() => ({ papers: 0, articles: 0 })),
      fetch(`${getApiUrl()}/api/activity`)
        .then(r => r.json())
        .then(d => ({ anchors: d.stats?.anchors || 0, nfts: d.stats?.nfts || 0 }))
        .catch(() => ({ anchors: 0, nfts: 0 })),
    ]).then(([health, activity]) => {
      setStats({ ...health, ...activity })
      setLoading(false)
    })
  }, [])

  const items = [
    { value: stats.papers, label: t("stats_papers") },
    { value: stats.articles, label: t("stats_articles") },
    { value: stats.anchors, label: "On-chain Anchors" },
    { value: stats.nfts, label: "NFTs Minted" },
  ]

  return (
    <section className="border-b bg-background">
      <div className="container mx-auto grid max-w-screen-xl grid-cols-2 gap-4 px-4 py-12 md:grid-cols-4 md:py-16">
        {items.map((item, i) => (
          <StatCard
            key={i}
            icon={STAT_ICONS[i]}
            value={item.value}
            label={item.label}
            loading={loading}
          />
        ))}
      </div>
    </section>
  )
}
