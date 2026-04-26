"use client"

import { useState, useEffect } from "react"
import {
  User,
  FileText,
  BookOpen,
  Award,
  Wallet,
  Link2,
  Inbox,
  Loader2,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ExplorerLink } from "@/components/shared/explorer-link"
import { AddressDisplay } from "@/components/shared/address-display"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useWallet, WalletProvider } from "@/contexts/wallet"
import { getApiUrl } from "@/lib/api-url"

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

function ActivityRow({ item, index }) {
  const isNft = item.type === "nft"
  const date = item.timestamp
    ? new Date(item.timestamp * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
        {isNft ? (
          <Award className="h-4 w-4 text-violet-500" />
        ) : (
          <Link2 className="h-4 w-4 text-amber-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isNft
              ? `NFT #${item.tokenId} Minted`
              : `Paper #${item.paperId} Anchored`}
          </span>
          <Badge
            variant={isNft ? "secondary" : "outline"}
            className="text-xs"
          >
            {isNft ? "ERC-721" : "ANCHOR"}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Block #{item.blockNumber} &middot; {date}
        </span>
      </div>
      <ExplorerLink type="tx" value={item.txHash} className="text-xs shrink-0" />
    </div>
  )
}

function ProfileContent() {
  const { address, connect } = useWallet()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    fetch(`${getApiUrl()}/api/profile/${address}`)
      .then((r) => r.json())
      .then((d) => setProfile(d))
      .catch(() => {})
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
              <Button onClick={connect} className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  const stats = profile?.stats || {}
  const activity = profile?.activity || []

  return (
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
              <StatCard
                icon={Wallet}
                label="Total Earned"
                value={`${stats.totalEarned || 0} 0G`}
                color="text-amber-500"
              />
            </div>
          )}

          {/* Activity */}
          <div>
            <h2 className="text-lg font-semibold mb-4">On-Chain Activity</h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No on-chain activity yet. Upload a paper to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map((item, i) => (
                  <ActivityRow key={i} item={item} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default function ProfilePage() {
  return (
    <WalletProvider>
      <div className="flex min-h-screen flex-col">
        <ProfileContent />
      </div>
    </WalletProvider>
  )
}
