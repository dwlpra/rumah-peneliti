"use client"

import { useState, useRef } from "react"
import {
  UploadCloud,
  FileText,
  Gift,
  Diamond,
  Loader2,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language"
import { cn } from "@/lib/utils"

export function PipelineForm({ onSubmit, loading }) {
  const { t } = useLanguage()
  const fileRef = useRef(null)

  const [title, setTitle] = useState("")
  const [authors, setAuthors] = useState("")
  const [abstract, setAbstract] = useState("")
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [isFree, setIsFree] = useState(true)
  const [priceWei, setPriceWei] = useState("10000000000000000")

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !file) return
    onSubmit({
      title,
      authors,
      abstract,
      file,
      price_wei: isFree ? "0" : priceWei,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Paper Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="pipeline-title">
              {t("label_title")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pipeline-title"
              placeholder={t("label_title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Authors */}
          <div className="space-y-1.5">
            <Label htmlFor="pipeline-authors">{t("label_authors")}</Label>
            <Input
              id="pipeline-authors"
              placeholder={t("label_authors")}
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Abstract */}
          <div className="space-y-1.5">
            <Label htmlFor="pipeline-abstract">{t("label_abstract")}</Label>
            <Textarea
              id="pipeline-abstract"
              placeholder={t("label_abstract")}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* File Upload Zone */}
          <div className="space-y-1.5">
            <Label>{t("label_file")}</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                file && "border-emerald-500/50 bg-emerald-500/5"
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md,.docx,.doc"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              {file ? (
                <>
                  <FileText className="h-8 w-8 text-emerald-600" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{file.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop your paper or{" "}
                    <span className="text-primary font-medium">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    PDF, TXT, MD, DOCX
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Price Toggle */}
          <div className="space-y-1.5">
            <Label>{t("label_price")}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isFree ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsFree(true)
                }}
                disabled={loading}
                className="gap-1.5"
              >
                <Gift className="h-4 w-4" />
                Free Access
              </Button>
              <Button
                type="button"
                variant={!isFree ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsFree(false)
                }}
                disabled={loading}
                className="gap-1.5"
              >
                <Diamond className="h-4 w-4" />
                Set Price
              </Button>
            </div>
            {!isFree && (
              <div className="mt-2 space-y-1">
                <Input
                  type="text"
                  value={priceWei}
                  onChange={(e) => setPriceWei(e.target.value)}
                  placeholder="Price in wei"
                  disabled={loading}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {(Number(priceWei) / 1e18).toFixed(4)} 0G per access
                </p>
              </div>
            )}
            {isFree && (
              <p className="text-xs text-muted-foreground mt-1">
                Free to read. Readers can still donate to support your research.
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full gap-2"
            size="lg"
            disabled={loading || !title || !file}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Run Pipeline
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
