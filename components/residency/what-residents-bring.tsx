"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"


const contributions = [
  "Open source hardware",
  "Workshop",
  "Coding",
  "Reading Group",
  "Smart Contract",
  "Essay",
  "Software Tool",
  "Podcast",
  "Prototype Demo",
  "Article",
  "Course",
  "Video",
  "Local Research",
  "Community Experiment"
]

export function WhatResidentsBring() {
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
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8">
            What Residents May Bring
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
            Residents may contribute in different ways:
          </p>
          
          <div className="flex flex-wrap gap-3 mb-10">
            {contributions.map((item, index) => (
              <motion.span
                key={item}
                className="px-4 py-2 bg-secondary rounded-full text-secondary-foreground text-sm cursor-default"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                whileHover={{ 
                  scale: 1.08, 
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </motion.span>
            ))}
          </div>
          

        </motion.div>
      </div>
    </section>
  )
}
