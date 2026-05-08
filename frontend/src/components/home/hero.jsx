"use client"

import Link from "next/link"
import { BookOpen, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language"

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden border-b hero-gradient">
      {/* Decorative floating blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="hero-float-1 absolute top-20 left-[10%] h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
        <div className="hero-float-2 absolute top-40 right-[15%] h-32 w-32 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="hero-float-3 absolute bottom-10 left-[40%] h-20 w-20 rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className="container relative mx-auto flex max-w-screen-xl flex-col items-center px-4 py-20 text-center md:py-28 lg:py-32">
        {/* Heading */}
        <div className="hero-entrance hero-entrance-1">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-primary">{t("hero_title_1")}</span>
            <br />
            <span className="text-foreground">{t("hero_title_2")}</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="hero-entrance hero-entrance-3">
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            {t("hero_subtitle")}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="hero-entrance hero-entrance-4">
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/browse">
                <BookOpen className="h-4 w-4" />
                {t("btn_explore")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/upload">
                <Upload className="h-4 w-4" />
                Upload Paper
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
