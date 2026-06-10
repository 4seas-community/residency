"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Home, 
  Laptop, 
  Calendar, 
  MapPin, 
  Video, 
  Coins
} from "lucide-react"

interface WhatWeOfferProps {
  programType?: 'crypto' | 'art'
}

const offerings = [
  { icon: Home, label: "Free 1-month accommodation" },
  { icon: Laptop, label: "Coworking access" },
  { icon: Calendar, label: "Event and workshop space" },
  { icon: MapPin, label: "Chiang Mai local networks" },
  { icon: Video, label: "Free use of the Content Studio" },
  { icon: Coins, label: "Possible small grants or bounties" },
]

export function WhatWeOffer({ programType = 'crypto' }: WhatWeOfferProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const accentColor = programType === 'art' ? '#e11d48' : undefined

  return (
    <section ref={ref} className="py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-sans font-semibold text-foreground mb-4">
            What 4Seas Offers
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Support and resources for your residency
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offerings.map((item, index) => (
              <motion.div
                key={item.label}
                className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border cursor-default"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.03,
                  y: -4,
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                  borderColor: accentColor || "var(--primary)",
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div 
                  className="p-2 rounded-lg shrink-0"
                  style={{ backgroundColor: accentColor ? `${accentColor}20` : 'var(--primary-10, rgba(13, 148, 136, 0.1))' }}
                  whileHover={{ rotate: 5 }}
                >
                  <item.icon className="w-5 h-5" style={{ color: accentColor || 'var(--primary)' }} />
                </motion.div>
                <p className="text-foreground text-sm font-medium leading-snug">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
          
          <motion.p 
            className="mt-8 text-sm text-muted-foreground italic"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            * Grants and bounties available for projects aligned with our current needs
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
