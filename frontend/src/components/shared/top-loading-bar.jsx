"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"

export function TopLoadingBar() {
  const pathname = usePathname()
  const [state, setState] = useState("idle") // idle | loading | completing
  const [width, setWidth] = useState(0)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  function startLoading() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    setState("loading")
    setWidth(Math.random() * 10 + 5)

    intervalRef.current = setInterval(() => {
      setWidth(prev => {
        if (prev >= 80) return prev + 0.5
        if (prev >= 60) return prev + 1
        return prev + 3 + Math.random() * 5
      })
    }, 150)

    timeoutRef.current = setTimeout(() => {
      completeLoading()
    }, 5000)
  }

  function completeLoading() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setWidth(100)
    setState("completing")
  }

  // Detect internal link clicks
  useEffect(() => {
    function onClick(e) {
      const a = e.target.closest("a")
      if (!a) return
      const href = a.getAttribute("href")
      if (!href || !href.startsWith("/") || href.startsWith("//")) return
      const target = href.split("#")[0]
      if (target === pathname || target === "") return

      startLoading()
    }

    document.addEventListener("click", onClick, true)
    return () => {
      document.removeEventListener("click", onClick, true)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [pathname])

  // Pathname changed → navigation completed
  useEffect(() => {
    if (state === "loading") {
      completeLoading()
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // After completing, reset to idle
  useEffect(() => {
    if (state === "completing") {
      const t = setTimeout(() => {
        setState("idle")
        setWidth(0)
      }, 400)
      return () => clearTimeout(t)
    }
  }, [state])

  if (state === "idle") return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]">
      <div
        className="h-full bg-primary"
        style={{
          width: `${width}%`,
          transition: state === "completing"
            ? "width 0.2s ease-out, opacity 0.3s ease-out 0.1s"
            : "width 0.15s linear",
          opacity: state === "completing" ? 0 : 1,
        }}
      />
    </div>
  )
}
