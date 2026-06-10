"use client"

import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Users, Clock, Sparkles, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProgram, type ProgramType } from "@/lib/programs"
import { Footer } from "@/components/shared/footer"
import { withBasePath } from "@/lib/paths"

export default function ProgramDetailPage() {
  const params = useParams()
  const programId = params.program as ProgramType
  const program = getProgram(programId)

  if (!program) {
    notFound()
  }

  const isComingSoon = !program.isActive

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <a href="https://www.4seas.xyz/" target="_blank" rel="noopener noreferrer">
            <img src={withBasePath("/images/4seas-logo.png")} alt="4Seas" className="h-8 w-auto" />
          </a>
          <div className="w-[72px]" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ background: `linear-gradient(135deg, ${program.color} 0%, transparent 50%)` }}
        />
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            {isComingSoon && (
              <span className="inline-block px-4 py-1 text-sm font-medium bg-muted text-muted-foreground rounded-full mb-4">
                Coming Soon - {program.cohortStartDate}
              </span>
            )}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{program.icon}</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {program.name}
              </h1>
            </div>
            <p className="text-2xl font-medium mb-4" style={{ color: program.color }}>
              {program.tagline}
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              {program.description}
            </p>
            
            {!isComingSoon && (
              <Link href={`/${program.id}/apply`}>
                <Button 
                  size="lg" 
                  className="gap-2"
                  style={{ backgroundColor: program.color }}
                >
                  Apply Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${program.color}20` }}>
                <MapPin className="w-5 h-5" style={{ color: program.color }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">Oceanfront, Asia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${program.color}20` }}>
                <Clock className="w-5 h-5" style={{ color: program.color }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">{program.duration.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${program.color}20` }}>
                <Users className="w-5 h-5" style={{ color: program.color }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cohort Size</p>
                <p className="font-medium text-foreground">8-12 residents</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${program.color}20` }}>
                <Calendar className="w-5 h-5" style={{ color: program.color }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Cohort</p>
                <p className="font-medium text-foreground">{program.cohortStartDate}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-foreground mb-12 text-center"
          >
            Program Highlights
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {program.highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-8"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${program.color}20` }}
                >
                  <Sparkles className="w-6 h-6" style={{ color: program.color }} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{highlight.title}</h3>
                <p className="text-muted-foreground">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">What&apos;s Included</h2>
              <div className="space-y-4">
                {program.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div 
                      className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: program.color }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Ideal For</h2>
              <div className="flex flex-wrap gap-3">
                {program.idealFor.map((item, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 rounded-full border text-sm font-medium"
                    style={{ borderColor: program.color, color: program.color }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-foreground mb-12 text-center"
          >
            Application Process
          </motion.h2>
          
          <div className="space-y-6">
            {[
              { step: 1, title: 'Submit Application', description: 'Fill out the application form with your background and goals' },
              { step: 2, title: 'Review', description: 'Our team reviews applications on a rolling basis' },
              { step: 3, title: 'Interview', description: 'Selected candidates are invited for a brief video call' },
              { step: 4, title: 'Decision', description: 'Receive your acceptance and prepare for the residency' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
                  style={{ backgroundColor: program.color }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {isComingSoon ? 'Coming Soon' : 'Ready to Apply?'}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {isComingSoon 
                ? `The ${program.name} will be available ${program.cohortStartDate}. Check back soon or explore our other programs.`
                : 'Join our community of innovators and take your work to the next level.'}
            </p>
            {isComingSoon ? (
              <Link href="/">
                <Button variant="outline" size="lg" className="gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Explore Other Programs
                </Button>
              </Link>
            ) : (
              <Link href={`/${program.id}/apply`}>
                <Button 
                  size="lg" 
                  className="gap-2"
                  style={{ backgroundColor: program.color }}
                >
                  Start Your Application
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
