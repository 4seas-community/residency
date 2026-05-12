"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export function WhatItIs() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-semibold text-foreground mb-8"
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
              A residency for crypto builders, researchers, educators, founders, designers, and creators exploring how crypto moves from infrastructure into everyday life.
            </motion.p>
            
            <motion.p 
              className="text-pretty"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              4Seas is a living space, coworking hub, and community experiment in Chiang Mai, rooted in Ethereum, Zuzalu, and localism. Come build with us.
            </motion.p>
            
            <motion.div 
              className="pt-4 border-t border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-foreground font-medium text-pretty">
                Not a job. Not an accelerator. A residency for shared living and building.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
