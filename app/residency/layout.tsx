import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "4Seas Residency Programs | Chiang Mai",
  description: "4Seas Residency is a community-based residency program in Chiang Mai for builders, artists, researchers, founders, creators, and long-term thinkers.",
  openGraph: {
    title: "4Seas Residency Programs | Chiang Mai",
    description: "4Seas Residency is a community-based residency program in Chiang Mai for builders, artists, researchers, founders, creators, and long-term thinkers.",
    type: "website",
  },
}

export default function ResidencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
