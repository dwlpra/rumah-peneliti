import { useEffect, useRef } from "react"

export function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px" } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip animation if user prefers reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) {
      el.classList.add("visible")
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
          observer.unobserve(entry.target)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return ref
}
