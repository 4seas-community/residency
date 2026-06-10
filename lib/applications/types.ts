import type { ProgramType, ApplicationStatus } from "@/lib/programs"

export interface Application {
  id: string
  created_at: string
  updated_at: string | null
  program_type: ProgramType
  full_name: string
  email: string
  contact_info: string | null
  telegram: string | null
  whatsapp: string | null
  country: string | null
  city: string | null
  nationality: string | null
  current_location: string | null
  role_title: string | null
  organization: string | null
  website: string | null
  preferred_start_date: string
  actual_start_date: string | null
  preferred_duration: string | null
  about_and_contribution: string
  bio: string | null
  why_4seas: string | null
  why_this_track: string | null
  proposed_contribution: string | null
  social_links: string
  linkedin_link: string | null
  github_link: string | null
  portfolio_url: string | null
  content_studio_plans: string | null
  needs_accommodation: boolean | null
  needs_support: string | null
  previous_community_experience: string | null
  anything_else: string | null
  program_specific_answers: Record<string, string> | null
  status: ApplicationStatus
  reviewed_by: string | null
  reviewed_at: string | null
  assigned_admin: string | null
}

export interface AdminComment {
  id: string
  application_id: string
  reviewer_name: string
  comment: string
  created_at: string
}

/** A draft comment being composed for a given application. */
export interface CommentDraft {
  reviewer_name: string
  comment: string
}

export type SortType = "newest" | "oldest" | "name"

export type ColumnSortKey =
  | "full_name"
  | "email"
  | "program_type"
  | "preferred_start_date"
  | "status"
  | "created_at"
  | null

export type ColumnSortDirection = "asc" | "desc"

export interface ColumnSort {
  key: ColumnSortKey
  direction: ColumnSortDirection
}

export type ProgramFilter = "all" | ProgramType | "other"
export type StatusFilter = "all" | ApplicationStatus

/** Statuses available in the status dropdowns, in display order. */
export const ALL_STATUSES: ApplicationStatus[] = [
  "new",
  "shortlisted",
  "interview_needed",
  "accepted",
  "rejected",
  "reviewing",
]
