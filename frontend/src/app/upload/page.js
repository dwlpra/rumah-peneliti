"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Lock,
  PenLine,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wallet,
  Gift,
  Diamond,
  X,
  Cpu,
  Eye,
  RotateCcw,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AddressDisplay } from "@/components/shared/address-display"
import { PipelineSteps } from "@/components/pipeline/pipeline-steps"
import { PipelineResult } from "@/components/pipeline/pipeline-result"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/contexts/wallet"
import { useLanguage } from "@/contexts/language"
import { getStoredToken } from "@/lib/auth"
import { getApiUrl } from "@/lib/api-url"
import { PageTransition } from "@/components/shared/page-transition"
import { WalletModal } from "@/components/shared/wallet-modal"

const API = () => getApiUrl()

/* ──────────────────────── Auth Gate: No Wallet ──────────────────────── */

function ConnectGate() {
  const [walletModalOpen, setWalletModalOpen] = useState(false)

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <CardTitle className="mt-4 text-xl">
          Connect Wallet to Upload
        </CardTitle>
        <CardDescription>
          You need to connect your wallet and verify ownership before uploading research papers.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center pb-6">
        <Button onClick={() => setWalletModalOpen(true)} className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
        <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
      </CardFooter>
    </Card>
  )
}

/* ──────────────────────── Upload Form ──────────────────────── */

function UploadForm({ address }) {
  const { t } = useLanguage()
  const { getEthereum } = useWallet()
  const router = useRouter()
  const fileRef = useRef(null)
  const eventSourceRef = useRef(null)

  // Form state
  const [title, setTitle] = useState("")
  const [authors, setAuthors] = useState("")
  const [abstract, setAbstract] = useState("")
  const [file, setFile] = useState(null)
  const [isFree, setIsFree] = useState(true)
  const [price0G, setPrice0G] = useState("0.01")
  const [dragOver, setDragOver] = useState(false)

  // Submission state
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  // Pipeline visualization state
  const [showPipeline, setShowPipeline] = useState(false)
  const [stepState, setStepState] = useState({})
  const [currentStep, setCurrentStep] = useState(null)

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close()
    }
  }, [])

  // Pipeline helpers
  const addLog = useCallback((stepId, msg) => {
    const timestamp = new Date().toLocaleTimeString()
    setStepState((prev) => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || { status: "pending", logs: [] }),
        logs: [...(prev[stepId]?.logs || []), `${timestamp}: ${msg}`],
      },
    }))
  }, [])

  const setStepStatus = useCallback((stepId, status) => {
    setStepState((prev) => ({
      ...prev,
      [stepId]: { ...(prev[stepId] || { logs: [] }), status },
    }))
  }, [])

  // SSE connection for real-time pipeline updates
  const connectSSE = useCallback((paperId) => {
    if (eventSourceRef.current) eventSourceRef.current.close()
    const sseUrl = `${API()}/api/pipeline/${paperId}/stream`
    const es = new EventSource(sseUrl)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.step && data.status) {
          setStepStatus(data.step, data.status)
          setCurrentStep(data.step)
          if (data.message) addLog(data.step, data.message)
        }
        if (data.type === "error") {
          addLog(data.step || "upload", `Error: ${data.message || data.error}`)
          setStepStatus(data.step || "upload", "error")
        }
      } catch {}
    }

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [addLog, setStepStatus])

  // Drag & drop handlers
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f) }
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)
  const handleFileSelect = (e) => { const f = e.target.files[0]; if (f) setFile(f) }
  const removeFile = () => { setFile(null); if (fileRef.current) fileRef.current.value = "" }

  // Core upload logic (shared by both buttons)
  const performUpload = async (watchPipeline) => {
    if (!title.trim()) return

    setLoading(true)
    setResult(null)
    setProgress(0)

    if (watchPipeline) {
      setShowPipeline(true)
      setStepState({})
      setCurrentStep(null)
    }

    try {
      // Sign upload message
      setProgress(10)
      if (watchPipeline) {
        setStepStatus("upload", "running")
        addLog("upload", "Waiting for wallet signature...")
      }

      const uploadMessage = `RumahPeneliti Paper Submission\n\nTitle: ${title}\nAuthors: ${authors || "N/A"}\nTimestamp: ${new Date().toISOString()}\n\nI approve the submission of this paper for AI curation and on-chain registration.`

      let uploadSignature
      try {
        const ethereum = getEthereum()
        uploadSignature = await ethereum.request({
          method: "personal_sign",
          params: [uploadMessage, address],
        })
      } catch {
        setLoading(false)
        setResult({ error: "Upload cancelled. You must sign the submission to proceed." })
        if (watchPipeline) {
          setStepStatus("upload", "error")
          addLog("upload", "Signature rejected by user")
        }
        return
      }

      setProgress(30)
      if (watchPipeline) addLog("upload", "Signature verified, uploading paper...")

      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 10, 90))
      }, 500)

      const fd = new FormData()
      const token = getStoredToken()
      fd.append("title", title)
      fd.append("authors", authors)
      fd.append("abstract", abstract)
      fd.append("author_wallet", address || "")
      fd.append("price_wei", isFree ? "0" : String(BigInt(Math.floor(Number(price0G) * 1e18))))
      fd.append("upload_message", uploadMessage)
      if (file) fd.append("file", file)

      const res = await fetch(`${API()}/api/papers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-upload-signature": uploadSignature,
        },
        body: fd,
      })
      const data = await res.json()
      clearInterval(interval)
      setProgress(100)
      setResult(data)

      if (data.error) throw new Error(data.error)

      // Pipeline visualization
      if (watchPipeline && data.success) {
        const pipeline = data.pipeline

        // Upload complete
        setStepStatus("upload", "completed")
        addLog("upload", "Paper uploaded successfully")

        // Storage
        setStepStatus("storage", pipeline?.storageUploaded ? "completed" : "completed")
        addLog("storage", pipeline?.storageUploaded ? "Uploaded to 0G Storage" : "File saved locally (0G Storage skipped)")

        // DA Proof
        setStepStatus("da", "completed")
        addLog("da", pipeline?.daProof ? `DA proof published (${pipeline.daProof.slice(0, 16)}...)` : "DA proof skipped")

        // On-chain Anchor
        setStepStatus("anchor", "completed")
        addLog("anchor", pipeline?.chainAnchor ? `Anchored on-chain (tx: ${pipeline.chainAnchor.slice(0, 16)}...)` : "Chain anchor skipped")

        // AI Curation (background)
        setStepStatus("ai", "running")
        addLog("ai", "Starting multi-agent AI pipeline...")

        // NFT Minting (background)
        setStepStatus("nft", "running")
        addLog("nft", "NFT minting queued (gasless, backend-sponsored)")

        // Connect SSE for real-time updates
        if (data.paper?.id) connectSSE(data.paper.id)
      }

      // Simple mode — redirect after success
      if (!watchPipeline && data.success) {
        setTimeout(() => router.push("/browse"), 2000)
      }
    } catch (err) {
      setResult({ error: err.message })
      if (watchPipeline) {
        setStepStatus("upload", "error")
        addLog("upload", `Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSimpleUpload = (e) => {
    e.preventDefault()
    performUpload(false)
  }

  const handlePipelineUpload = (e) => {
    e.preventDefault()
    performUpload(true)
  }

  const handleReset = () => {
    setShowPipeline(false)
    setStepState({})
    setCurrentStep(null)
    setResult(null)
    setLoading(false)
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  // Pipeline complete state
  if (showPipeline && result?.success && !loading) {
    return (
      <div className="space-y-6">
        <PipelineSteps stepState={stepState} currentStep={currentStep} />
        <PipelineResult result={result} />
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Upload Another
          </Button>
        </div>
      </div>
    )
  }

  // Pipeline running state
  if (showPipeline && loading) {
    return (
      <div className="space-y-6">
        <PipelineSteps stepState={stepState} currentStep={currentStep} />
      </div>
    )
  }

  // Simple success state
  if (!showPipeline && result?.success) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
            <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="mt-4 text-xl">
            Paper Uploaded Successfully
          </CardTitle>
          <CardDescription>
            {result.paper?.title || title}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Redirecting to browse page...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Form
  return (
    <form className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          {t("label_title")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder={t("label_title")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* Authors */}
      <div className="space-y-2">
        <Label htmlFor="authors">{t("label_authors")}</Label>
        <Input
          id="authors"
          placeholder={t("label_authors")}
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Abstract */}
      <div className="space-y-2">
        <Label htmlFor="abstract">{t("label_abstract")}</Label>
        <Textarea
          id="abstract"
          placeholder={t("label_abstract")}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          rows={5}
          disabled={loading}
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label>{t("label_file")}</Label>
        {file ? (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
            <FileText className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={removeFile}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Drag &amp; drop or{" "}
                <span className="text-primary underline underline-offset-4">
                  click to browse
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, TXT, DOC, DOCX
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label>{t("label_price")}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={isFree ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setIsFree(true)
              setPrice0G("0")
            }}
            disabled={loading}
          >
            <Gift className="h-3.5 w-3.5" />
            Free Access
          </Button>
          <Button
            type="button"
            variant={!isFree ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setIsFree(false)
              if (price0G === "0") setPrice0G("0.01")
            }}
            disabled={loading}
          >
            <Diamond className="h-3.5 w-3.5" />
            Set Price
          </Button>
        </div>
        {!isFree && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 w-48">
              <Input
                type="number"
                step="0.001"
                min="0"
                value={price0G}
                onChange={(e) => setPrice0G(e.target.value)}
                placeholder="0.01"
                disabled={loading}
              />
              <span className="text-sm font-medium whitespace-nowrap">0G</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Readers pay this amount per access
            </p>
          </div>
        )}
        {isFree && (
          <p className="text-xs text-muted-foreground">
            Free to read. Readers can still donate to support your research.
          </p>
        )}
      </div>

      {/* Progress (simple mode) */}
      {loading && !showPipeline && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">
            {progress <= 10
              ? "Waiting for wallet signature..."
              : "Uploading & processing... " + Math.round(progress) + "%"}
          </p>
        </div>
      )}

      {/* Error */}
      {result?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <Separator />

      {/* Two submit buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleSimpleUpload}
          className="w-full"
          size="lg"
          disabled={loading || !title.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {progress <= 10 ? "Waiting for Signature..." : "Uploading..."}
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Paper
            </>
          )}
        </Button>
        <Button
          onClick={handlePipelineUpload}
          variant="outline"
          className="w-full gap-2"
          size="lg"
          disabled={loading || !title.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Pipeline...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Upload & Watch Pipeline
            </>
          )}
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        You will be asked to sign the submission with your wallet.
        AI curation and on-chain registration will begin after upload.
      </p>
    </form>
  )
}

/* ──────────────────────── Auth Gate: Not Verified ──────────────────────── */

function NotVerifiedGate({ address }) {
  const { connect } = useWallet()
  const [loading, setLoading] = useState(false)

  const handleReconnect = async () => {
    setLoading(true)
    try {
      await connect()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
          <PenLine className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>
        <CardTitle className="mt-4 text-xl">
          Verify Your Wallet
        </CardTitle>
        <CardDescription>
          Sign a message to prove you own this address. This is required for uploading papers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <Badge variant="secondary" className="font-mono text-xs">
          <AddressDisplay address={address} />
        </Badge>
      </CardContent>
      <CardFooter className="justify-center pb-6">
        <Button onClick={handleReconnect} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PenLine className="h-4 w-4" />
          )}
          {loading ? "Waiting for signature..." : "Sign to Verify"}
        </Button>
      </CardFooter>
    </Card>
  )
}

/* ──────────────────────── Page Content ──────────────────────── */

function UploadContent() {
  const { t } = useLanguage()
  const { address, isAuthed } = useWallet()

  return (
    <PageTransition>
    <>
      <Navbar />
      <div className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Page Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
              <UploadCloud className="h-3.5 w-3.5" />
              Research Upload
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("upload_title")}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-lg">
              Upload a research paper for AI curation, decentralized storage, and on-chain registration.
            </p>
          </div>

          {/* Auth Gate: No wallet */}
          {!address && <ConnectGate />}

          {/* Auth Gate: Wallet connected but not verified */}
          {address && !isAuthed && (
            <NotVerifiedGate address={address} />
          )}

          {/* Upload Form */}
          {address && isAuthed && <UploadForm address={address} />}
        </div>
      </div>
      <Footer />
    </>
    </PageTransition>
  )
}

/* ──────────────────────── Page Export ──────────────────────── */

export default function UploadPage() {
  return <UploadContent />
}
