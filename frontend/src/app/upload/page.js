"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AddressDisplay } from "@/components/shared/address-display"
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
import { useWallet, WalletProvider } from "@/contexts/wallet"
import { useLanguage } from "@/contexts/language"
import { loginWithWallet, getStoredToken, getStoredAddress } from "@/lib/auth"
import { getApiUrl } from "@/lib/api-url"

/* ──────────────────────── Auth Gate: No Wallet ──────────────────────── */

function ConnectGate() {
  const { connect } = useWallet()
  const { t } = useLanguage()

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
        <Button onClick={connect} className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </CardFooter>
    </Card>
  )
}

/* ──────────────────────── Auth Gate: Not Verified ──────────────────────── */

function VerifyGate({ address, onVerified }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleVerify = async () => {
    setError(null)
    setLoading(true)
    try {
      await loginWithWallet(address)
      onVerified()
    } catch (err) {
      setError(err.message || "Authentication failed")
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
          Sign a message to prove you own this address.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <Badge variant="secondary" className="font-mono text-xs">
          <AddressDisplay address={address} />
        </Badge>
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center pb-6">
        <Button onClick={handleVerify} disabled={loading} className="gap-2">
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

/* ──────────────────────── Upload Form ──────────────────────── */

function UploadForm({ address }) {
  const { t } = useLanguage()
  const router = useRouter()
  const fileRef = useRef(null)

  // Form state
  const [title, setTitle] = useState("")
  const [authors, setAuthors] = useState("")
  const [abstract, setAbstract] = useState("")
  const [file, setFile] = useState(null)
  const [isFree, setIsFree] = useState(true)
  const [priceWei, setPriceWei] = useState("10000000000000000")
  const [dragOver, setDragOver] = useState(false)

  // Submission state
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (f) setFile(f)
  }

  const removeFile = () => {
    setFile(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setResult(null)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90))
    }, 500)

    const fd = new FormData()
    const token = getStoredToken()
    fd.append("title", title)
    fd.append("authors", authors)
    fd.append("abstract", abstract)
    fd.append("author_wallet", address || "")
    fd.append("price_wei", isFree ? "0" : priceWei)
    if (file) fd.append("file", file)

    try {
      const res = await fetch(`${getApiUrl()}/api/papers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      clearInterval(interval)
      setProgress(100)
      setResult(data)

      if (data.success) {
        setTimeout(() => router.push("/browse"), 2000)
      }
      if (data.error) throw new Error(data.error)
    } catch (err) {
      clearInterval(interval)
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (result?.success) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              setPriceWei("0")
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
              if (priceWei === "0") setPriceWei("10000000000000000")
            }}
            disabled={loading}
          >
            <Diamond className="h-3.5 w-3.5" />
            Set Price
          </Button>
        </div>
        {!isFree && (
          <div className="space-y-1.5">
            <Input
              type="text"
              value={priceWei}
              onChange={(e) => setPriceWei(e.target.value)}
              placeholder="Price in wei"
              disabled={loading}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {"\u2248"} {(Number(priceWei) / 1e18).toFixed(4)} 0G per access
            </p>
          </div>
        )}
        {isFree && (
          <p className="text-xs text-muted-foreground">
            Free to read. Readers can still donate to support your research.
          </p>
        )}
      </div>

      {/* Progress */}
      {loading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">
            Uploading... {Math.round(progress)}%
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

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || !title.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Paper
          </>
        )}
      </Button>
    </form>
  )
}

/* ──────────────────────── Page Content ──────────────────────── */

function UploadContent() {
  const { t } = useLanguage()
  const { address, connect } = useWallet()
  const [isAuthed, setIsAuthed] = useState(false)

  // Check stored auth on mount and when address changes
  useEffect(() => {
    const token = getStoredToken()
    const storedAddr = getStoredAddress()
    if (
      token &&
      storedAddr &&
      address &&
      storedAddr.toLowerCase() === address.toLowerCase()
    ) {
      setIsAuthed(true)
    } else {
      setIsAuthed(false)
    }
  }, [address])

  return (
    <>
      <Navbar />
      <div className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Page Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("upload_title")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("upload_subtitle")}
            </p>
          </div>

          {/* Auth Gate: No wallet */}
          {!address && <ConnectGate />}

          {/* Auth Gate: Wallet connected but not verified */}
          {address && !isAuthed && (
            <VerifyGate
              address={address}
              onVerified={() => setIsAuthed(true)}
            />
          )}

          {/* Upload Form */}
          {address && isAuthed && <UploadForm address={address} />}
        </div>
      </div>
      <Footer />
    </>
  )
}

/* ──────────────────────── Page Export ──────────────────────── */

export default function UploadPage() {
  return (
    <WalletProvider>
      <UploadContent />
    </WalletProvider>
  )
}
