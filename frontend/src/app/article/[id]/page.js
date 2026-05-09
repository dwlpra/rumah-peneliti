"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle,
  Loader2,
  Coffee,
  Wallet,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArticleBody } from "@/components/article/article-body"
import { Paywall } from "@/components/article/paywall"
import { AIScore } from "@/components/article/ai-score"
import { AIChat } from "@/components/article/ai-chat"
import { Sidebar } from "@/components/article/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@/contexts/wallet"
import { useLanguage } from "@/contexts/language"
import { fetchArticle, fetchPaper, checkAccess, purchasePaper } from "@/lib/api"
import { CONTRACTS } from "@/lib/constants"
import { PageTransition } from "@/components/shared/page-transition"

function ArticleContent() {
  const { t } = useLanguage()
  const { id } = useParams()
  const { address, provider, connect, isCorrectNetwork, switchNetwork } = useWallet()
  const [toast, setToast] = useState(null)

  const [article, setArticle] = useState(null)
  const [paper, setPaper] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)

  // Fetch article + paper
  useEffect(() => {
    if (!id) return
    Promise.all([fetchArticle(id), fetchPaper(id)])
      .then(([a, p]) => {
        setArticle(a)
        setPaper(p)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  // Check access
  useEffect(() => {
    if (paper?.id && address) {
      checkAccess(paper.id, address)
        .then((res) => {
          if (res.hasAccess) setUnlocked(true)
        })
        .catch(() => {})
    }
  }, [paper?.id, address])

  // Unlock handler — send payment via smart contract
  const handleUnlock = async () => {
    if (!window.ethereum) {
      setToast({ type: "error", message: "Please install a wallet first!" })
      return
    }
    if (!address) {
      await connect()
      return
    }

    setPaying(true)
    try {
      const contractAddress =
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || CONTRACTS.journalPayment

      // Switch network if needed (using wallet context)
      if (!isCorrectNetwork) {
        await switchNetwork()
      }

      // Use ethers Contract with proper ABI instead of hardcoded selector
      const { ethers } = await import("ethers")
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const signer = await browserProvider.getSigner()
      const contract = new ethers.Contract(
        contractAddress,
        ["function purchasePaper(uint256) payable"],
        signer
      )

      const priceWei = paper?.price_wei || "1000000000000000"
      const journalId = paper?.journal_id
      if (journalId == null) {
        setToast({ type: "error", message: "Paper not registered on-chain yet. Purchase unavailable." })
        setPaying(false)
        return
      }
      const tx = await contract.purchasePaper(BigInt(journalId), {
        value: BigInt(priceWei),
      })

      // Wait for transaction receipt before marking as unlocked
      setToast({ type: "info", message: "Transaction submitted, waiting for confirmation..." })
      await tx.wait()

      // Record purchase in backend
      await purchasePaper(paper.id, address, tx.hash, priceWei)
      setUnlocked(true)
      setToast({ type: "success", message: "Payment confirmed! Article unlocked." })
    } catch (e) {
      if (e.code !== 4001) {
        setToast({ type: "error", message: "Payment failed: " + (e.message || "Unknown error") })
      }
    }
    setPaying(false)
  }

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Skeleton className="h-4 w-24 mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="flex gap-3 mb-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-40 w-full mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Error state
  if (error || !article) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <p className="text-lg font-medium text-destructive mb-2">
            {error || "Article not available yet."}
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("nav_browse") || "Back to Browse"}
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const priceEth = paper
    ? (Number(paper.price_wei) / 1e18).toFixed(4)
    : "0.001"
  const isFree = paper && Number(paper.price_wei) === 0
  const canRead = unlocked || isFree

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("nav_browse") || "Browse"}
        </Link>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-4 leading-tight">
          {article.curated_title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
          {paper?.authors && (
            <span className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              {paper.authors}
            </span>
          )}
          {paper?.upload_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(paper.upload_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {article.tags.map((tg, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                #{tg}
              </Badge>
            ))}
          </div>
        )}

        {/* Summary */}
        {article.summary && (
          <Card className="mt-6 bg-primary/5 border-primary/10">
            <CardContent className="py-4 px-5">
              <p className="text-xs uppercase tracking-wider text-primary font-medium mb-2">
                {t("article_summary") || "Summary"}
              </p>
              <p className="text-sm leading-relaxed">{article.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Key Takeaways */}
        {article.key_takeaways?.length > 0 && (
          <Card className="mt-4">
            <CardContent className="py-4 px-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                {t("article_takeaways") || "Key Takeaways"}
              </p>
              <ul className="space-y-2">
                {article.key_takeaways.map((tk, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-sm leading-relaxed">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{tk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 2-column layout: main + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">
          {/* Main content */}
          <div className="min-w-0">
            {/* AI Score — always visible */}
            <AIScore score={article.ai_score} />

            {/* AI Chat — always visible */}
            <AIChat paperId={id} article={article} />

            {/* Body or Paywall */}
            {canRead ? (
              <div className="mt-8">
                <ArticleBody article={article} abstract={paper?.abstract} />

                {/* Donation button for free papers */}
                {isFree && (
                  <Card className="mt-8 bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/30">
                    <CardContent className="py-6 text-center">
                      <Coffee className="h-6 w-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm font-semibold mb-1">
                        Support this research
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        This paper is free. Buy the author a coffee!
                      </p>
                      <Button
                        onClick={async () => {
                          if (!address) {
                            setToast({ type: "error", message: "Connect your wallet first" })
                            return
                          }
                          try {
                            const tipAmount =
                              "0x" + BigInt("10000000000000000").toString(16)
                            const authorAddr = paper?.author_wallet
                            if (
                              !authorAddr ||
                              !authorAddr.startsWith("0x") ||
                              authorAddr.length !== 42
                            ) {
                              setToast({ type: "error", message: "Author wallet not available" })
                              return
                            }
                            await window.ethereum.request({
                              method: "eth_sendTransaction",
                              params: [
                                {
                                  from: address,
                                  to: authorAddr,
                                  value: tipAmount,
                                },
                              ],
                            })
                            setToast({ type: "success", message: "Thanks for supporting this research!" })
                          } catch (e) {
                            if (e.code !== 4001) {
                              setToast({ type: "error", message: "Tip failed: " + e.message })
                            }
                          }
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <Coffee className="h-4 w-4" />
                        {address ? "Tip 0.01 0G" : "Connect Wallet to Tip"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Paywall
                priceEth={priceEth}
                address={address}
                onUnlock={handleUnlock}
                paying={paying}
                isFree={false}
              />
            )}
          </div>

          {/* Sidebar */}
          <Sidebar
            article={article}
            paper={paper}
            unlocked={unlocked}
            isFree={isFree}
            priceEth={priceEth}
            address={address}
          />
        </div>
      </div>

      <Footer />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm ${
          toast.type === "error" ? "bg-red-600 text-white" :
          toast.type === "success" ? "bg-emerald-600 text-white" :
          "bg-blue-600 text-white"
        }`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-3 opacity-70 hover:opacity-100">&times;</button>
        </div>
      )}
    </>
  )
}

export default function ArticlePage() {
  return <PageTransition><ArticleContent /></PageTransition>
}
