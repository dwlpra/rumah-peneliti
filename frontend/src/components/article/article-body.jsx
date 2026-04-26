"use client"

import { useState, useEffect } from "react"
import { Clock, User, Calendar } from "lucide-react"

export function ArticleBody({ article }) {
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        setReadingProgress((window.scrollY / scrollHeight) * 100)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const bodyContent = article.body || article.content || ""
  const paragraphs = bodyContent.split("\n\n").filter(Boolean)

  return (
    <>
      {/* Reading progress bar */}
      <div
        className="reading-progress"
        style={{ width: `${readingProgress}%` }}
      />

      <article className="prose prose-slate dark:prose-invert max-w-none">
        {/* Paragraphs rendered with academic typography */}
        {paragraphs.length > 0 ? (
          <div className="space-y-5">
            {paragraphs.map((para, i) => {
              const trimmed = para.trim()
              if (!trimmed) return null

              // Detect headings
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={i} className="text-2xl font-bold tracking-tight mt-10 mb-4">
                    {trimmed.slice(2)}
                  </h2>
                )
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={i} className="text-xl font-semibold tracking-tight mt-8 mb-3">
                    {trimmed.slice(3)}
                  </h3>
                )
              }
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={i} className="text-lg font-semibold mt-6 mb-2">
                    {trimmed.slice(4)}
                  </h4>
                )
              }

              // Detect list items
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const items = trimmed.split("\n").filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "))
                return (
                  <ul key={i} className="list-disc pl-6 space-y-1.5 text-base leading-relaxed">
                    {items.map((item, j) => (
                      <li key={j}>{item.replace(/^[\s]*[-*]\s*/, "")}</li>
                    ))}
                  </ul>
                )
              }

              // Regular paragraph
              return (
                <p key={i} className="text-base leading-relaxed">
                  {trimmed}
                </p>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Full article content not available yet.</p>
        )}
      </article>
    </>
  )
}
