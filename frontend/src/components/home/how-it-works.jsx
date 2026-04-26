import { Upload, Brain, Link2, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const STEPS = [
  {
    number: 1,
    icon: Upload,
    title: "Upload Paper",
    description: "Submit your research paper in PDF format. Metadata is extracted and stored on 0G decentralized storage.",
  },
  {
    number: 2,
    icon: Brain,
    title: "AI Curation",
    description: "Multi-agent AI pipeline analyzes, summarizes, and scores your paper for quality and accessibility.",
  },
  {
    number: 3,
    icon: Link2,
    title: "On-chain Anchor",
    description: "Paper hash is anchored on 0G blockchain with a cryptographic proof for permanent verification.",
  },
  {
    number: 4,
    icon: Award,
    title: "NFT Minting",
    description: "A unique ERC-721 Research NFT is minted for your paper — verifiable proof of authorship on-chain.",
  },
]

export function HowItWorks() {
  return (
    <section className="border-b bg-background">
      <div className="container mx-auto max-w-screen-xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How It Works
          </h2>
          <p className="mt-2 text-muted-foreground">
            From paper upload to on-chain verification in four steps
          </p>
        </div>

        {/* Steps Grid */}
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
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
