"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * /pipeline now redirects to /upload
 * The pipeline visualization is integrated into the upload page
 * via the "Upload & Watch Pipeline" button.
 */
export default function PipelinePage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/upload")
  }, [router])
  return null
}
