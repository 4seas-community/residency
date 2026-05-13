"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Send, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { withBasePath } from "@/lib/paths"
import Link from "next/link"

const preferredDates = [
  "May 15, 2026",
  "June 1, 2026",
  "June 15, 2026",
  "July 1, 2026",
  "July 15, 2026",
  "August 1, 2026",
  "August 15, 2026",
]

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export default function ApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [wordCount, setWordCount] = useState(0)
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactInfo: "",
    preferredStartDate: "",
    aboutAndContribution: "",
    socialLinks: "",
    linkedinLink: "",
    githubLink: "",
    contentStudioPlans: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email"
    if (!formData.contactInfo.trim()) newErrors.contactInfo = "WhatsApp or Telegram is required"
    if (!formData.preferredStartDate) newErrors.preferredStartDate = "Please select a preferred start date"
    if (!formData.aboutAndContribution.trim()) newErrors.aboutAndContribution = "This field is required"
    else if (wordCount > 300) newErrors.aboutAndContribution = "Please keep your response under 300 words"
    if (!formData.socialLinks.trim()) newErrors.socialLinks = "Please provide at least one link"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setErrorMessage("")
    
    try {
      const response = await fetch(withBasePath("/api/applications"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          contactInfo: formData.contactInfo,
          preferredStartDate: formData.preferredStartDate,
          aboutAndContribution: formData.aboutAndContribution,
          socialLinks: formData.socialLinks,
          linkedinLink: formData.linkedinLink,
          githubLink: formData.githubLink,
          contentStudioPlans: formData.contentStudioPlans,
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(result?.error || "Unable to submit application")
      }
      
      setSubmitStatus("success")
    } catch (error: unknown) {
      console.error("[v0] Submission error:", error)
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSubmitStatus("error")
      setErrorMessage(`Failed to submit application: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAboutChange = (value: string) => {
    setFormData({ ...formData, aboutAndContribution: value })
    setWordCount(countWords(value))
  }

  if (submitStatus === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div 
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Application Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for applying to the 4Seas Crypto Residency Program. We will review your application and get back to you soon.
          </p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <a 
              href="https://v0-4seas-crypto-residency.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Program Information
            </a>
          </div>
          <img src={withBasePath("/images/4seas-logo.png")} alt="4Seas" className="h-8 w-auto" />
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
            Apply for Residency
          </h1>
          <p className="text-muted-foreground mb-8">
            Fields marked with <span className="text-destructive">*</span> are required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <section className="space-y-6">
              <h2 className="text-sm font-medium text-primary uppercase tracking-wider border-b border-primary/30 pb-2">
                Personal Information
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your full name"
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactInfo">
                    WhatsApp or Telegram <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactInfo"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder="@username or phone number"
                    className={errors.contactInfo ? "border-destructive" : ""}
                  />
                  {errors.contactInfo && <p className="text-sm text-destructive">{errors.contactInfo}</p>}
                </div>
              </div>
            </section>

            {/* Visit Details */}
            <section className="space-y-6">
              <h2 className="text-sm font-medium text-primary uppercase tracking-wider border-b border-primary/30 pb-2">
                Visit Details
              </h2>
              
              <div className="space-y-2">
                <Label htmlFor="preferredStartDate">
                  Preferred Start Date <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.preferredStartDate}
                  onValueChange={(value) => setFormData({ ...formData, preferredStartDate: value })}
                >
                  <SelectTrigger className={errors.preferredStartDate ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a start date" />
                  </SelectTrigger>
                  <SelectContent>
                    {preferredDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.preferredStartDate && <p className="text-sm text-destructive">{errors.preferredStartDate}</p>}
              </div>
            </section>

            {/* About You */}
            <section className="space-y-6">
              <h2 className="text-sm font-medium text-primary uppercase tracking-wider border-b border-primary/30 pb-2">
                About You
              </h2>
              
              <div className="space-y-2">
                <Label htmlFor="aboutAndContribution">
                  Tell us about yourself <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Tell us a bit about yourself and why you&apos;re interested in the program. What are you currently exploring, building, researching, or thinking about? And during your stay, how do you imagine contributing to the community — through conversations, public sessions, creative work, research, or other forms of exchange?
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  We value curiosity, openness, and a willingness to participate in community life.
                </p>
                <p className="text-sm text-muted-foreground mb-3 font-medium">
                  (Please keep your response under 300 words.)
                </p>
                <Textarea
                  id="aboutAndContribution"
                  value={formData.aboutAndContribution}
                  onChange={(e) => handleAboutChange(e.target.value)}
                  placeholder="Share your background, interests, and how you'd like to contribute..."
                  rows={8}
                  className={errors.aboutAndContribution ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {errors.aboutAndContribution && <p className="text-sm text-destructive">{errors.aboutAndContribution}</p>}
                  <p className={`text-sm ml-auto ${wordCount > 300 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {wordCount}/300 words
                  </p>
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="space-y-6">
              <h2 className="text-sm font-medium text-primary uppercase tracking-wider border-b border-primary/30 pb-2">
                Social Links
              </h2>
              
              <div className="space-y-2">
                <Label htmlFor="socialLinks" className="text-base font-medium">
                  Your Social Media, Personal Website or Publications <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  At least provide one link, so that we can know a bit more from you.
                </p>
                <Input
                  id="socialLinks"
                  value={formData.socialLinks}
                  onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                  placeholder="Twitter/X, Instagram, personal website, or publication links"
                  className={errors.socialLinks ? "border-destructive" : ""}
                />
                {errors.socialLinks && <p className="text-sm text-destructive">{errors.socialLinks}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="linkedinLink">
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedinLink"
                    value={formData.linkedinLink}
                    onChange={(e) => setFormData({ ...formData, linkedinLink: e.target.value })}
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubLink">
                    GitHub
                  </Label>
                  <Input
                    id="githubLink"
                    value={formData.githubLink}
                    onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                    placeholder="github.com/yourusername"
                  />
                </div>
              </div>
            </section>

            {/* Content Studio */}
            <section className="space-y-6">
              <h2 className="text-sm font-medium text-primary uppercase tracking-wider border-b border-primary/30 pb-2">
                Content Studio
              </h2>
              
              <div className="space-y-2">
                <Label htmlFor="contentStudioPlans">
                  Do you have any plans to use the Content Studio during your residency?
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  We have a fully equipped content studio available for residents. Let us know if you have any content creation plans (podcasts, videos, interviews, etc.)
                </p>
                <Textarea
                  id="contentStudioPlans"
                  value={formData.contentStudioPlans}
                  onChange={(e) => setFormData({ ...formData, contentStudioPlans: e.target.value })}
                  placeholder="Describe any content you'd like to create..."
                  rows={3}
                />
              </div>
            </section>

            {/* Submit */}
            {submitStatus === "error" && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full md:w-auto px-8"
                disabled={isSubmitting || wordCount > 300}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Application
                    <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
