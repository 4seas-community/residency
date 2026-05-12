import { Hero } from "@/components/residency/hero"
import { WhatItIs } from "@/components/residency/what-it-is"
import { ResidencyCycle } from "@/components/residency/residency-cycle"
import { WhatResidentsBring } from "@/components/residency/what-residents-bring"
import { ThemesWeCare } from "@/components/residency/themes-we-care"
import { WhatWeOffer } from "@/components/residency/what-we-offer"
import { ExploreMore } from "@/components/residency/explore-more"
import { Footer } from "@/components/residency/footer"

export default function ResidencyPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhatItIs />
      <ResidencyCycle />
      <WhatResidentsBring />
      <ThemesWeCare />
      <WhatWeOffer />
      <ExploreMore />
      <Footer />
    </main>
  )
}
