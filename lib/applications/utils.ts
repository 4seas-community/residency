import { PROGRAMS, STATUS_GROUPS } from "@/lib/programs"
import type { ProgramType, ApplicationStatus } from "@/lib/programs"
import type {
  Application,
  AdminComment,
  ColumnSort,
  ProgramFilter,
  SortType,
} from "@/lib/applications/types"

/** Prefix a bare URL with https:// so it is safe to use in an anchor href. */
export function normalizeUrl(url: string): string {
  return url.startsWith("http") ? url : `https://${url}`
}

/** Format an ISO datetime string in the GMT+7 (Asia/Bangkok) timezone. */
export function formatDateTimeGMT7(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function getProgramColor(programType: ProgramType): string {
  return PROGRAMS[programType]?.color || "#6366f1"
}

export function getProgramName(programType: ProgramType): string {
  return PROGRAMS[programType]?.shortName ?? "Other"
}

export function normalizeApplicationStatus(status: ApplicationStatus): ApplicationStatus {
  const legacyStatusMap: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
    pending: "new",
    shortlisted: "reviewing",
    approved: "accepted",
    waitlist: "rejected",
    withdrawn: "rejected",
  }
  return legacyStatusMap[status] ?? status
}

/** Count applications matching a program filter (including the synthetic "other" bucket). */
export function getCountByProgram(
  applications: Application[],
  program: ProgramFilter,
): number {
  return applications.filter((application) => matchesProgramFilter(application, program)).length
}

function matchesProgramFilter(application: Application, programFilter: ProgramFilter): boolean {
  if (programFilter === "all") return true
  if (programFilter === "other") {
    return !Object.keys(PROGRAMS).includes(application.program_type)
  }
  return application.program_type === programFilter
}

/** Count applications with a given status, scoped to the active program filter. */
export function getStatusCount(
  applications: Application[],
  programFilter: ProgramFilter,
  status: ApplicationStatus,
): number {
  return applications.filter(
    (application) => matchesProgramFilter(application, programFilter) && application.status === status,
  ).length
}

export function getGroupCount(
  applications: Application[],
  programFilter: ProgramFilter,
  groupKey: keyof typeof STATUS_GROUPS,
): number {
  const statuses = STATUS_GROUPS[groupKey].statuses
  return applications.filter(
    (application) =>
      matchesProgramFilter(application, programFilter) && statuses.includes(application.status),
  ).length
}

export interface ApplicationFilters {
  programFilter: ProgramFilter
  statusFilter: "all" | ApplicationStatus | ApplicationStatus[]
  startDateFrom: string
  startDateTo: string
  searchQuery: string
}

function normalizeSearchText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "")
}

/** Apply the program, status, start-date range, and search filters to the application list. */
export function filterApplications(
  applications: Application[],
  { programFilter, statusFilter, startDateFrom, startDateTo, searchQuery }: ApplicationFilters,
): Application[] {
  return applications.filter((app) => {
    if (!matchesProgramFilter(app, programFilter)) return false

    // Status filter
    if (statusFilter !== "all") {
      if (Array.isArray(statusFilter)) {
        if (!statusFilter.includes(app.status)) return false
      } else if (app.status !== statusFilter) return false
    }

    // Start date range filter
    if (startDateFrom || startDateTo) {
      const appDate = new Date(app.preferred_start_date)
      if (startDateFrom && appDate < new Date(startDateFrom)) return false
      if (startDateTo) {
        const toDate = new Date(startDateTo)
        toDate.setHours(23, 59, 59, 999)
        if (appDate > toDate) return false
      }
    }

    const searchTerms = searchQuery
      .trim()
      .split(/\s+/)
      .map(normalizeSearchText)
      .filter(Boolean)

    if (searchTerms.length > 0) {
      const searchableText = [
        app.full_name,
        app.email,
        app.contact_info,
        app.telegram,
        app.whatsapp,
        app.linkedin_link,
        app.github_link,
        app.social_links,
        app.organization,
        app.role_title,
      ]
        .map(normalizeSearchText)
        .join("|")

      return searchTerms.every((term) => searchableText.includes(term))
    }

    return true
  })
}

/**
 * Sort applications. An active column sort takes precedence over the dropdown
 * sort; the original list is not mutated.
 */
export function sortApplications(
  applications: Application[],
  columnSort: ColumnSort,
  sortBy: SortType,
): Application[] {
  return [...applications].sort((a, b) => {
    if (columnSort.key) {
      const direction = columnSort.direction === "asc" ? 1 : -1
      switch (columnSort.key) {
        case "full_name":
          return direction * a.full_name.localeCompare(b.full_name)
        case "email":
          return direction * a.email.localeCompare(b.email)
        case "program_type":
          return direction * (a.program_type || "").localeCompare(b.program_type || "")
        case "preferred_start_date":
          return direction * a.preferred_start_date.localeCompare(b.preferred_start_date)
        case "status":
          return direction * a.status.localeCompare(b.status)
        case "created_at":
          return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        default:
          return 0
      }
    }

    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "name":
        return a.full_name.localeCompare(b.full_name)
      default:
        return 0
    }
  })
}

const CSV_HEADERS = [
  "ID", "Program", "Submitted At", "Full Name", "Email", "Telegram", "WhatsApp",
  "Country", "City", "Role", "Organization", "Website",
  "Preferred Start Date", "Actual Start Date", "Preferred Duration", "About & Contribution", "Proposed Contribution",
  "Bio", "Why 4Seas", "Why This Track", "Social Links", "LinkedIn", "GitHub", "Portfolio",
  "Content Studio Plans", "Needs Accommodation", "Needs Support",
  "Previous Experience", "Anything Else", "Program Specific Answers",
  "Status", "Reviewed By", "Reviewed At", "Comments",
]

/** Quote a CSV field, escape embedded quotes, and collapse newlines into spaces. */
function csvCell(value: string | null | undefined): string {
  return `"${(value || "").replace(/"/g, '""').replace(/\n/g, " ")}"`
}

/** Build the full CSV document string for the given applications and their comments. */
export function buildApplicationsCsv(
  applications: Application[],
  comments: Record<string, AdminComment[]>,
): string {
  const rows = applications.map((app) => {
    const appComments = comments[app.id] || []
    const commentText = appComments
      .map((c) => `[${c.reviewer_name} - ${new Date(c.created_at).toLocaleString()}]: ${c.comment}`)
      .join(" | ")
    const programSpecific = app.program_specific_answers
      ? JSON.stringify(app.program_specific_answers)
      : ""

    return [
      app.id,
      app.program_type,
      formatDateTimeGMT7(app.created_at),
      csvCell(app.full_name),
      csvCell(app.email),
      app.telegram || "",
      app.whatsapp || "",
      app.country || "",
      app.city || "",
      app.role_title || "",
      app.organization || "",
      app.website || "",
      app.preferred_start_date,
      app.actual_start_date || "",
      app.preferred_duration || "",
      csvCell(app.about_and_contribution),
      csvCell(app.proposed_contribution),
      csvCell(app.bio),
      csvCell(app.why_4seas),
      csvCell(app.why_this_track),
      csvCell(app.social_links),
      app.linkedin_link || "",
      app.github_link || "",
      app.portfolio_url || "",
      csvCell(app.content_studio_plans),
      app.needs_accommodation == null ? "" : app.needs_accommodation ? "Yes" : "No",
      csvCell(app.needs_support),
      csvCell(app.previous_community_experience),
      csvCell(app.anything_else),
      `"${programSpecific.replace(/"/g, '""')}"`,
      app.status,
      app.reviewed_by || "",
      app.reviewed_at ? formatDateTimeGMT7(app.reviewed_at) : "",
      csvCell(commentText),
    ].join(",")
  })

  return [CSV_HEADERS.join(","), ...rows].join("\n")
}

/** Trigger a client-side download of a CSV string as a file. */
export function downloadCsv(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const objectUrl = URL.createObjectURL(blob)
  link.href = objectUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(objectUrl)
}
