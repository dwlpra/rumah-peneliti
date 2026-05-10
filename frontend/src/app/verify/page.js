"use client"

import { useState } from "react"
import {
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  FileText,
  Link2,
  Award,
  Info,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ExplorerLink } from "@/components/shared/explorer-link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { getApiUrl } from "@/lib/api-url"
import { PageTransition } from "@/components/shared/page-transition"
import { useLanguage } from "@/contexts/language"

function InfoCard() {
  const { t } = useLanguage()
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-4">
        <div className="rounded-full bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{t('verify_what')}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {t('verify_what_desc')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link2 className="h-4 w-4" />
            <span>{t('verify_anchor_check')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>{t('verify_nft_check')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{t('verify_storage_check')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultCard({ data }) {
  const { t } = useLanguage()
  const hasAnchor = !!data?.anchor
  const hasNft = !!data?.nft
  const hasAny = hasAnchor || hasNft

  if (!hasAny) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center space-y-3">
          <div className="rounded-full bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">{t('verify_not_found')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('verify_not_found_desc')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          {t('verify_result')}
        </CardTitle>
        {data.title && (
          <p className="text-sm text-muted-foreground mt-1">{data.title}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Anchor */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('verify_anchor_status')}</span>
            {hasAnchor ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
                <CheckCircle className="mr-1 h-3 w-3" />
                {t('verify_confirmed')}
              </Badge>
            ) : (
              <Badge variant="secondary">{t('verify_not_found_badge')}</Badge>
            )}
          </div>
          {hasAnchor && (
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('verify_transaction')}</span>
                <ExplorerLink type="tx" value={data.anchor.txHash} className="text-xs" />
              </div>
              {data.anchor.storageRoot &&
                data.anchor.storageRoot !== "0x" + "0".repeat(64) && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t('verify_storage_root')}</span>
                    <span className="font-mono text-xs truncate max-w-[300px]">
                      {data.anchor.storageRoot}
                    </span>
                  </div>
                )}
              {data.anchor.timestamp && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t('verify_timestamp')}</span>
                  <span className="text-xs">
                    {new Date(
                      data.anchor.timestamp * 1000
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* NFT */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('verify_nft_status')}</span>
            {hasNft ? (
              <Badge className="bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 border-0">
                <Award className="mr-1 h-3 w-3" />
                {t('verify_minted')}
              </Badge>
            ) : (
              <Badge variant="secondary">{t('verify_not_found_badge')}</Badge>
            )}
          </div>
          {hasNft && (
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('verify_token_id')}</span>
                <span className="font-mono text-xs">#{data.nft.tokenId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('verify_transaction')}</span>
                <ExplorerLink type="tx" value={data.nft.txHash} className="text-xs" />
              </div>
            </div>
          )}
        </div>

        {/* Article anchors */}
        {data.articleAnchors?.length > 0 && (
          <div className="rounded-lg border p-4 space-y-2">
            <span className="text-sm font-medium">{t('verify_article_anchors')}</span>
            <p className="text-sm text-muted-foreground">
              {data.articleAnchors.length} {t('verify_article_anchors_desc')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function VerifyContent() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const { t } = useLanguage()

  const handleVerify = async (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    setLoading(true)
    setResult(null)
    setSearched(true)

    try {
      const res = await fetch(`${getApiUrl()}/api/verify?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResult(data)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
    <>
      <Navbar />

      <div className="flex-1">
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-screen-xl px-4 py-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('verify_title')}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              {t('verify_subtitle')}
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-screen-xl px-4 py-8 space-y-6">
          {/* Search */}
          <form onSubmit={handleVerify} className="max-w-xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('verify_placeholder')}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>

          {/* Content */}
          {loading && (
            <Card className="max-w-xl mx-auto">
              <CardContent className="py-8 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {t('verify_searching')}
                  </span>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          )}

          {!searched && !loading && <InfoCard />}

          {searched && !loading && result && (
            <div className="max-w-xl mx-auto">
              <ResultCard data={result} />
            </div>
          )}

          {searched && !loading && !result && (
            <div className="max-w-xl mx-auto">
              <InfoCard />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
    </PageTransition>
  )
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <VerifyContent />
    </div>
  )
}
