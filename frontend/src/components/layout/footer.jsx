import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/upload", label: "Upload" },
  { href: "/pipeline", label: "Pipeline" },
]

const RESOURCE_LINKS = [
  { href: "/tech", label: "Technology" },
  { href: "/verify", label: "Verify" },
  { href: "/analytics", label: "Analytics" },
  { href: "/leaderboard", label: "Leaderboard" },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto max-w-screen-xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 font-bold mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-lg">
                Rumah<span className="text-primary">Peneliti</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A decentralized research platform powered by AI curation and blockchain micropayments. Making academic research accessible to everyone.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {year} RumahPeneliti. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a
              href="https://chainscan-galileo.0g.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              0G Network
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
