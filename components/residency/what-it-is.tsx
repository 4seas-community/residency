"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

interface WhatItIsProps {
  programType?: 'crypto' | 'art'
}

const content = {
  crypto: {
    description1: "A residency for crypto builders, researchers, educators, founders, designers, and creators exploring how crypto moves from infrastructure into everyday life.",
    description2: "4Seas is a living space, coworking hub, and community experiment in Chiang Mai, rooted in Ethereum, Zuzalu, and localism. Come build with us.",
    highlight: "Not a job. Not an accelerator. A residency for shared living and building."
  },
  art: {
    description1: "A residency dedicated to technology art, crypto art, and new media art. This residency is not only concerned with technology as a tool, but with how technology transforms perception, artistic production, identity, social connection, and cultural imagination.",
    description2: "Artificial intelligence, blockchain, smart contracts, encrypted identity, on-chain communities, interactive media, generative systems, networked spaces, and decentralized collaboration are redefining how art is created, circulated, collected, and experienced. Through this residency, we hope to bring these ongoing transformations beyond abstract concepts, online platforms, and digital discussions, into physical space, everyday life, and public exchange.",
    highlight: "Art is not an isolated individual production, and technology is not merely a tool or topic. Both become ways of reconnecting with place, community, embodied experience, and public life."
  }
}

export function WhatItIs({ programType = 'crypto' }: WhatItIsProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const c = content[programType]

  return (
    <section ref={ref} className="py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-sans font-semibold text-foreground mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            What It Is
          </motion.h2>
          
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <motion.p 
              className="text-pretty"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {c.description1}
            </motion.p>
            
            <motion.p 
              className="text-pretty"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {c.description2}
            </motion.p>
            
            <motion.div 
              className="pt-4 border-t border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-foreground font-medium text-pretty">
                {c.highlight}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
