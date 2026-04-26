"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language"
import { fetchArticles } from "@/lib/api"

export function LatestPapers() {
  const { t } = useLanguage()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setArticles(list.slice(0, 4))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="border-b bg-muted/30">
      <div className="container mx-auto max-w-screen-xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("latest_title")}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {t("latest_subtitle")}
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden gap-1 sm:flex">
            <Link href="/browse">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="mb-3 h-5 w-3/4" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-4 h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No articles yet. Be the first to upload!</p>
              <Button asChild className="mt-4">
                <Link href="/upload">{t("btn_upload")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map(article => {
              const isFree = !article.price_wei || Number(article.price_wei) === 0
              return (
                <Link key={article.id || article.paper_id} href={`/article/${article.paper_id}`}>
                  <Card className="h-full transition-colors hover:border-primary/30 hover:shadow-sm">
                    <CardContent className="flex h-full flex-col p-5">
                      {/* Price badge */}
                      <div className="mb-3">
                        <Badge variant={isFree ? "success" : "secondary"}>
                          {isFree ? t("price_free") : `${(Number(article.price_wei) / 1e18).toFixed(4)} 0G`}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug">
                        {article.curated_title}
                      </h3>

                      {/* Summary */}
                      <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                        {article.summary}
                      </p>

                      {/* Tags */}
                      {article.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link href="/browse">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
