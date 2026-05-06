"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function ScrollReveal({ children, className = "", stagger = false, ...props }) {
  const ref = useScrollReveal()
  return (
    <div ref={ref} className={`${stagger ? "reveal-stagger" : "reveal"} ${className}`} {...props}>
      {children}
    </div>
  )
}
