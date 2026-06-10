import { Hero } from "@/components/residency/hero"
import { WhatItIs } from "@/components/residency/what-it-is"
import { ResidencyCycle } from "@/components/residency/residency-cycle"
import { WhatResidentsBring } from "@/components/residency/what-residents-bring"
import { ThemesWeCare } from "@/components/residency/themes-we-care"
import { QuestionsWeExplore } from "@/components/residency/questions-we-explore"
import { Footer } from "@/components/residency/footer"

export default function CryptoResidencyPage() {
  return (
    <main className="min-h-screen">
      <Hero 
        programType="crypto"
        title="4Seas Crypto Residency Program"
        tagline="Where crypto meets community and place."
        description="We invite builders, researchers, educators, founders, designers, and creators to explore how Ethereum, public goods, open-source systems, and onchain communities connect with real-life community building."
        applyLink="/residency/crypto/apply"
        accentColor="#0A6B5A"
      />
      <WhatItIs programType="crypto" />
      <ResidencyCycle programType="crypto" />
      <ThemesWeCare programType="crypto" />
      <QuestionsWeExplore programType="crypto" />
      <WhatResidentsBring programType="crypto" />
      <Footer />
    </main>
  )
}
