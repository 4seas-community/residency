"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/shared/header"

interface HeroProps {
  programType?: 'crypto' | 'art'
  title?: string
  tagline?: string
  description?: string
  applyLink?: string
  accentColor?: string
}

export function Hero({ 
  programType = 'crypto',
  title = "4Seas Crypto Residency Program",
  tagline = "Live with the community. Build in public, build in person.",
  description = "What if crypto was not only discussed online, at conferences, or inside group chats, but lived, tested, and practiced in a real community?",
  applyLink = "/residency/crypto/apply",
  accentColor = "#0A6B5A"
}: HeroProps) {
  return (
    <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <Header />
      </div>

      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img 
            src={programType === 'art' ? '/images/art.png' : '/images/crypto.png'} 
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-12 md:py-20">
        {/* Main title */}
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-sans font-semibold tracking-tight text-foreground mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="text-balance">{title}</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p 
          className="text-xl md:text-2xl text-muted-foreground font-light mb-8 text-pretty"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {tagline}
        </motion.p>

        {/* Intro text */}
        <motion.p 
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {description}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="text-lg px-8 py-3 h-auto rounded-full group hover:scale-105 transition-transform text-white"
            style={{ backgroundColor: accentColor }}
            asChild
          >
            <Link href={applyLink} className="flex items-center">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
