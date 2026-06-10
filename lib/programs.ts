// Program Configuration System for Multi-Program Residency

export type ProgramType = 'crypto' | 'art' | 'longevity'

export type ApplicationStatus = 
  | 'new' 
  | 'reviewing' 
  | 'shortlisted' 
  | 'interview_needed' 
  | 'accepted' 
  | 'rejected' 
  | 'waitlist' 
  | 'withdrawn'
  | 'pending'
  | 'approved'

export interface ProgramConfig {
  id: ProgramType
  name: string
  shortName: string
  tagline: string
  description: string
  color: string
  bgColor: string
  textColor: string
  icon: string
  features: string[]
  idealFor: string[]
  duration: string[]
  highlights: {
    title: string
    description: string
  }[]
  applicationQuestions: {
    id: string
    question: string
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio'
    required: boolean
    options?: string[]
    placeholder?: string
  }[]
  isActive: boolean
  isHidden?: boolean  // Hidden from main hub but still accessible via direct URL
  applicationDeadline?: string
  cohortStartDate?: string
}

export const PROGRAMS: Record<ProgramType, ProgramConfig> = {
  crypto: {
    id: 'crypto',
    name: 'Crypto Residency',
    shortName: 'Crypto',
    tagline: 'Build the Future of Web3',
    description: 'A curated residency program for crypto builders, researchers, and founders. Join a community of like-minded innovators pushing the boundaries of decentralized technology in a stunning coastal setting.',
    color: '#0d9488',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
    icon: '🔗',
    features: [
      'Access to Web3 developer community',
      'Mentorship from industry leaders',
      'Collaboration spaces & content studio',
      'Networking events & demo days',
      'Optional accommodation support'
    ],
    idealFor: [
      'Protocol developers',
      'DeFi builders',
      'Smart contract engineers',
      'Crypto researchers',
      'Web3 founders'
    ],
    duration: ['2 weeks', '1 month', '3 months'],
    highlights: [
      {
        title: 'Builder Community',
        description: 'Connect with top crypto builders and researchers in an intimate setting'
      },
      {
        title: 'Content Studio',
        description: 'Access our professional podcast and content creation facilities'
      },
      {
        title: 'Oceanfront Location',
        description: 'Work and live in a beautiful seaside environment'
      }
    ],
    applicationQuestions: [
      {
        id: 'crypto_project',
        question: 'What crypto project are you currently working on?',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your current project, protocol, or research focus...'
      },
      {
        id: 'crypto_experience',
        question: 'How many years have you been in crypto/Web3?',
        type: 'select',
        required: true,
        options: ['< 1 year', '1-2 years', '3-5 years', '5+ years']
      },
      {
        id: 'crypto_goals',
        question: 'What do you hope to achieve during the residency?',
        type: 'textarea',
        required: true,
        placeholder: 'Your goals for the residency period...'
      }
    ],
    isActive: true,
    cohortStartDate: 'Rolling admissions'
  },
  art: {
    id: 'art',
    name: 'Art Residency',
    shortName: 'Art',
    tagline: 'Create Without Boundaries',
    description: 'An immersive residency for visual artists, digital creators, and multimedia artists. Find inspiration in our oceanfront studios and collaborate with a diverse community of creative minds.',
    color: '#ec4899',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    icon: '🎨',
    features: [
      'Private studio spaces',
      'Exhibition opportunities',
      'Artist talks & critiques',
      'Cross-disciplinary collaboration',
      'Material and equipment access'
    ],
    idealFor: [
      'Visual artists',
      'Digital artists',
      'Multimedia creators',
      'NFT artists',
      'Installation artists'
    ],
    duration: ['1 month', '2 months', '3 months'],
    highlights: [
      {
        title: 'Studio Space',
        description: 'Dedicated workspace with natural light and ocean views'
      },
      {
        title: 'Community',
        description: 'Connect with artists from diverse backgrounds and disciplines'
      },
      {
        title: 'Exhibition',
        description: 'Opportunity to showcase your work at the end of residency'
      }
    ],
    applicationQuestions: [
      {
        id: 'art_medium',
        question: 'What is your primary artistic medium?',
        type: 'text',
        required: true,
        placeholder: 'e.g., Digital art, painting, sculpture, multimedia...'
      },
      {
        id: 'art_portfolio',
        question: 'Please share links to your portfolio or recent work',
        type: 'textarea',
        required: true,
        placeholder: 'Portfolio URL, Instagram, Foundation, etc.'
      },
      {
        id: 'art_project',
        question: 'What project do you plan to work on during the residency?',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the project or body of work you want to create...'
      }
    ],
    isActive: true,
    cohortStartDate: 'Q2 2026'
  },
  longevity: {
    id: 'longevity',
    name: 'Longevity Residency',
    shortName: 'Longevity',
    tagline: 'Extend Human Potential',
    description: 'A research-focused residency for scientists, biohackers, and longevity enthusiasts. Explore cutting-edge life extension research while enjoying a health-optimized living environment.',
    color: '#10b981',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    icon: '🧬',
    features: [
      'Longevity research',
      'Biohacking',
      'Health optimization',
      'Expert network',
      'Wellness programs'
    ],
    idealFor: [
      'Longevity researchers',
      'Biohackers',
      'Health tech founders',
      'Medical professionals',
      'Wellness innovators'
    ],
    duration: ['2 weeks', '1 month', '3 months'],
    highlights: [
      {
        title: 'Research Focus',
        description: 'Access to longevity research community and resources'
      },
      {
        title: 'Health Optimization',
        description: 'Live in an environment designed for optimal health'
      },
      {
        title: 'Expert Network',
        description: 'Connect with leading longevity scientists and practitioners'
      }
    ],
    applicationQuestions: [
      {
        id: 'longevity_background',
        question: 'What is your background in longevity/health science?',
        type: 'textarea',
        required: true,
        placeholder: 'Your research, work, or interest in longevity...'
      },
      {
        id: 'longevity_focus',
        question: 'What area of longevity are you most interested in?',
        type: 'select',
        required: true,
        options: ['Genetics & Epigenetics', 'Nutrition & Fasting', 'Exercise Science', 'Supplements & Compounds', 'Mental Health & Cognition', 'Sleep Optimization', 'Other']
      },
      {
        id: 'longevity_project',
        question: 'What do you hope to research or achieve during the residency?',
        type: 'textarea',
        required: true,
        placeholder: 'Your research goals or projects...'
      }
    ],
    isActive: true,
    isHidden: false, // Now visible on main hub
    cohortStartDate: 'Coming Soon'
  }
}

export const getProgram = (id: ProgramType): ProgramConfig | undefined => {
  return PROGRAMS[id]
}

export const getActivePrograms = (): ProgramConfig[] => {
  return Object.values(PROGRAMS).filter(p => p.isActive)
}

export const getAllPrograms = (): ProgramConfig[] => {
  return Object.values(PROGRAMS)
}

// Get programs visible on the hub page (excludes hidden programs)
export const getVisiblePrograms = (): ProgramConfig[] => {
  return Object.values(PROGRAMS).filter(p => !p.isHidden)
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  reviewing: { label: 'Reviewing', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  shortlisted: { label: 'Shortlisted', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  interview_needed: { label: 'Interview Needed', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  accepted: { label: 'Accepted', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
  waitlist: { label: 'Waitlist', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  withdrawn: { label: 'Withdrawn', color: 'text-gray-500', bgColor: 'bg-gray-50' },
  pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' }
}

export const getStatusConfig = (status: ApplicationStatus) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.new
}
