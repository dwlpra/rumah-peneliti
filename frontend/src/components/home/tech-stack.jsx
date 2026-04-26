import { Database, ShieldCheck, Cpu, FileCode } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const TECH_STACK = [
  {
    icon: Database,
    name: "0G Storage",
    description: "Decentralized permanent storage with cryptographic Merkle proof verification.",
  },
  {
    icon: ShieldCheck,
    name: "0G DA Layer",
    description: "Data availability proofs with blob commitment for guaranteed data integrity.",
  },
  {
    icon: Cpu,
    name: "0G Compute",
    description: "Verifiable AI processing with TEE attestation for trustless curation pipeline.",
  },
  {
    icon: FileCode,
    name: "0G Smart Contracts",
    description: "Immutable on-chain anchoring and ERC-721 NFT minting on 0G Galileo testnet.",
  },
]

export function TechStack() {
  return (
    <section className="border-b bg-muted/30">
      <div className="container mx-auto max-w-screen-xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              All Systems Operational
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built on{" "}
            <span className="text-primary">0G Network</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Full decentralized infrastructure — Storage, DA Layer, Compute, and Chain
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_STACK.map(item => {
            const Icon = item.icon
            return (
              <Card key={item.name} className="text-center">
                <CardContent className="flex flex-col items-center p-6">
                  {/* Icon */}
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  {/* Name */}
                  <h3 className="mb-1 text-sm font-semibold">
                    {item.name}
                  </h3>

                  {/* Status */}
                  <div className="mb-3 flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Operational
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
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
