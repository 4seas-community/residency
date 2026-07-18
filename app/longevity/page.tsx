import { Hero } from "@/components/residency/hero"
import { WhatItIs } from "@/components/residency/what-it-is"
import { ResidencyCycle } from "@/components/residency/residency-cycle"
import { WhatResidentsBring } from "@/components/residency/what-residents-bring"
import { ThemesWeCare } from "@/components/residency/themes-we-care"
import { QuestionsWeExplore } from "@/components/residency/questions-we-explore"
import { Footer } from "@/components/residency/footer"

export default function LongevityResidencyPage() {
  return (
    <main className="min-h-screen">
      <Hero
        programType="longevity"
        title="4Seas Longevity Residency"
        tagline="Live with more meaning. Build a healthier future together."
        description="A co-creation opportunity for professionals, artists, entrepreneurs, and health enthusiasts to live together, practice together, and explore new possibilities for future healthy lifestyles in Chiang Mai."
        applyLink="/longevity/apply"
        accentColor="#10b981"
      />
      <WhatItIs programType="longevity" />
      <ResidencyCycle programType="longevity" />
      <ThemesWeCare programType="longevity" />
      <QuestionsWeExplore programType="longevity" />
      <WhatResidentsBring programType="longevity" />
      <Footer />
    </main>
  )
}
