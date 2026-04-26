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

const PIPELINE_STEPS = [
  {
    step: 1,
    title: "Upload",
    desc: "Submit your research paper to the platform",
    icon: Upload,
    tech: "REST API",
  },
  {
    step: 2,
    title: "AI Curation",
    desc: "Multi-agent AI pipeline generates a curated article",
    icon: Brain,
    tech: "0G Compute",
  },
  {
    step: 3,
    title: "0G Storage",
    desc: "Paper data is stored on decentralized 0G Storage",
    icon: Database,
    tech: "0G Storage SDK",
  },
  {
    step: 4,
    title: "On-Chain Anchor",
    desc: "Paper hash is anchored to 0G blockchain for verification",
    icon: ShieldCheck,
    tech: "PaperAnchor.sol",
  },
  {
    step: 5,
    title: "Data Availability",
    desc: "Storage root published to 0G DA Layer",
    icon: Link2,
    tech: "0G DA",
  },
  {
    step: 6,
    title: "NFT Minting",
    desc: "Unique ERC-721 Research NFT minted for the paper",
    icon: Award,
    tech: "ResearchNFT.sol",
  },
]

const TECH_STACK = [
  {
    name: "0G Storage",
    desc: "Decentralized storage for research paper data and metadata",
    icon: Database,
    status: "Operational",
  },
  {
    name: "0G DA Layer",
    desc: "Data availability proofs for guaranteed data retrieval",
    icon: Link2,
    status: "Operational",
  },
  {
    name: "0G Compute",
    desc: "Decentralized AI compute for paper curation and scoring",
    icon: Cpu,
    status: "Operational",
  },
  {
    name: "Smart Contracts",
    desc: "On-chain anchoring, NFT minting, and micropayments",
    icon: FileCode,
    status: "Operational",
  },
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
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Header */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-screen-xl px-4 py-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Technology
            </h1>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
              Built on the 0G Network with decentralized storage, AI compute,
              and verifiable smart contracts.
            </p>
          </div>
        </section>

        {/* Pipeline Steps */}
        <section className="container mx-auto max-w-screen-xl px-4 py-10">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Pipeline Architecture
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <Card key={step.step} className="relative overflow-hidden">
                  <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.step}
                  </div>
                  <CardContent className="pt-6 pb-4 space-y-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {step.tech}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* 0G Tech Stack */}
        <section className="container mx-auto max-w-screen-xl px-4 pb-10">
          <h2 className="text-xl font-semibold mb-6 text-center">
            0G Tech Stack
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_STACK.map((tech) => {
              const Icon = tech.icon
              return (
                <Card key={tech.name}>
                  <CardContent className="pt-6 pb-4 text-center space-y-3">
                    <Icon className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold">{tech.name}</h3>
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-600 font-medium">
                        {tech.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tech.desc}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Deployed Contracts */}
        <section className="container mx-auto max-w-screen-xl px-4 pb-10">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Deployed Smart Contracts
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
                  Ponder Blockchain Indexer
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 text-xs">
                    Realtime
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Real-time event indexing using Ponder v0.7 with PGlite
                  embedded database. All on-chain events from PaperAnchor,
                  ResearchNFT, and JournalPayment contracts are indexed and
                  queryable via GraphQL API.
                </p>
                <Separator />
                <div className="text-xs text-muted-foreground font-mono space-y-1">
                  <p>
                    &bull; Events: PaperAnchored, ArticleAnchored,
                    ResearchMinted, PaperPurchased
                  </p>
                  <p>&bull; Database: PGlite (embedded PostgreSQL)</p>
                  <p>&bull; API: GraphQL at /graphql, REST at /api/activity</p>
                  <p>&bull; Auto-sync: listens to new blocks in real-time</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
