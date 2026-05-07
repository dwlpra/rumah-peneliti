"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  User,
  FileText,
  BookOpen,
  Award,
  Wallet,
  Inbox,
  Loader2,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AddressDisplay } from "@/components/shared/address-display"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet"
import { getApiUrl } from "@/lib/api-url"
import { WalletModal } from "@/components/shared/wallet-modal"
import { PageTransition } from "@/components/shared/page-transition"

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-6 text-center">
        <Icon className={`h-5 w-5 mb-2 ${color}`} />
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      </CardContent>
    </Card>
  )
}

function ProfileContent() {
  const { address, connect } = useWallet()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [walletModalOpen, setWalletModalOpen] = useState(false)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    setError(null)
    fetch(`${getApiUrl()}/api/profile/${address}`)
      .then((r) => r.json())
      .then((d) => setProfile(d))
      .catch((e) => setError(e.message || "Failed to load profile"))
      .finally(() => setLoading(false))
  }, [address])

  // No wallet
  if (!address) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="py-10">
              <div className="rounded-full bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Connect your wallet to view your profile and on-chain activity.
              </p>
              <Button onClick={() => setWalletModalOpen(true)} className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
              <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  const stats = profile?.stats || {}
  const papers = profile?.authoredPapers || []
  const purchases = profile?.purchases || []
  const nfts = profile?.nfts || []

  return (
    <PageTransition>
    <>
      <Navbar />

      <div className="flex-1">
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-screen-xl px-4 py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Researcher Profile</h1>
                <AddressDisplay address={address} />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-screen-xl px-4 py-8 space-y-8">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="flex flex-col items-center py-6">
                    <Skeleton className="h-5 w-5 rounded-full mb-2" />
                    <Skeleton className="h-7 w-12 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={FileText}
                label="Papers Uploaded"
                value={stats.papersUploaded || 0}
                color="text-blue-500"
              />
              <StatCard
                icon={BookOpen}
                label="Articles Curated"
                value={stats.articlesCurated || 0}
                color="text-emerald-500"
              />
              <StatCard
                icon={Award}
                label="NFTs Earned"
                value={stats.nftsEarned || 0}
                color="text-violet-500"
              />
            </div>
          )}

          {/* My Papers */}
          <div>
            <h2 className="text-lg font-semibold mb-4">My Papers</h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : papers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  No papers yet. Upload your first research paper.
                </p>
                <Link href="/upload">
                  <Button>Upload Paper</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {papers.map((paper) => {
                  const nft = nfts.find(n => Number(n.paperId) === paper.id || Number(n.paperId) === paper.journal_id)
                  const isFree = !paper.price_wei || paper.price_wei === "0"
                  const price0G = isFree ? "Free" : `${(Number(paper.price_wei) / 1e18)} 0G`

                  return (
                    <Link
                      key={paper.id}
                      href={`/article/${paper.slug || paper.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/30">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {paper.curated_title || paper.title}
                          </p>
                          {paper.summary && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {paper.summary}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isFree ? (
                            <Badge variant="secondary" className="text-xs">Free</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">{price0G}</Badge>
                          )}
                          {nft && (
                            <Badge className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400">
                              NFT #{nft.tokenId}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Purchases */}
          {purchases.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Papers Purchased</h2>
              <div className="space-y-3">
                {purchases.map((purchase, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
                      <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {purchase.curated_title || purchase.paper_title || `Paper #${purchase.paper_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(Number(purchase.amount) / 1e18).toFixed(4)} 0G
                        {purchase.purchase_date && ` · ${new Date(purchase.purchase_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
    </PageTransition>
  )
}

export default function ProfilePage() {
  return (
    <PageTransition>
    <div className="flex min-h-screen flex-col">
      <ProfileContent />
    </div>
    </PageTransition>
  )
}
