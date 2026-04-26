"use client"

import { useState, useEffect } from "react"
import { BookOpen, FileText, Inbox, Loader2 } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SearchBar } from "@/components/papers/search-bar"
import { CategoryPills } from "@/components/papers/category-pills"
import { PaperCard } from "@/components/papers/paper-card"
import { ArticleCard } from "@/components/papers/article-card"
import { SortSelect } from "@/components/papers/sort-select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchPapers, fetchArticles } from "@/lib/api"
import { useLanguage } from "@/contexts/language"
import { useWallet, WalletProvider } from "@/contexts/wallet"
import Link from "next/link"

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-1.5" />
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <div className="pt-1 border-t">
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Empty State ─── */
function EmptyState({ type }) {
  const { t } = useLanguage()
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">
        No {type} found
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        {type === "articles"
          ? "No curated articles match your search. Try adjusting your filters."
          : "No papers match your search. Try adjusting your filters."}
      </p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href="/upload">Upload a Paper</Link>
      </Button>
    </div>
  )
}

/* ─── Browse Content ─── */
function BrowseContent() {
  const { t } = useLanguage()

  // Data state
  const [articles, setArticles] = useState([])
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter state
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [sort, setSort] = useState("newest")
  const [tab, setTab] = useState("articles")

  // Fetch on mount
  useEffect(() => {
    Promise.all([fetchPapers(), fetchArticles()])
      .then(([pData, aData]) => {
        const paperList = Array.isArray(pData) ? pData : pData?.papers || []
        const articleList = Array.isArray(aData) ? aData : []
        setPapers(paperList)
        setArticles(articleList)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // ─── Client-side filtering ───

  const filteredArticles = articles.filter((a) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase()
      const matchesSearch =
        (a.curated_title || "").toLowerCase().includes(q) ||
        (a.summary || "").toLowerCase().includes(q) ||
        (a.tags || []).some((tg) => tg.toLowerCase().includes(q))
      if (!matchesSearch) return false
    }

    // Category filter
    if (category !== "All") {
      const cats = a.classification?.categories || a.tags || []
      if (!cats.some((c) => c.toLowerCase() === category.toLowerCase())) return false
    }

    return true
  })

  const filteredPapers = papers.filter((p) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase()
      const matchesSearch =
        (p.title || "").toLowerCase().includes(q) ||
        (p.authors || "").toLowerCase().includes(q)
      if (!matchesSearch) return false
    }

    // Category filter
    if (category !== "All") {
      const cats = p.classification?.categories || []
      if (!cats.some((c) => c.toLowerCase() === category.toLowerCase())) return false
    }

    return true
  })

  // ─── Sort papers ───

  const sortedPapers = [...filteredPapers].sort((a, b) => {
    if (sort === "oldest")
      return new Date(a.upload_date) - new Date(b.upload_date)
    if (sort === "title") return (a.title || "").localeCompare(b.title || "")
    return new Date(b.upload_date) - new Date(a.upload_date) // newest
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container mx-auto max-w-6xl px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("browse_title")}{" "}
            <span className="text-primary">{t("browse_subtitle")}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore AI-curated academic papers and articles
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={t("search_placeholder")}
          />
        </div>

        {/* Category pills + Sort */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <CategoryPills active={category} onChange={setCategory} />
          <SortSelect value={sort} onChange={setSort} />
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="articles" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {t("tab_articles")} ({filteredArticles.length})
            </TabsTrigger>
            <TabsTrigger value="papers" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {t("tab_papers")} ({sortedPapers.length})
            </TabsTrigger>
          </TabsList>

          {/* ─── Articles Grid ─── */}
          <TabsContent value="articles">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-sm text-destructive">
                Error loading articles: {error}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <EmptyState type="articles" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article, i) => (
                  <ArticleCard
                    key={article.id || i}
                    article={article}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── Papers Grid ─── */}
          <TabsContent value="papers">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-sm text-destructive">
                Error loading papers: {error}
              </div>
            ) : sortedPapers.length === 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <EmptyState type="papers" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedPapers.map((paper, i) => (
                  <PaperCard
                    key={paper.id || i}
                    paper={paper}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}

/* ─── Page Export ─── */
export default function BrowsePage() {
  return (
    <WalletProvider>
      <BrowseContent />
    </WalletProvider>
  )
}
