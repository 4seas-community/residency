"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { withBasePath } from "@/lib/paths"
import {
  APPLICATION_RESPONSE_CHARACTER_LIMIT,
  getRemainingCharacters,
  isResponseOverCharacterLimit,
} from "@/lib/application-limits"

export type ProgramType = 'crypto' | 'art' | 'longevity'

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
  contribution_plan: string
  contribution_past: string
  contribution_commitment: string
  social_link: string
  linkedin: string
  github: string
  content_studio: string
  preferred_start_date: string
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  telegram_or_whatsapp: '',
  nationality: '',
  about_you: '',
  contribution_plan: '',
  contribution_past: '',
  contribution_commitment: '',
  social_link: '',
  linkedin: '',
  github: '',
  content_studio: '',
  preferred_start_date: '',
}

const COUNTRIES_AND_REGIONS = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia & Herzegovina", "Brazil", "Bulgaria", "Cambodia",
  "Cameroon", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Ecuador", "Egypt", "Estonia", "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece",
  "Guatemala", "Honduras", "Hong Kong SAR", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kosovo", "Kuwait", "Latvia", "Lebanon",
  "Lithuania", "Luxembourg", "Macau SAR", "Malaysia", "Malta", "Mexico", "Moldova", "Morocco", "Myanmar", "Nepal",
  "Netherlands", "New Zealand", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palestine", "Panama",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Senegal",
  "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe",
]

const START_DATE_OPTIONS = [
  { value: "2026-07-15", label: "July 15, 2026" },
  { value: "2026-08-01", label: "August 1, 2026" },
  { value: "2026-08-15", label: "August 15, 2026" },
  { value: "2026-09-01", label: "September 1, 2026" },
  { value: "2026-09-15", label: "September 15, 2026" },
  { value: "2026-10-01", label: "October 1, 2026" },
]

const LONGEVITY_APPLICATION_STEPS = [
  "Submit the application form, including your background and planned contribution",
  "Join an online interview",
  "Receive the selection result",
]

const SOCIAL_LINK_LABELS: Record<ProgramType, string> = {
  art: "Portfolio or Personal Website",
  longevity: "Personal Website, Research Profile, or Social Media",
  crypto: "Your Social Media, Personal Website or Publications",
}

const SECONDARY_LINK_CONFIG: Record<ProgramType, { label: string; placeholder: string; hint?: string }> = {
  art: { label: "Social Media", placeholder: "Instagram, X, Behance, etc." },
  longevity: {
    label: "Additional Information",
    placeholder: "Additional link or brief note...",
    hint: "Share any additional link or detail that may help us understand your work and interests.",
  },
  crypto: { label: "GitHub", placeholder: "https://github.com/..." },
}

function CharacterLimitedTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  const remainingCharacters = getRemainingCharacters(value)
  const isOverLimit = isResponseOverCharacterLimit(value)

  return (
    <>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={isOverLimit ? "border-red-500 focus-visible:ring-red-500" : ""}
      />
      <p className={`text-xs ${isOverLimit ? "font-medium text-red-500" : "text-muted-foreground"}`}>
        {remainingCharacters} characters remaining{isOverLimit && " - Please reduce your response"}
      </p>
    </>
  )
}

export default function ApplicationForm({ programType, programTitle, programColor }: ApplicationFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countryOpen, setCountryOpen] = useState(false)

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

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
    if (isResponseOverCharacterLimit(formData.about_you)) {
      setError(`Please keep your response under ${APPLICATION_RESPONSE_CHARACTER_LIMIT} characters`)
      return false
    }
    const contributionFields = [
      ["Please describe how you plan to contribute during your stay", formData.contribution_plan],
      ["Please share a past contribution experience", formData.contribution_past],
      ["Please describe your commitment during your stay", formData.contribution_commitment],
    ] as const
    for (const [message, value] of contributionFields) {
      if (!value.trim()) {
        setError(message)
        return false
      }
      if (isResponseOverCharacterLimit(value)) {
        setError(`Please keep each response under ${APPLICATION_RESPONSE_CHARACTER_LIMIT} characters`)
        return false
      }
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
          contribution_plan: formData.contribution_plan,
          contribution_past: formData.contribution_past,
          contribution_commitment: formData.contribution_commitment,
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

  const secondaryLink = SECONDARY_LINK_CONFIG[programType]

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      {programType === 'longevity' && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4" style={{ backgroundColor: "#10b98115" }}>
            <h2 className="text-base font-semibold text-foreground">Process &amp; Duration</h2>
          </div>
          <div className="space-y-6 px-6 py-5">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Application Process</h3>
              <ol className="space-y-2">
                {LONGEVITY_APPLICATION_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: "#10b981" }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Residency Duration</h3>
              <p className="text-sm text-foreground">At least one month</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">PERSONAL INFORMATION</h2>

        <div className="space-y-2">
          <Label htmlFor="application-name">Name <span className="text-red-500">*</span></Label>
          <Input
            id="application-name"
            value={formData.name}
            onChange={(event) => handleFieldChange('name', event.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="application-email">Email <span className="text-red-500">*</span></Label>
          <Input
            id="application-email"
            type="email"
            value={formData.email}
            onChange={(event) => handleFieldChange('email', event.target.value)}
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="application-contact">WhatsApp or Telegram <span className="text-red-500">*</span></Label>
          <Input
            id="application-contact"
            value={formData.telegram_or_whatsapp}
            onChange={(event) => handleFieldChange('telegram_or_whatsapp', event.target.value)}
            placeholder="@username or +1234567890"
          />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">VISIT DETAILS</h2>

        <div className="space-y-2">
          <Label htmlFor="application-start-date">Preferred Start Date <span className="text-red-500">*</span></Label>
          <select
            id="application-start-date"
            value={formData.preferred_start_date}
            onChange={(event) => handleFieldChange('preferred_start_date', event.target.value)}
            className="w-full h-10 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
          >
            <option value="">Select a start date</option>
            {START_DATE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Country &amp; Region <span className="text-red-500">*</span></Label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="w-full justify-between font-normal"
              >
                <span className={formData.nationality ? "text-foreground" : "text-muted-foreground"}>
                  {formData.nationality || "Select a country or region..."}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search country or region..." />
                <CommandList>
                  <CommandEmpty>No result found.</CommandEmpty>
                  <CommandGroup>
                    {COUNTRIES_AND_REGIONS.map((country) => (
                      <CommandItem
                        key={country}
                        value={country}
                        onSelect={(value) => {
                          handleFieldChange('nationality', value === formData.nationality ? '' : value)
                          setCountryOpen(false)
                        }}
                      >
                        <Check className={`mr-2 size-4 ${formData.nationality === country ? "opacity-100" : "opacity-0"}`} />
                        {country}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

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
            (Please keep your response under {APPLICATION_RESPONSE_CHARACTER_LIMIT} characters.)
          </p>
          <CharacterLimitedTextarea
            value={formData.about_you}
            onChange={(value) => handleFieldChange('about_you', value)}
            placeholder="Tell us about yourself..."
            rows={6}
          />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">CONTRIBUTION</h2>
        <div className="space-y-2">
          <Label>How do you plan to contribute during your stay? <span className="text-red-500">*</span></Label>
          <p className="text-sm text-muted-foreground">
            Describe one or two concrete ways you hope to contribute to the 4Seas community during your residency.
          </p>
          <CharacterLimitedTextarea
            value={formData.contribution_plan}
            onChange={(value) => handleFieldChange('contribution_plan', value)}
            placeholder="Describe your planned contribution..."
          />
        </div>

        <div className="space-y-2">
          <Label>Tell us about a time you contributed to a community. <span className="text-red-500">*</span></Label>
          <p className="text-sm text-muted-foreground">
            Briefly describe what you did and the impact it had.
          </p>
          <CharacterLimitedTextarea
            value={formData.contribution_past}
            onChange={(value) => handleFieldChange('contribution_past', value)}
            placeholder="Share a past contribution experience..."
          />
        </div>

        <div className="space-y-2">
          <Label>What commitment are you willing to make during your stay? <span className="text-red-500">*</span></Label>
          <p className="text-sm text-muted-foreground">
            Tell us what level of participation the community can realistically expect from you.
          </p>
          <CharacterLimitedTextarea
            value={formData.contribution_commitment}
            onChange={(value) => handleFieldChange('contribution_commitment', value)}
            placeholder="Describe your expected level of participation..."
          />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">SOCIAL LINKS</h2>

        <div className="space-y-2">
          <Label>{SOCIAL_LINK_LABELS[programType]} <span className="text-red-500">*</span></Label>
          <p className="text-sm text-muted-foreground">
            At least provide one link, so that we can know a bit more from you.
          </p>
          <Input
            value={formData.social_link}
            onChange={(event) => handleFieldChange('social_link', event.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label>LinkedIn</Label>
          <Input
            value={formData.linkedin}
            onChange={(event) => handleFieldChange('linkedin', event.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="space-y-2">
          <Label>{secondaryLink.label}</Label>
          {secondaryLink.hint && <p className="text-sm text-muted-foreground">{secondaryLink.hint}</p>}
          <Input
            value={formData.github}
            onChange={(event) => handleFieldChange('github', event.target.value)}
            placeholder={secondaryLink.placeholder}
          />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider">CONTENT STUDIO</h2>

        <div className="space-y-2">
          <Label>Do you have any plans to use the Content Studio during your residency?</Label>
          <p className="text-sm text-muted-foreground">
            We have a fully equipped content studio available for residents. Let us know if you have any content creation plans (podcasts, videos, interviews, etc.)
          </p>
          <Textarea
            value={formData.content_studio}
            onChange={(event) => handleFieldChange('content_studio', event.target.value)}
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
