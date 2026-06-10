import { Hero } from "@/components/residency/hero"
import { WhatItIs } from "@/components/residency/what-it-is"
import { ResidencyCycle } from "@/components/residency/residency-cycle"
import { WhatResidentsBring } from "@/components/residency/what-residents-bring"
import { ThemesWeCare } from "@/components/residency/themes-we-care"
import { QuestionsWeExplore } from "@/components/residency/questions-we-explore"
import { Footer } from "@/components/residency/footer"

export default function ArtResidencyPage() {
  return (
    <main className="min-h-screen">
      <Hero 
        programType="art"
        title="4Seas Art Residency Program"
        tagline="Where technology art meets community and place."
        description="We invite artists, curators, researchers, designers, developers, filmmakers, and interdisciplinary practitioners to explore new relationships between technology, images, protocols, and public life."
        applyLink="/art/apply"
        accentColor="#e11d48"
      />
      <WhatItIs programType="art" />
      <ResidencyCycle programType="art" />
      <ThemesWeCare programType="art" />
      <QuestionsWeExplore programType="art" />
      <WhatResidentsBring programType="art" />
      <Footer />
    </main>
  )
}
