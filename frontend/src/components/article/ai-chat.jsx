"use client"

import { useState } from "react"
import { MessageSquare, Send, Loader2, Bot, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getApiUrl } from "@/lib/api-url"
import { getStoredToken } from "@/lib/auth"

function renderMarkdown(text) {
  if (!text) return null

  const lines = text.split("\n")
  const elements = []
  let key = 0

  for (const line of lines) {
    // Numbered list: "1. **Bold:** text"
    const listMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (listMatch) {
      elements.push(
        <div key={key++} className="flex gap-1.5 ml-1">
          <span className="font-semibold shrink-0">{listMatch[1]}.</span>
          <span>{formatInline(listMatch[2])}</span>
        </div>
      )
      continue
    }

    // Bullet list: "- text" or "* text"
    const bulletMatch = line.match(/^[-*]\s+(.*)$/)
    if (bulletMatch) {
      elements.push(
        <div key={key++} className="flex gap-1.5 ml-1">
          <span className="shrink-0">&bull;</span>
          <span>{formatInline(bulletMatch[1])}</span>
        </div>
      )
      continue
    }

    // Empty line = spacing
    if (!line.trim()) {
      elements.push(<div key={key++} className="h-1" />)
      continue
    }

    // Regular paragraph
    elements.push(<div key={key++}>{formatInline(line)}</div>)
  }

  return elements
}

function formatInline(text) {
  const parts = []
  // Split on **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let lastIndex = 0
  let match
  let i = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[2]) {
      parts.push(<strong key={i++}>{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={i++}>{match[3]}</em>)
    } else if (match[4]) {
      parts.push(<code key={i++} className="rounded bg-background/50 px-1 py-0.5 text-xs font-mono">{match[4]}</code>)
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

export function AIChat({ paperId, article }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const sendChat = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", text: userMsg }])
    setLoading(true)

    try {
      const token = getStoredToken()
      const headers = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(`${getApiUrl()}/api/papers/${paperId}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply || "Sorry, I couldn't process that." },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "AI service unavailable. Please try again." },
      ])
    }
    setLoading(false)
  }

  return (
    <div className="mt-6">
      {/* Toggle button */}
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => setOpen(!open)}
      >
        <MessageSquare className="h-4 w-4" />
        Ask AI about this paper
      </Button>

      {open && (
        <Card className="mt-2">
          <CardContent className="p-4">
            {/* Messages area */}
            <div className="max-h-[280px] overflow-y-auto mb-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Ask me anything about &ldquo;{article?.curated_title || "this paper"}&rdquo;
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "ai" && (
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.role === "ai" ? renderMarkdown(m.text) : m.text}
                  </div>
                  {m.role === "user" && (
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Ask about this paper..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendChat}
                disabled={loading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
