"use client"

import { useEffect, useState } from "react"

export function PageTransition({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Use requestAnimationFrame to ensure the initial state is painted first
    requestAnimationFrame(() => setMounted(true))
  }, [])

  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  )
}
