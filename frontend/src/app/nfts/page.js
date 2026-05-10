"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Award, ExternalLink, Loader2, Inbox, Palette, Fuel, Globe } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ExplorerLink } from "@/components/shared/explorer-link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CONTRACTS } from "@/lib/constants"
import { getApiUrl } from "@/lib/api-url"
import { PageTransition } from "@/components/shared/page-transition"
import { NFTCardSVG } from "@/components/nft/nft-card-svg"
import { useLanguage } from "@/contexts/language"

function NFTSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[5/7]" />
    </Card>
  )
}

function NFTContent() {
  const [nfts, setNfts] = useState([])
  const [articles, setArticles] = useState({})
  const [totalSupply, setTotalSupply] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { t } = useLanguage()

  useEffect(() => {
    Promise.all([
      fetch(`${getApiUrl()}/api/nfts`).then((r) => r.json()),
      fetch(`${getApiUrl()}/api/nfts/stats`).then((r) => r.json()),
    ])
      .then(async ([nftData, nftStats]) => {
        const nftItems = nftData?.nfts || []
        setNfts(nftItems)
        setTotalSupply(nftStats?.totalSupply || nftItems.length)

        // Fetch article data for each NFT (for AI score, tags, summary)
        const articleResults = await Promise.all(
          nftItems.map((nft) =>
            fetch(`${getApiUrl()}/api/articles/${nft.paperId}`)
              .then((r) => r.json())
              .then((a) => ({ paperId: nft.paperId, ...a }))
              .catch(() => null)
          )
        )
        const articleMap = {}
        articleResults.filter(Boolean).forEach((a) => {
          articleMap[a.paperId] = a
        })
        setArticles(articleMap)
      })
      .catch((e) => setError(e.message || "Failed to load NFTs"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageTransition>
    <>
      <Navbar />

      <div className="flex-1">
        {/* Hero */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-screen-xl px-4 py-12 text-center">
            <Badge variant="secondary" className="mb-4">
              <Award className="mr-1.5 h-3.5 w-3.5" />
              {t('nfts_badge')}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('nfts_title')}
            </h1>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {t('nfts_desc')}
            </p>

            {/* Stats */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{totalSupply}</span>
                </div>
                <span className="text-xs text-muted-foreground">{t('nfts_minted')}</span>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Fuel className="h-4 w-4 text-emerald-500" />
                  <span className="text-2xl font-bold">0</span>
                </div>
                <span className="text-xs text-muted-foreground">{t('nfts_gas')}</span>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">0G</span>
                </div>
                <span className="text-xs text-muted-foreground">{t('nfts_network')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contract info */}
        <section className="container mx-auto max-w-screen-xl px-4 py-6">
          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium">{t('nfts_contract_label')}</span>
              <ExplorerLink
                type="address"
                value={CONTRACTS.researchNFT}
                className="text-xs"
              />
            </CardContent>
          </Card>
        </section>

        {/* Grid */}
        <section className="container mx-auto max-w-screen-xl px-4 pb-12">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-6">
              {error}
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <NFTSkeleton key={i} />
              ))}
            </div>
          ) : nfts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">{t('nfts_empty')}</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {t('nfts_empty_desc')}
              </p>
              <div className="flex gap-3">
                <Link href="/upload">
                  <Button variant="default">{t('btn_upload_paper')}</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nfts.map((nft) => (
                <Link
                  key={nft.tokenId}
                  href={`/article/${nft.slug || nft.paperId}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <NFTCardSVG nft={nft} article={articles[nft.paperId]} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </>
    </PageTransition>
  )
}

export default function NFTsPage() {
  return <NFTContent />
}
