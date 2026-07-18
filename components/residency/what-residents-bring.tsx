"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Heart, Cpu, Palette } from "lucide-react"

interface WhatResidentsBringProps {
  programType?: 'crypto' | 'art' | 'longevity'
}

const longevityGiveBack = [
  "An open-source tool to help residents monitor their health data",
  "An artistic work on the theme of longevity",
  "A replicable health program or course",
  "An in-depth article or research report documenting community life",
  "A workshop, sharing session, or co-creation experiment",
  "Anything else that brings long-term value to the community",
]

const longevityGroups = [
  {
    icon: Heart,
    title: "Health Enthusiasts",
    subtitle: "Fitness lovers, nutrition researchers, mindfulness practitioners, and advocates of healthy lifestyles.",
    description: "Use your daily practices to elevate the community's health atmosphere and become a living example.",
  },
  {
    icon: Cpu,
    title: "Technologists",
    subtitle: "Engineers, developers, data scientists, AI researchers, and biohackers.",
    description: "Build tools for the community, optimize health data, and develop longevity applications or infrastructure.",
  },
  {
    icon: Palette,
    title: "Artists",
    subtitle: "Visual artists, writers, musicians, and cross-media creators.",
    description: "Explore longevity through your lens and translate complex health concepts into accessible experiences.",
  },
]

const contributions = {
  crypto: [
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
  ],
  art: [
    "Moving-image Fragments",
    "Interactive Installation Demo",
    "Generative Art Program",
    "Web-based Work",
    "On-chain Prototype",
    "Sound Experiment",
    "AI-generated Image Series",
    "Spatial Installation Model",
    "Research Text",
    "Curatorial Proposal",
    "Workshop Outcome",
    "Community Experiment Documentation",
    "Reading Group",
    "Public Discussion",
    "Open Studio Presentation"
  ],
  longevity: [
    "Daily Practice Sharing", "Health Data Workshop", "Biohacking Experiment",
    "Community Health Protocol", "Nutrition Research", "Fitness Program",
    "Longevity Tech Tool", "AI Health Application", "Research Paper",
    "Health Article", "Community Experiment", "Podcast", "Reading Group", "Open Discussion"
  ]
}

export function WhatResidentsBring({ programType = 'crypto' }: WhatResidentsBringProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const items = contributions[programType]
  const accentColor = programType === 'art' ? '#e11d48' : programType === 'longevity' ? '#10b981' : undefined

  if (programType === 'longevity') {
    return (
      <section ref={ref} className="px-4 md:px-8">
        <div className="mx-auto max-w-4xl space-y-20 py-12">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
            <h2 className="mb-8 font-sans text-3xl font-semibold text-foreground md:text-4xl">Who We Are Looking For</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {longevityGroups.map((group, index) => (
                <motion.div key={group.title} className="rounded-xl border border-border bg-card p-6" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -4 }}>
                  <div className="mb-3 flex items-center gap-2">
                    <group.icon size={18} className="text-emerald-500" strokeWidth={1.5} />
                    <h3 className="text-lg font-semibold leading-tight text-foreground">{group.title}</h3>
                  </div>
                  <p className="mb-3 text-sm italic leading-relaxed text-muted-foreground">{group.subtitle}</p>
                  <p className="text-pretty text-base leading-relaxed text-foreground">{group.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.1 }}>
            <h2 className="mb-3 font-sans text-3xl font-semibold text-foreground md:text-4xl">What You Give in Return</h2>
            <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground">We provide free living, and in exchange you contribute your time and talent to produce something beneficial for the community. This could be:</p>
            <div className="grid gap-3 md:grid-cols-2">
              {longevityGiveBack.map((item, index) => (
                <motion.div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: 0.2 + index * 0.06 }} whileHover={{ y: -2 }}>
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" />
                  <p className="text-pretty text-base leading-relaxed text-foreground">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-sans font-semibold text-foreground mb-8">
            What Residents May Bring
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
            Residents may contribute in different ways:
          </p>
          
          <div className="flex flex-wrap gap-3 mb-10">
            {items.map((item, index) => (
              <motion.span
                key={item}
                className="px-4 py-2 bg-secondary rounded-full text-secondary-foreground text-sm cursor-default"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                whileHover={{ 
                  scale: 1.08, 
                  backgroundColor: accentColor || "var(--primary)",
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
