"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { withBasePath } from "@/lib/paths"

export type ProgramType = 'crypto' | 'art'

interface ApplicationFormProps {
  programType: ProgramType
  programTitle: string
  programColor: string
}

interface FormData {
  name: string
  email: string
  telegram_or_whatsapp: string
  nationality: string
  about_you: string
  proposed_contribution: string
  social_link: string
  linkedin: string
  github: string
  content_studio: string
  preferred_start_date: string
}

const initialFormData: FormData = {
  name: '',
  email: '',
  telegram_or_whatsapp: '',
  nationality: '',
  about_you: '',
  proposed_contribution: '',
  social_link: '',
  linkedin: '',
  github: '',
  content_studio: '',
  preferred_start_date: ''
}

// Generate available start dates: 1st and 15th of each month from June 15, 2025 to August 15, 2025
const generateStartDates = () => {
  const dates: { value: string; label: string }[] = []
  const startDates = [
    { year: 2025, month: 5, day: 15 }, // June 15
    { year: 2025, month: 6, day: 1 },  // July 1
    { year: 2025, month: 6, day: 15 }, // July 15
    { year: 2025, month: 7, day: 1 },  // August 1
    { year: 2025, month: 7, day: 15 }, // August 15
  ]
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  startDates.forEach(({ year, month, day }) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const label = `${monthNames[month]} ${day}, ${year}`
    dates.push({ value: dateStr, label })
  })
  
  return dates
}

const startDateOptions = generateStartDates()

export default function ApplicationForm({ programType, programTitle, programColor }: ApplicationFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Count words in text
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const wordCount = countWords(formData.about_you)
  const isOverLimit = wordCount > 300

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.telegram_or_whatsapp.trim()) {
      setError('Please provide WhatsApp or Telegram contact')
      return false
    }
    if (!formData.nationality.trim()) {
      setError('Please enter your country')
      return false
    }
    if (!formData.about_you.trim()) {
      setError('Please tell us about yourself')
      return false
    }
    if (countWords(formData.about_you) > 300) {
      setError('Please keep your response under 300 words')
      return false
    }
    if (!formData.proposed_contribution.trim()) {
      setError('Please tell us what you plan to contribute')
      return false
    }
    if (!formData.social_link.trim()) {
      setError('Please provide at least one social link')
      return false
    }
    if (!formData.preferred_start_date) {
      setError('Please select a start date')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(withBasePath('/api/applications'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_type: programType,
          full_name: formData.name,
          email: formData.email,
          telegram: formData.telegram_or_whatsapp || null,
          country: formData.nationality || null,
          bio: formData.about_you || null,
          social_links: formData.social_link || null,
          linkedin_link: formData.linkedin || null,
          github_link: formData.github || null,
          preferred_start_date: formData.preferred_start_date,
          preferred_duration: '1 month',
          needs_support: formData.content_studio || null,
          status: 'new',
          about_and_contribution: formData.about_you,
          proposed_contribution: formData.proposed_contribution,
        }),
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(result?.error || 'Failed to submit')
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Application Submitted!</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Thank you for applying to {programTitle}. We will review your application and notify you of the result within one week via the contact information you provided.
        </p>
        
        <div className="bg-muted/50 rounded-lg p-6 max-w-md mx-auto mb-8">
          <p className="text-sm text-foreground font-medium mb-4">Join our community while you wait:</p>
          <div className="flex flex-col gap-3 justify-center">
            <a 
              href="https://x.com/4seasDeSoc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow on X
            </a>
            <a 
              href="https://t.me/NomadsBase" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b5] transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Join Telegram Group
            </a>
            <a 
              href="https://chat.whatsapp.com/BeHrYvwwepbIN9m1L859I9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Join WhatsApp Group
            </a>
          </div>
        </div>

        <Button onClick={() => router.push(`/${programType}`)}>
          Back to {programTitle}
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      {programType === 'longevity' && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4"><h2 className="text-base font-semibold">Process &amp; Duration</h2></div>
          <div className="space-y-6 p-6">
            <div><h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Application Process</h3><div className="grid gap-3 sm:grid-cols-3">{[
              ['1', 'Apply', 'Tell us about yourself and what you hope to explore.'],
              ['2', 'Review', 'Our team reviews applications on a rolling basis.'],
              ['3', 'Confirm', 'Selected residents coordinate dates and practical details.'],
            ].map(([step, title, description]) => <div key={step} className="rounded-lg bg-muted/50 p-4"><span className="text-xs font-semibold text-emerald-600">STEP {step}</span><p className="mt-1 font-medium">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p></div>)}</div></div>
            <div><h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Residency Duration</h3><p className="text-sm leading-relaxed text-muted-foreground">Residencies generally run for two weeks to one month. Longer stays can be discussed based on the project and community contribution.</p></div>
          </div>
        </div>
      )}
      {/* Personal Information Section */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">PERSONAL INFORMATION</h2>
        
        <div className="space-y-2">
          <Label>Name <span className="text-red-500">*</span></Label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label>Email <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label>WhatsApp or Telegram <span className="text-red-500">*</span></Label>
          <Input
            value={formData.telegram_or_whatsapp}
            onChange={(e) => handleInputChange('telegram_or_whatsapp', e.target.value)}
            placeholder="@username or +1234567890"
          />
        </div>
      </div>

      {/* Visit Details Section */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">VISIT DETAILS</h2>
        
        <div className="space-y-2">
          <Label>Preferred Start Date <span className="text-red-500">*</span></Label>
          <select
            value={formData.preferred_start_date}
            onChange={(e) => handleInputChange('preferred_start_date', e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
          >
            <option value="">Select a start date</option>
            {startDateOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Country <span className="text-red-500">*</span></Label>
          <Input
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            placeholder="Your country"
          />
        </div>
      </div>

      {/* About You Section */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">ABOUT YOU</h2>
        
        <div className="space-y-2">
          <Label>Tell us about yourself <span className="text-red-500">*</span></Label>
          <p className="text-sm text-muted-foreground">
            Tell us a bit about yourself and why you&apos;re interested in the program. What are you currently exploring, building, researching, or thinking about? And during your stay, how do you imagine contributing to the community — through conversations, public sessions, creative work, research, or other forms of exchange?
          </p>
          <p className="text-sm text-muted-foreground">
            We value curiosity, openness, and a willingness to participate in community life.
          </p>
          <p className="text-sm text-muted-foreground italic">
            (Please keep your response under 300 words.)
          </p>
          <Textarea
            value={formData.about_you}
            onChange={(e) => handleInputChange('about_you', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={6}
            className={isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          <p className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
            {wordCount}/300 words {isOverLimit && '- Please reduce your response'}
          </p>
        </div>

        <div className="space-y-2">
          <Label>What do you plan to contribute? <span className="text-red-500">*</span></Label>
          <p className="text-sm text-muted-foreground">
            Tell us how you imagine contributing to the community during your stay. If you don&apos;t have anything specific in mind yet, please describe the part you think you could contribute.
          </p>
          <Textarea
            value={formData.proposed_contribution}
            onChange={(e) => handleInputChange('proposed_contribution', e.target.value)}
            placeholder="Share your planned contribution, or the part you think you could contribute..."
            rows={5}
          />
        </div>
      </div>

      {/* Social Links Section */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">SOCIAL LINKS</h2>
        
        <div className="space-y-2">
          <Label>
            {programType === 'art' ? 'Portfolio or Personal Website' : programType === 'longevity' ? 'Your Website, Research, Social Media or Publications' : 'Your Social Media, Personal Website or Publications'} <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            At least provide one link, so that we can know a bit more from you.
          </p>
          <Input
            value={formData.social_link}
            onChange={(e) => handleInputChange('social_link', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label>LinkedIn</Label>
          <Input
            value={formData.linkedin}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="space-y-2">
          <Label>{programType === 'art' ? 'Social Media' : programType === 'longevity' ? 'Additional Information' : 'GitHub'}</Label>
          {programType === 'longevity' && <p className="text-sm text-muted-foreground">Optional additional link or brief note that helps us understand your work.</p>}
          <Input
            value={formData.github}
            onChange={(e) => handleInputChange('github', e.target.value)}
            placeholder={programType === 'art' ? 'Instagram, X, Behance, etc.' : programType === 'longevity' ? 'Additional link or brief note...' : 'https://github.com/...'}
          />
        </div>
      </div>

      {/* Content Studio Section */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">CONTENT STUDIO</h2>
        
        <div className="space-y-2">
          <Label>Do you have any plans to use the Content Studio during your residency?</Label>
          <p className="text-sm text-muted-foreground">
            We have a fully equipped content studio available for residents. Let us know if you have any content creation plans (podcasts, videos, interviews, etc.)
          </p>
          <Textarea
            value={formData.content_studio}
            onChange={(e) => handleInputChange('content_studio', e.target.value)}
            placeholder="Your content creation plans (optional)"
            rows={3}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white"
          style={{ backgroundColor: programColor }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </div>
    </form>
  )
}
