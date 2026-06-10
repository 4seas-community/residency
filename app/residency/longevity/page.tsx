"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/shared/header"

export default function LongevityResidencyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/images/longevity.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
      </div>

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Coming Soon Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <span className="text-8xl">🧬</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-semibold text-foreground mb-6">
            <span className="text-balance">4Seas Longevity Residency</span>
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-2xl md:text-3xl text-emerald-600 font-medium mb-4">
              Coming Soon
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 text-pretty">
              A research-focused residency for scientists, biohackers, and longevity enthusiasts exploring cutting-edge life extension research.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
