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
import { WalletProvider } from "@/contexts/wallet"
import { CONTRACTS } from "@/lib/constants"
import { getApiUrl } from "@/lib/api-url"

const GRADIENTS = [
  "from-blue-500/20 to-indigo-500/20",
  "from-emerald-500/20 to-teal-500/20",
  "from-violet-500/20 to-purple-500/20",
  "from-amber-500/20 to-orange-500/20",
  "from-rose-500/20 to-pink-500/20",
  "from-cyan-500/20 to-sky-500/20",
]

function NFTCard({ nft, paper, index }) {
  const gradient = GRADIENTS[index % GRADIENTS.length]
  const date = nft.timestamp
    ? new Date(nft.timestamp * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : ""

  return (
    <Link href={`/article/${nft.paperId}`} className="group">
      <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md h-full">
        <div className={`relative h-44 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-1`}>
          <Award className="h-10 w-10 text-primary opacity-60" />
          <span className="text-3xl font-bold text-primary">#{nft.tokenId}</span>
          <Badge variant="secondary" className="mt-1 font-mono text-xs">
            ERC-721
          </Badge>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Research NFT #{nft.tokenId}</span>
            <Badge variant="outline" className="text-xs">
              On-chain
            </Badge>
          </div>
          {paper && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {paper.curated_title || paper.paper_title || `Paper #${nft.paperId}`}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Paper #{nft.paperId}</span>
            <span>{date}</span>
          </div>
          <ExplorerLink type="tx" value={nft.txHash} className="text-xs" />
        </CardContent>
      </Card>
    </Link>
  )
}

function NFTSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-44" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  )
}

function NFTContent() {
  const [nfts, setNfts] = useState([])
  const [papers, setPapers] = useState({})
  const [totalSupply, setTotalSupply] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${getApiUrl()}/api/activity`).then((r) => r.json()),
      fetch(`${getApiUrl()}/api/nfts/stats`).then((r) => r.json()),
    ])
      .then(([activityData, nftStats]) => {
        const nftItems = (activityData?.activity || []).filter(
          (a) => a.type === "nft"
        )
        setNfts(nftItems)
        setTotalSupply(nftStats?.totalSupply || nftItems.length)

        const paperIds = [...new Set(nftItems.map((n) => n.paperId))]
        return Promise.all(
          paperIds.map((id) =>
            fetch(`${getApiUrl()}/api/articles/${id}`)
              .then((r) => r.json())
              .then((a) => ({ id, ...a }))
              .catch(() => null)
          )
        )
      })
      .then((results) => {
        const m = {}
        results.filter(Boolean).forEach((p) => {
          m[p.id] = p
        })
        setPapers(m)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />

      <div className="flex-1">
        {/* Hero */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-screen-xl px-4 py-12 text-center">
            <Badge variant="secondary" className="mb-4">
              <Award className="mr-1.5 h-3.5 w-3.5" />
              ERC-721 Research NFTs
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Research NFT Gallery
            </h1>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Every curated paper is minted as a unique ERC-721 NFT on the 0G
              blockchain. Gasless, permanent, and verifiable.
            </p>

            {/* Stats */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{totalSupply}</span>
                </div>
                <span className="text-xs text-muted-foreground">NFTs Minted</span>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Fuel className="h-4 w-4 text-emerald-500" />
                  <span className="text-2xl font-bold">0</span>
                </div>
                <span className="text-xs text-muted-foreground">Gas (Sponsored)</span>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">0G</span>
                </div>
                <span className="text-xs text-muted-foreground">Network</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contract info */}
        <section className="container mx-auto max-w-screen-xl px-4 py-6">
          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium">ResearchNFT Contract</span>
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
              <p className="text-lg font-medium">No NFTs minted yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Be the first to publish research and receive an NFT.
              </p>
              <div className="flex gap-3">
                <Link href="/pipeline">
                  <Button variant="default">Try Pipeline</Button>
                </Link>
                <Link href="/upload">
                  <Button variant="outline">Upload Paper</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nfts.map((nft, i) => (
                <NFTCard
                  key={nft.tokenId}
                  nft={nft}
                  paper={papers[nft.paperId]}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </>
  )
}

export default function NFTsPage() {
  return (
    <WalletProvider>
      <div className="flex min-h-screen flex-col">
        <NFTContent />
      </div>
    </WalletProvider>
  )
}
