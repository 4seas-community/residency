"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowUpRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const cards = [
  {
    title: "4Seas",
    description: "A cultural hub in Chiang Mai, rooted in Ethereum and part of the Zuzalu Movement. We are actively building the future of community, work, and coordination, leveraging decentralized technologies to do so — where these pioneering concepts seamlessly transition into a lived, daily reality.",
    cta: "Visit 4Seas Website",
    link: "https://4seas.xyz"
  },
  {
    title: "About ETHChiangmai",
    description: "ETHChiangmai is a local Ethereum and Web3 community season in Chiang Mai. This year: 11/11/2026 - 1/5/2027. Unconferences, hackathons, summits, coliving, and real-life gatherings.",
    cta: "Visit ETHChiangmai",
    link: "https://www.ethchiangmai.com"
  },
  {
    title: "Join the Community",
    description: "Connect with us and stay updated on residency opportunities, events, and community activities.",
    socialLinks: [
      { label: "Join 4Seas Telegram", link: "https://t.me/NomadsBase" },
      { label: "Follow 4Seas on X", link: "https://x.com/4seasDeSoc" }
    ]
  }
]

export function ExploreMore() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 px-4 md:px-8 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-10 text-center">
            Explore More
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                className="bg-card rounded-2xl p-6 border border-border flex flex-col h-full"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
                  borderColor: "var(--primary)",
                  transition: { duration: 0.3 }
                }}
              >
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow text-pretty">
                  {card.description}
                </p>
                
                {card.socialLinks ? (
                  <div className="space-y-3">
                    {card.socialLinks.map((social) => (
                      <Button 
                        key={social.label}
                        variant="outline" 
                        className="w-full justify-between rounded-full"
                        asChild
                      >
                        <a href={social.link} target="_blank" rel="noopener noreferrer">
                          <span className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            {social.label}
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-between rounded-full"
                    asChild
                  >
                    <a href={card.link} target="_blank" rel="noopener noreferrer">
                      {card.cta}
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
