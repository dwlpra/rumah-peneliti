"use client"

import {
  Upload,
  Brain,
  Database,
  ShieldCheck,
  Link2,
  Award,
  Cpu,
  FileCode,
  Server,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ExplorerLink } from "@/components/shared/explorer-link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CONTRACTS, EXPLORER_URL } from "@/lib/constants"
import { PageTransition } from "@/components/shared/page-transition"
import { useLanguage } from "@/contexts/language"

function PipelineStep({ step, titleKey, descKey, icon: Icon, tech }) {
  const { t } = useLanguage()
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {step}
      </div>
      <CardContent className="pt-6 pb-4 space-y-2">
        <Icon className="h-6 w-6 text-primary" />
        <h3 className="font-semibold">{t(titleKey)}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t(descKey)}
        </p>
        <Badge variant="secondary" className="text-xs font-mono">
          {tech}
        </Badge>
      </CardContent>
    </Card>
  )
}

function TechCard({ name, descKey, icon: Icon, statusKey }) {
  const { t } = useLanguage()
  return (
    <Card>
      <CardContent className="pt-6 pb-4 text-center space-y-3">
        <Icon className="h-8 w-8 text-primary mx-auto" />
        <h3 className="font-semibold">{name}</h3>
        <div className="flex items-center justify-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-600 font-medium">
            {t(statusKey)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t(descKey)}
        </p>
      </CardContent>
    </Card>
  )
}

const PIPELINE_STEPS = [
  { step: 1, titleKey: "tech_page_step1_title", descKey: "tech_page_step1_desc", icon: Upload, tech: "REST API" },
  { step: 2, titleKey: "tech_page_step2_title", descKey: "tech_page_step2_desc", icon: Brain, tech: "0G Compute" },
  { step: 3, titleKey: "tech_page_step3_title", descKey: "tech_page_step3_desc", icon: Database, tech: "0G Storage SDK" },
  { step: 4, titleKey: "tech_page_step4_title", descKey: "tech_page_step4_desc", icon: ShieldCheck, tech: "PaperAnchor.sol" },
  { step: 5, titleKey: "tech_page_step5_title", descKey: "tech_page_step5_desc", icon: Link2, tech: "0G DA" },
  { step: 6, titleKey: "tech_page_step6_title", descKey: "tech_page_step6_desc", icon: Award, tech: "ResearchNFT.sol" },
]

const TECH_STACK = [
  { name: "0G Storage", descKey: "tech_storage_desc", icon: Database, statusKey: "tech_status_ok" },
  { name: "0G DA Layer", descKey: "tech_da_desc", icon: Link2, statusKey: "tech_status_ok" },
  { name: "0G Compute", descKey: "tech_compute_desc", icon: Cpu, statusKey: "tech_status_ok" },
  { name: "Smart Contracts", descKey: "tech_page_sc_desc", icon: FileCode, statusKey: "tech_status_ok" },
]



const DEPLOYED_CONTRACTS = [
  {
    name: "JournalPayment",
    desc: "Handles micropayments for paper access with author distribution",
    address: CONTRACTS.journalPayment,
    icon: FileCode,
    color: "text-blue-500",
  },
  {
    name: "PaperAnchor",
    desc: "Anchors paper hashes on-chain for verification and timestamping",
    address: CONTRACTS.paperAnchor,
    icon: ShieldCheck,
    color: "text-amber-500",
  },
  {
    name: "ResearchNFT",
    desc: "Mints unique ERC-721 NFTs as proof of research contribution",
    address: CONTRACTS.researchNFT,
    icon: Award,
    color: "text-violet-500",
  },
]

export default function TechPage() {
  const { t } = useLanguage()

  return (
    <PageTransition>
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Header */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-screen-xl px-4 py-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('tech_page_title')}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
              {t('tech_page_subtitle')}
            </p>
          </div>
        </section>

        {/* Pipeline Steps */}
        <section className="container mx-auto max-w-screen-xl px-4 py-10">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {t('tech_pipeline_arch')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE_STEPS.map((step) => (
              <PipelineStep key={step.step} {...step} />
            ))}
          </div>
        </section>

        {/* 0G Tech Stack */}
        <section className="container mx-auto max-w-screen-xl px-4 pb-10">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {t('tech_page_stack')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_STACK.map((tech) => (
              <TechCard key={tech.name} {...tech} />
            ))}
          </div>
        </section>

        {/* Deployed Contracts */}
        <section className="container mx-auto max-w-screen-xl px-4 pb-10">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {t('tech_page_deployed')}
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {DEPLOYED_CONTRACTS.map((c) => {
              const Icon = c.icon
              return (
                <Card key={c.name}>
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className={`h-5 w-5 ${c.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{c.name}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                    <ExplorerLink
                      type="address"
                      value={c.address}
                      className="text-xs shrink-0"
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Ponder Indexer */}
        <section className="container mx-auto max-w-screen-xl px-4 pb-10">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Server className="h-5 w-5 text-primary" />
                  {t('tech_page_ponder_title')}
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 text-xs">
                    {t('tech_page_ponder_badge')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('tech_page_ponder_desc')}
                </p>
                <Separator />
                <div className="text-xs text-muted-foreground font-mono space-y-1">
                  <p>&bull; {t('tech_page_ponder_events')}</p>
                  <p>&bull; {t('tech_page_ponder_db')}</p>
                  <p>&bull; {t('tech_page_ponder_api')}</p>
                  <p>&bull; {t('tech_page_ponder_sync')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
    </PageTransition>
  )
}
