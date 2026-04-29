"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Cpu, RotateCcw } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PipelineForm } from "@/components/pipeline/pipeline-form"
import { PipelineSteps } from "@/components/pipeline/pipeline-steps"
import { PipelineResult } from "@/components/pipeline/pipeline-result"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useWallet, WalletProvider } from "@/contexts/wallet"
import { useLanguage } from "@/contexts/language"
import { getApiUrl } from "@/lib/api-url"
import { getStoredToken } from "@/lib/auth"

const API = () => getApiUrl()

const STEPS = [
  { id: "upload", title: "Upload", desc: "Paper uploaded to server" },
  { id: "ai", title: "AI Curation", desc: "Multi-agent AI pipeline processing" },
  { id: "storage", title: "0G Storage", desc: "Upload to decentralized storage" },
  { id: "da", title: "DA Proof", desc: "Data availability proof" },
  { id: "anchor", title: "On-chain Anchor", desc: "Anchor paper hash on blockchain" },
  { id: "nft", title: "NFT Minting", desc: "Mint research NFT (ERC-721)" },
]

function PipelineContent() {
  const { address } = useWallet()
  const { t } = useLanguage()

  const [phase, setPhase] = useState("idle") // idle | running | complete
  const [stepState, setStepState] = useState({})
  const [currentStep, setCurrentStep] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const eventSourceRef = useRef(null)

  // Helper: add a log message to a step
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

  // Helper: set step status
  const setStepStatus = useCallback((stepId, status) => {
    setStepState((prev) => ({
      ...prev,
      [stepId]: { ...(prev[stepId] || { logs: [] }), status },
    }))
  }, [])

  // SSE: listen for real-time step updates
  const connectSSE = useCallback(
    (paperId) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const sseUrl = `${API()}/api/pipeline/${paperId}/stream`
      const es = new EventSource(sseUrl)
      eventSourceRef.current = es

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.step && data.status) {
            setStepStatus(data.step, data.status)
            setCurrentStep(data.step)

            if (data.message) {
              addLog(data.step, data.message)
            }
          }

          if (data.type === "complete" || data.status === "complete") {
            es.close()
            eventSourceRef.current = null
            setPhase("complete")
          }

          if (data.type === "error") {
            addLog(data.step || currentStep || "upload", `Error: ${data.message || data.error}`)
            setStepStatus(data.step || currentStep || "upload", "error")
          }
        } catch {
          // Non-JSON message, ignore
        }
      }

      es.onerror = () => {
        es.close()
        eventSourceRef.current = null
      }
    },
    [addLog, setStepStatus, currentStep]
  )

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  // Main pipeline execution
  const handlePipelineRun = useCallback(
    async (formData) => {
      setLoading(true)
      setPhase("running")
      setStepState({})
      setResult(null)

      const fd = new FormData()
      fd.append("file", formData.file)
      fd.append("title", formData.title)
      if (formData.authors) fd.append("authors", formData.authors)
      if (formData.abstract) fd.append("abstract", formData.abstract)
      fd.append("price_wei", formData.price_wei)
      if (address) fd.append("author_wallet", address)

      const token = getStoredToken()
      const headers = {}
      if (token) headers["Authorization"] = `Bearer ${token}`

      // Step 1: Upload
      setCurrentStep("upload")
      setStepStatus("upload", "running")
      addLog("upload", "Uploading paper to server...")

      try {
        const res = await fetch(`${API()}/api/pipeline/run`, {
          method: "POST",
          headers,
          body: fd,
        })

        const data = await res.json()

        if (!res.ok || data.error) {
          setStepStatus("upload", "error")
          addLog("upload", `Error: ${data.error || "Upload failed"}`)
          setLoading(false)
          return
        }

        setResult(data)

        // Process pipeline results from response
        if (data.pipeline) {
          // Storage
          if (data.pipeline.storageUploaded) {
            setStepStatus("storage", "running")
            addLog("storage", "Uploading to 0G Storage...")
            setStepStatus("storage", "completed")
            addLog("storage", "Uploaded to 0G Storage successfully")
          } else {
            setStepStatus("storage", "completed")
            addLog("storage", "File saved locally (0G Storage skipped)")
          }

          // DA Proof
          if (data.pipeline.daProof) {
            setStepStatus("da", "running")
            addLog("da", `Blob hash: ${data.pipeline.daProof}`)
            setStepStatus("da", "completed")
            addLog("da", "DA proof published")
          } else {
            setStepStatus("da", "completed")
            addLog("da", "DA proof skipped")
          }

          // On-chain Anchor
          if (data.pipeline.chainAnchor) {
            setStepStatus("anchor", "running")
            addLog("anchor", `Transaction: ${data.pipeline.chainAnchor}`)
            setStepStatus("anchor", "completed")
            addLog("anchor", "Paper anchored on-chain")
          } else {
            setStepStatus("anchor", "completed")
            addLog("anchor", "Chain anchor skipped")
          }
        }

        // Mark upload as completed
        setStepStatus("upload", "completed")
        addLog("upload", "Paper uploaded successfully")

        // AI Curation
        setCurrentStep("ai")
        setStepStatus("ai", "running")
        addLog("ai", "Starting multi-agent AI pipeline...")
        setStepStatus("ai", "completed")
        addLog("ai", "AI curation queued (check article page shortly)")

        // NFT Minting
        setCurrentStep("nft")
        setStepStatus("nft", "running")
        addLog("nft", "NFT minting queued...")
        setStepStatus("nft", "completed")
        addLog("nft", "NFT minting started (gasless, backend-sponsored)")

        // Try SSE connection for real-time updates
        const paperId = data.paper?.id
        if (paperId) {
          connectSSE(paperId)
        }

        setPhase("complete")
      } catch (err) {
        setStepStatus("upload", "error")
        addLog("upload", `Error: ${err.message}`)
      }

      setLoading(false)
    },
    [address, addLog, setStepStatus, connectSSE]
  )

  // Reset pipeline
  const handleReset = () => {
    setPhase("idle")
    setStepState({})
    setCurrentStep(null)
    setResult(null)
    setLoading(false)
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  return (
    <>
      <Navbar />

      <div className="container mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            <Cpu className="h-3.5 w-3.5" />
            Blockchain Pipeline
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pipeline Wizard
          </h1>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Upload a research paper and watch the AI + blockchain pipeline
            process it in real-time
          </p>
        </div>

        <Separator className="mb-8" />

        {/* State: Idle — Show form */}
        {phase === "idle" && (
          <PipelineForm onSubmit={handlePipelineRun} loading={loading} />
        )}

        {/* State: Running — Show steps */}
        {phase === "running" && (
          <div className="space-y-6">
            <PipelineSteps stepState={stepState} currentStep={currentStep} />
          </div>
        )}

        {/* State: Complete — Show result */}
        {phase === "complete" && (
          <div className="space-y-6">
            <PipelineResult result={result} />

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Run Another
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}

export default function PipelinePage() {
  return (
    <WalletProvider>
      <PipelineContent />
    </WalletProvider>
  )
}
