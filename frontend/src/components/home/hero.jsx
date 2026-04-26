"use client"

import Link from "next/link"
import { BookOpen, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language"

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden border-b bg-muted/30">
      <div className="container mx-auto flex max-w-screen-xl flex-col items-center px-4 py-20 text-center md:py-28 lg:py-32">
        {/* Badge */}
        <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          {t("hero_badge")}
        </Badge>

        {/* Heading */}
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-primary">{t("hero_title_1")}</span>
          <br />
          <span className="text-foreground">{t("hero_title_2")}</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          {t("hero_subtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/browse">
              <BookOpen className="h-4 w-4" />
              {t("btn_explore")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/pipeline">
              <FlaskConical className="h-4 w-4" />
              Try Pipeline
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
