"use client"

import { Upload, Brain, Link2, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { useLanguage } from "@/contexts/language"

const STEPS = [
  {
    number: 1,
    icon: Upload,
    titleKey: "hiw_step1_title",
    descKey: "hiw_step1_desc",
  },
  {
    number: 2,
    icon: Brain,
    titleKey: "hiw_step2_title",
    descKey: "hiw_step2_desc",
  },
  {
    number: 3,
    icon: Link2,
    titleKey: "hiw_step3_title",
    descKey: "hiw_step3_desc",
  },
  {
    number: 4,
    icon: Award,
    titleKey: "hiw_step4_title",
    descKey: "hiw_step4_desc",
  },
]

export function HowItWorks() {
  const { t } = useLanguage()

  return (
    <section className="border-b bg-background">
      <div className="container mx-auto max-w-screen-xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('hiw_title')}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('hiw_subtitle')}
          </p>
        </div>

        {/* Steps Grid */}
        <ScrollReveal stagger>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(step => {
            const Icon = step.icon
            return (
              <Card key={step.number} className="relative">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  {/* Step number */}
                  <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-sm font-semibold">
                    {t(step.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(step.descKey)}
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
