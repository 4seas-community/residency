"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

interface ThemesWeCareProps {
  programType?: 'crypto' | 'art'
}

const themes = {
  crypto: [
    "Zuzalu",
    "Network states",
    "Ethereum",
    "Localism",
    "Crypto in real life",
    "Public goods",
    "Privacy",
    "Cypherpunk",
    "Crypto education",
    "Stablecoins and payments",
    "Onchain community infrastructure",
    "AI × Crypto",
    "Longevity × Crypto",
    "Local-first technology"
  ],
  art: [
    "Technology Art",
    "AI & Generative Art",
    "Interactive Installation",
    "Moving Image",
    "Sound Art",
    "New Media Art",
    "Community Art",
    "Public Art",
    "Social Practice",
    "Visual Storytelling",
    "Art × Tech"
  ]
}

export function ThemesWeCare({ programType = 'crypto' }: ThemesWeCareProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const items = themes[programType]
  const accentColor = programType === 'art' ? '#e11d48' : undefined

  return (
    <section ref={ref} className="py-12 px-4 md:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-sans font-semibold text-foreground mb-8">
            Themes We Care About
          </h2>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {items.map((theme, index) => (
              <motion.span
                key={theme}
                className="px-5 py-2.5 bg-card border border-border rounded-full text-foreground text-sm font-medium cursor-default"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: accentColor || "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderColor: accentColor || "var(--primary)",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {theme}
              </motion.span>
            ))}
          </div>
          
          <motion.p 
            className="text-lg text-muted-foreground italic"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            These are not fixed categories. They are invitations.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
