"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

interface QuestionsWeExploreProps {
  programType?: 'crypto' | 'art' | 'longevity'
}

const questions = {
  crypto: [
    "How can crypto move from infrastructure into everyday life?",
    "What does it mean to build in public and in person?",
    "How can decentralized technologies serve local communities?",
    "What new forms of coordination become possible with crypto?",
    "How can we experiment with public goods in real communities?"
  ],
  art: [
    "How are images being reproduced and transformed in the age of AI and algorithms?",
    "How does cryptography reshape trust, identity, ownership, and authorship?",
    "Can smart contracts, blockchains, and decentralized networks become artistic media?",
    "How can privacy, anonymity, verification, consensus, and protocol be translated into artistic language?",
    "How can new media art respond to real communities beyond screens and platforms?",
    "How can technology-based art generate new public conversations within a local context?"
  ],
  longevity: [
    "How can we extend healthspan?",
    "How can we better understand ourselves through practice and data?",
    "How can we build mechanisms within a community that support long-term healthy behaviors?",
    "How can we build better longevity communities?"
  ]
}

export function QuestionsWeExplore({ programType = 'crypto' }: QuestionsWeExploreProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const items = questions[programType]

  return (
    <section ref={ref} className="py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-sans font-semibold text-foreground mb-6">
            Questions We Explore
          </h2>
          
          <div className="space-y-1">
            {items.map((question, index) => (
              <motion.div
                key={index}
                className="relative py-3 px-4 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ x: 8 }}
              >
                <p className="relative text-base leading-relaxed text-pretty text-muted-foreground">
                  {question}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
