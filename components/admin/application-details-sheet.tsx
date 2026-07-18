"use client"

import { ExternalLink, Trash2 } from "lucide-react"
import type { Application, AdminComment, CommentDraft } from "@/lib/applications/types"
import type { ApplicationStatus, ProgramType } from "@/lib/programs"
import { formatDateTimeGMT7, normalizeUrl } from "@/lib/applications/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { StatusSelect } from "@/components/admin/status-select"
import { TrackBadge } from "@/components/admin/track-badge"
import { CommentComposer } from "@/components/admin/comment-composer"

interface Props {
  application: Application | null
  comments: AdminComment[]
  open: boolean
  onOpenChange: (open: boolean) => void
  commentExpanded: boolean
  savingCommentId: string | null
  onToggleComments: (id: string) => void
  onUpdateStatus: (id: string, status: ApplicationStatus) => void
  onUpdateProgramType: (id: string, program: ProgramType | "other") => void
  onUpdateActualStartDate: (id: string, date: string) => void
  onAddComment: (id: string, draft: CommentDraft) => Promise<boolean>
  onDeleteComment: (commentId: string, applicationId: string) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="flex flex-col gap-3 border-t border-border pt-5"><h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>{children}</section>
}
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm leading-relaxed text-foreground">{value || "—"}</dd></div>
}
function LongAnswer({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return <div><h4 className="text-sm font-medium">{label}</h4><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{value}</p></div>
}
function LinkButton({ label, url }: { label: string; url: string | null | undefined }) {
  if (!url) return null
  return <Button asChild variant="outline" size="sm"><a href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer">{label}<ExternalLink data-icon="inline-end" /></a></Button>
}

export function ApplicationDetailsSheet({ application, comments, open, onOpenChange, commentExpanded, savingCommentId, onToggleComments, onUpdateStatus, onUpdateProgramType, onUpdateActualStartDate, onAddComment, onDeleteComment }: Props) {
  if (!application) return null
  const extraAnswers = Object.entries(application.program_specific_answers || {}).filter(([, value]) => value)

  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl">
      <SheetHeader className="border-b border-border px-6 py-5 pr-12">
        <div className="flex flex-wrap items-center gap-2"><TrackBadge programType={application.program_type} onMove={(program) => onUpdateProgramType(application.id, program)} /><StatusSelect status={application.status} onChange={(status) => onUpdateStatus(application.id, status)} /></div>
        <SheetTitle className="mt-2 text-2xl text-balance">{application.full_name}</SheetTitle>
        <SheetDescription className="break-all">{application.email}</SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-6 py-5"><div className="flex flex-col gap-6 pb-10">
        <Section title="Personal information"><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Email" value={application.email} /><Detail label="Role" value={application.role_title} /><Detail label="Organization" value={application.organization} /><Detail label="Country" value={application.country} /><Detail label="City" value={application.city} /><Detail label="Current location" value={application.current_location} /><Detail label="Nationality" value={application.nationality} /><Detail label="Contact" value={application.contact_info} /><Detail label="Telegram" value={application.telegram} /><Detail label="WhatsApp" value={application.whatsapp} />
        </dl></Section>
        <Section title="Visit details"><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Preferred start date" value={application.preferred_start_date} /><Detail label="Preferred duration" value={application.preferred_duration} /><Detail label="Actual start date" value={<input type="date" value={application.actual_start_date || ""} onChange={(event) => onUpdateActualStartDate(application.id, event.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />} /><Detail label="Submitted" value={formatDateTimeGMT7(application.created_at)} />
        </dl></Section>
        <Section title="Application"><LongAnswer label="About" value={application.about_and_contribution} /><LongAnswer label="Bio" value={application.bio} /><LongAnswer label="Why 4Seas" value={application.why_4seas} /><LongAnswer label="Why this track" value={application.why_this_track} /><LongAnswer label="Proposed contribution" value={application.proposed_contribution} /><LongAnswer label="Previous community experience" value={application.previous_community_experience} /><LongAnswer label="Anything else" value={application.anything_else} /></Section>
        <Section title="Links">
          <div className="flex flex-wrap gap-2"><LinkButton label="Website" url={application.website} /><LinkButton label="Portfolio" url={application.portfolio_url} /><LinkButton label="Social profile" url={application.social_links} /><LinkButton label="LinkedIn" url={application.linkedin_link} /><LinkButton label="GitHub / additional" url={application.github_link} /></div>
          {!application.website && !application.portfolio_url && !application.social_links && !application.linkedin_link && !application.github_link && <p className="text-sm text-muted-foreground">No links provided.</p>}
        </Section>
        <Section title="Content studio and support"><LongAnswer label="Content studio plans" value={application.content_studio_plans} /><LongAnswer label="Support needed" value={application.needs_support} /><Detail label="Needs accommodation" value={application.needs_accommodation == null ? "—" : application.needs_accommodation ? "Yes" : "No"} /></Section>
        {extraAnswers.length > 0 && <Section title="Additional answers">{extraAnswers.map(([key, value]) => <LongAnswer key={key} label={key.replaceAll("_", " ")} value={value} />)}</Section>}
        <Section title={`Admin notes (${comments.length})`}>
          {comments.length > 0 ? <div className="flex flex-col gap-3">{comments.map((comment) => <div key={comment.id} className="rounded-lg border border-border bg-muted/30 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{comment.reviewer_name}</p><p className="text-xs text-muted-foreground">{formatDateTimeGMT7(comment.created_at)}</p></div><Button type="button" variant="ghost" size="icon" onClick={() => onDeleteComment(comment.id, application.id)} aria-label="Delete note"><Trash2 /></Button></div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{comment.comment}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No admin notes yet.</p>}
          <Button type="button" variant="outline" size="sm" onClick={() => onToggleComments(application.id)}>{commentExpanded ? "Cancel" : "Add note"}</Button>
          {commentExpanded && <CommentComposer applicationId={application.id} saving={savingCommentId === application.id} onSubmit={onAddComment} onSubmitted={() => onToggleComments(application.id)} variant="card" />}
        </Section>
      </div></div>
    </SheetContent>
  </Sheet>
}
