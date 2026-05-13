"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { withBasePath } from "@/lib/paths"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Top logo */}
      <motion.div 
        className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <a href="https://www.4seas.xyz/" target="_blank" rel="noopener noreferrer">
          <img 
            src={withBasePath("/images/4seas-logo.png")}
            alt="4Seas" 
            className="h-10 md:h-12 w-auto"
          />
        </a>
      </motion.div>

      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img 
            src={withBasePath("/images/hero-bg.png")}
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main title */}
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="text-balance">4Seas Crypto Residency Program</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p 
          className="text-xl md:text-2xl text-muted-foreground font-light mb-8 text-pretty"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Live with the community. Build in public, build in person.
        </motion.p>

        {/* Intro text */}
        <motion.p 
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          What if crypto was not only discussed online, at conferences, or inside group chats, 
          but lived, tested, and practiced in a real community?
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
            className="text-lg px-8 py-6 h-auto rounded-full group hover:scale-105 transition-transform"
            asChild
          >
            <a href={withBasePath("/apply")} className="flex items-center">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </motion.div>


      </div>
    </section>
  )
}
