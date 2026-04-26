import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/home/hero"
import { Stats } from "@/components/home/stats"
import { LatestPapers } from "@/components/home/latest-papers"
import { HowItWorks } from "@/components/home/how-it-works"
import { TechStack } from "@/components/home/tech-stack"
import { OnChainActivity } from "@/components/home/on-chain-activity"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <LatestPapers />
      <HowItWorks />
      <TechStack />
      <OnChainActivity />
      <Footer />
    </>
  )
}
