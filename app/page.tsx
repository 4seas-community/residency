"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight, Home, Users, Lightbulb, Mic, Globe, BookOpen, Calendar, CheckCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVisiblePrograms } from "@/lib/programs"
import { Footer } from "@/components/shared/footer"
import { Header } from "@/components/shared/header"
import { withBasePath } from "@/lib/paths"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

// Program-specific theme colors - using teal green palette from 4seas.xyz
const programThemes = {
  crypto: {
    accent: "from-primary/20 to-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    bg: "bg-primary/5",
    button: "bg-primary hover:bg-primary/90"
  },
  art: {
    accent: "from-rose-500/20 to-pink-500/20",
    border: "border-rose-200",
    text: "text-rose-700",
    bg: "bg-rose-50",
    button: "bg-rose-600 hover:bg-rose-700"
  },
  longevity: {
    accent: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-200",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    button: "bg-emerald-600 hover:bg-emerald-700"
  }
}

function ProgramCard({ program, index }: { program: ReturnType<typeof getVisiblePrograms>[0]; index: number }) {
  const theme = programThemes[program.id as keyof typeof programThemes] || programThemes.crypto
  
  const themes = {
    crypto: ["Ethereum", "Zuzalu", "Public goods", "Privacy", "Local-first", "AI x Crypto"],
    art: ["Community art", "Moving image", "Writing", "Art x Tech", "On-chain art", "Social practice"],
    longevity: ["Biohacking", "Longevity", "Health-tech", "Wellness", "Research"]
  }

  const descriptions = {
    crypto: "For crypto builders, researchers, and creators exploring how Ethereum and onchain communities connect with real-life community building.",
    art: "For artists, filmmakers, designers, curators and art practitioners who want to create, produce, and experiment inside a living community.",
    longevity: "For scientists, biohackers, and longevity enthusiasts exploring life extension research in a health-optimized environment."
  }

  const backgroundImages = {
    crypto: "/images/crypto.png",
    art: "/images/art.png",
    longevity: "/images/longevity.png"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className={`group relative bg-card border ${theme.border} rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300`}
    >
      {/* Program Visual with Background Image */}
      <div className="relative h-36 md:h-48 overflow-hidden">
        <img 
          src={withBasePath(backgroundImages[program.id as keyof typeof backgroundImages] || backgroundImages.crypto)}
          alt=""
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className={`absolute top-3 left-3 md:top-4 md:left-4 ${theme.bg} ${theme.text} px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm`}>
          {program.cohortStartDate === 'Coming Soon' ? 'Coming Soon' : 'Now Open'}
        </div>
      </div>
      
      <div className="p-4 md:p-8">
        <h3 className="text-lg md:text-2xl font-sans font-semibold text-foreground mb-2 md:mb-3">{program.name}</h3>
        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
          {descriptions[program.id as keyof typeof descriptions] || program.description}
        </p>

        {/* Themes */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-8">
          {(themes[program.id as keyof typeof themes] || program.features.slice(0, 6)).map((theme, i) => (
            <span 
              key={i} 
              className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-medium bg-muted text-muted-foreground rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Link href={`/${program.id}`} className="flex-1">
            <Button variant="outline" className="w-full group/btn">
              Explore {program.shortName}
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const programs = getVisiblePrograms()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden min-h-[50vh] md:min-h-[60vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={withBasePath("/images/hero-bg.png")}
            alt="" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div {...fadeIn}>
            <p className="text-xs md:text-sm uppercase tracking-widest text-muted-foreground mb-3 md:mb-4">
              Chiang Mai, Thailand
            </p>
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-sans font-semibold text-foreground mb-4 md:mb-6 text-balance leading-tight">
              4Seas Residency Programs
            </h1>
            <p className="text-base md:text-xl text-muted-foreground mb-3 md:mb-4 font-light">
              Live with the community. Build in public, build in person.
            </p>
            <p className="text-sm md:text-lg text-muted-foreground/80 max-w-3xl mx-auto mb-6 md:mb-10 leading-relaxed">
              4Seas Residency is a community-based residency program in Chiang Mai for builders, artists, researchers, founders, creators, and long-term thinkers who want to live, work, create, and contribute inside a real community.
            </p>
            
            <div className="flex justify-center">
              <Link href="#programs">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground gap-2"
                >
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shared Experience Section */}
      <section className="py-10 md:py-12 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-semibold text-foreground mb-3 md:mb-4">
              A Residency Inside a Living Community
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              All 4Seas Residency programs are built around shared living, coworking, community contribution, and real-world experimentation. Residents may come from different disciplines, but all tracks share the same foundation.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[
              { icon: Home, title: "Co-living", desc: "Live with the community in Chiang Mai" },
              { icon: Users, title: "Coworking", desc: "Access to shared workspace and studios" },
              { icon: Lightbulb, title: "Events", desc: "Workshop and discussion spaces" },
              { icon: Globe, title: "Network", desc: "Local and global community connections" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-4 md:p-6 text-center"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-foreground mb-1 md:mb-2">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Residency Tracks */}
      <section id="programs" className="py-10 md:py-12 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-semibold text-foreground mb-3 md:mb-4">
              Residency Tracks
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Each residency track has its own focus, but all share the same spirit: live with the community, contribute in public, and explore what can be built together in Chiang Mai.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {programs.filter(p => p.isActive).map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* What 4Seas Offers */}
      <section className="py-10 md:py-12 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-semibold text-foreground mb-3 md:mb-4">
              What 4Seas Offers
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Resources and support that may be available during your residency
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            {[
              { icon: Home, text: "A place to live in Chiang Mai" },
              { icon: Users, text: "Access to coworking and shared community spaces" },
              { icon: Calendar, text: "Event, workshop, screening, and discussion spaces" },
              { icon: Mic, text: "Content Studio access for podcast, video, and documentation" },
              { icon: Globe, text: "Cross-disciplinary community of builders, artists, and organizers" },
              { icon: BookOpen, text: "Local context and community connections" },
              { icon: Lightbulb, text: "Opportunities to host, share, test, and document work" },
              { icon: CheckCircle, text: "Possible small grants depending on program fit" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-card border border-border rounded-lg"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <p className="text-sm md:text-base text-foreground pt-1 md:pt-2">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-xs md:text-sm text-muted-foreground text-center mt-6 md:mt-8 italic">
            Availability may vary depending on selection and arrangement.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 md:py-12">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-semibold text-foreground mb-3 md:mb-4">
              How It Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {[
              { step: "01", title: "Choose a Track", desc: "Select the residency that fits your work" },
              { step: "02", title: "Read Details", desc: "Review program specifics and requirements" },
              { step: "03", title: "Apply", desc: "Submit your application online" },
              { step: "04", title: "Review", desc: "Our team reviews your application" },
              { step: "05", title: "Confirm", desc: "Finalize dates and arrangements" },
              { step: "06", title: "Co-live", desc: "Arrive in Chiang Mai and begin" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-xs md:text-sm">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-[10px] md:text-sm">{item.title}</h3>
                <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Welcome */}
      <section className="py-10 md:py-12 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-12"
          >
            <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-semibold text-foreground mb-3 md:mb-4">
              Who We Welcome
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              4Seas Residency is for people who want to contribute to a living community, not just stay in a place. We welcome those who are curious about how ideas become real through shared life, public programs, and local context.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {[
              "Builders", "Artists", "Researchers", "Founders", "Writers", 
              "Filmmakers", "Designers", "Educators", "Cultural Workers", 
              "Community Organizers", "Long-term Thinkers"
            ].map((role, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-card border border-border rounded-full text-foreground text-xs md:text-sm font-medium"
              >
                {role}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Explore More */}
      <section className="py-10 md:py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="text-xl md:text-3xl lg:text-4xl font-sans font-semibold text-foreground mb-6 md:mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Explore More
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* 4Seas Card */}
            <motion.div
              className="bg-card rounded-2xl p-4 md:p-8 border border-border hover:shadow-lg transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <h3 className="text-lg md:text-2xl font-semibold text-foreground mb-2 md:mb-4">4Seas</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed flex-1">
                A cultural hub in Chiang Mai, rooted in Ethereum and part of the Zuzalu Movement. We are actively building the future of community, work, and coordination, leveraging decentralized technologies to do so — where these pioneering concepts seamlessly transition into a lived, daily reality.
              </p>
              <a 
                href="https://www.4seas.xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3 py-2 md:px-4 md:py-2 bg-muted rounded-lg text-foreground text-xs md:text-sm hover:bg-muted/80 transition-colors"
              >
                Visit 4Seas Website
                <ArrowUpRight className="w-3 h-3 ml-2" />
              </a>
            </motion.div>

            {/* ETHChiangmai Card */}
            <motion.div
              className="bg-card rounded-2xl p-4 md:p-8 border border-border hover:shadow-lg transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg md:text-2xl font-semibold text-foreground mb-2 md:mb-4">About ETHChiangmai</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed flex-1">
                ETHChiangmai is a local Ethereum and Web3 community season in Chiang Mai. This year: 11/11/2026 - 1/5/2027. Unconferences, hackathons, summits, coliving, and real-life gatherings.
              </p>
              <a 
                href="https://www.ethchiangmai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3 py-2 md:px-4 md:py-2 bg-muted rounded-lg text-foreground text-xs md:text-sm hover:bg-muted/80 transition-colors"
              >
                Visit ETHChiangmai
                <ArrowUpRight className="w-3 h-3 ml-2" />
              </a>
            </motion.div>

            {/* Join the Community Card */}
            <motion.div
              className="bg-card rounded-2xl p-4 md:p-8 border border-border hover:shadow-lg transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg md:text-2xl font-semibold text-foreground mb-2 md:mb-4">Join the Community</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed flex-1">
                Connect with us and stay updated on residency opportunities, events, and community activities.
              </p>
              <div className="space-y-2 mt-auto">
                <a 
                  href="https://t.me/NomadsBase" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 md:px-4 md:py-2 bg-muted rounded-lg text-foreground text-xs md:text-sm hover:bg-muted/80 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3" />
                    Join 4Seas Telegram
                  </span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a 
                  href="https://x.com/4seasDeSoc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 md:px-4 md:py-2 bg-muted rounded-lg text-foreground text-xs md:text-sm hover:bg-muted/80 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3" />
                    Follow 4Seas on X
                  </span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
