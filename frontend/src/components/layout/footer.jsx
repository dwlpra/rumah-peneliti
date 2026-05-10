"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language"

export function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  const NAV_LINKS = [
    { href: "/", label: t('nav_home') },
    { href: "/browse", label: t('nav_browse') },
    { href: "/upload", label: t('nav_upload') },
  ]

  const RESOURCE_LINKS = [
    { href: "/agents", label: t('footer_nav_agents') },
    { href: "/tech", label: t('footer_nav_tech') },
    { href: "/verify", label: t('footer_nav_verify') },
    { href: "/analytics", label: t('footer_nav_analytics') },
    { href: "/leaderboard", label: t('footer_nav_leaderboard') },
  ]

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
              {t('footer_desc_new')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold mb-3">{t('footer_nav')}</h4>
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
            <h4 className="text-sm font-semibold mb-3">{t('footer_resources')}</h4>
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
            &copy; {year} RumahPeneliti. {t('footer_rights')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('footer_powered_by')}{" "}
            <a
              href="https://chainscan.0g.ai"
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
