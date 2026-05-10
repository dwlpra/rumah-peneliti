"use client"

import { Database, ShieldCheck, Cpu, FileCode } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { useLanguage } from "@/contexts/language"

const TECH_STACK = [
  {
    icon: Database,
    nameKey: "tech_storage_name",
    descKey: "tech_storage_desc",
  },
  {
    icon: ShieldCheck,
    nameKey: "tech_da_name",
    descKey: "tech_da_desc",
  },
  {
    icon: Cpu,
    nameKey: "tech_compute_name",
    descKey: "tech_compute_desc",
  },
  {
    icon: FileCode,
    nameKey: "tech_chain_name",
    descKey: "tech_chain_desc",
  },
]

export function TechStack() {
  const { t } = useLanguage()

  return (
    <section className="border-b bg-muted/30">
      <div className="container mx-auto max-w-screen-xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {t('tech_badge')}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('tech_title_before')}{" "}
            <span className="text-primary">{t('tech_title_highlight')}</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('tech_subtitle')}
          </p>
        </div>

        {/* Cards Grid */}
        <ScrollReveal stagger>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_STACK.map(item => {
            const Icon = item.icon
            return (
              <Card key={item.nameKey} className="text-center">
                <CardContent className="flex flex-col items-center p-6">
                  {/* Icon */}
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  {/* Name */}
                  <h3 className="mb-1 text-sm font-semibold">
                    {t(item.nameKey)}
                  </h3>

                  {/* Status */}
                  <div className="mb-3 flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {t('tech_status_ok')}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
