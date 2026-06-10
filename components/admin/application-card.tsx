"use client"

import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import type { ProgramType, ApplicationStatus } from "@/lib/programs"
import type { Application, AdminComment, CommentDraft } from "@/lib/applications/types"
import { ExternalLink } from "@/components/admin/external-link"
import { StatusSelect } from "@/components/admin/status-select"
import { TrackBadge } from "@/components/admin/track-badge"
import { CommentComposer } from "@/components/admin/comment-composer"

interface ApplicationCardProps {
  app: Application
  index: number
  comments: AdminComment[]
  expanded: boolean
  onToggleComments: (id: string) => void
  savingCommentId: string | null
  onUpdateStatus: (id: string, status: ApplicationStatus) => void
  onUpdateProgramType: (id: string, program: ProgramType | "other") => void
  onUpdateActualStartDate: (id: string, date: string) => void
  onAddComment: (id: string, draft: CommentDraft) => Promise<boolean>
  onDeleteComment: (commentId: string, applicationId: string) => void
}

/** Section label used to group fields within a card. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">{children}</p>
  )
}

/** A single labelled value within a card's field grid. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

export function ApplicationCard({
  app,
  index,
  comments,
  expanded,
  onToggleComments,
  savingCommentId,
  onUpdateStatus,
  onUpdateProgramType,
  onUpdateActualStartDate,
  onAddComment,
  onDeleteComment,
}: ApplicationCardProps) {
  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrackBadge
            programType={app.program_type}
            onMove={(program) => onUpdateProgramType(app.id, program)}
          />
          <div>
            <h3 className="text-lg font-semibold text-foreground">{app.full_name}</h3>
            <p className="text-muted-foreground text-sm">{app.email}</p>
          </div>
        </div>
        <div className="text-right">
          <StatusSelect
            status={app.status}
            onChange={(status) => onUpdateStatus(app.id, status)}
            className="text-sm px-3 py-1"
          />
          {app.reviewed_at && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Updated: {new Date(app.reviewed_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <SectionLabel>PERSONAL INFORMATION</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 text-sm mb-5">
        <Field label="Name">
          <p className="break-words">{app.full_name || "-"}</p>
        </Field>
        <Field label="Email">
          <p className="break-words">{app.email || "-"}</p>
        </Field>
        <Field label="WhatsApp or Telegram">
          <p className="break-words">{app.telegram || "-"}</p>
        </Field>
      </div>

      <SectionLabel>VISIT DETAILS</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 text-sm mb-5">
        <Field label="Preferred Start Date">
          <p>{app.preferred_start_date || "-"}</p>
        </Field>
        <Field label="Actual Start Date">
          <input
            type="date"
            value={app.actual_start_date || ""}
            onChange={(e) => onUpdateActualStartDate(app.id, e.target.value)}
            className="bg-background border border-border rounded px-2 py-1 text-sm mt-0.5"
          />
        </Field>
        <Field label="Duration">
          <p>{app.preferred_duration || "-"}</p>
        </Field>
        <Field label="Country">
          <p>{app.country || "-"}</p>
        </Field>
      </div>

      <SectionLabel>ABOUT YOU</SectionLabel>
      <div className="space-y-4 mb-5">
        <div>
          <p className="text-muted-foreground text-sm mb-1">Tell us about yourself</p>
          <p className="text-foreground whitespace-pre-wrap">{app.about_and_contribution || "-"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm mb-1">What do you plan to contribute?</p>
          <p className="text-foreground whitespace-pre-wrap">{app.proposed_contribution || "-"}</p>
        </div>
      </div>

      <SectionLabel>SOCIAL LINKS</SectionLabel>
      <div className="space-y-3 text-sm mb-5">
        <Field label="Social Media / Website / Portfolio">
          <ExternalLink
            url={app.social_links}
            className="text-primary hover:underline break-all"
            fallback={<p>-</p>}
          />
        </Field>
        <Field label="LinkedIn">
          <ExternalLink
            url={app.linkedin_link}
            className="text-primary hover:underline break-all"
            fallback={<p>-</p>}
          />
        </Field>
        <Field label="GitHub / Social Media">
          <ExternalLink
            url={app.github_link}
            className="text-primary hover:underline break-all"
            fallback={<p>-</p>}
          />
        </Field>
      </div>

      <SectionLabel>CONTENT STUDIO</SectionLabel>
      <div className="space-y-1 mb-4">
        <p className="text-muted-foreground text-sm">Plans to use the Content Studio</p>
        <p className="text-foreground whitespace-pre-wrap">{app.needs_support || "-"}</p>
      </div>

      {/* Comments Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Comments ({comments.length})</span>
          <button
            onClick={() => onToggleComments(app.id)}
            className="text-xs text-primary hover:underline"
          >
            {expanded ? "Close" : "Add Comment"}
          </button>
        </div>

        {comments.length > 0 && (
          <div className="space-y-2 mb-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-muted/50 rounded p-3 text-sm">
                <div className="flex items-start justify-between">
                  <span className="font-medium">{comment.reviewer_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                    <button
                      onClick={() => onDeleteComment(comment.id, app.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-foreground">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}

        {expanded && (
          <CommentComposer
            applicationId={app.id}
            saving={savingCommentId === app.id}
            onSubmit={onAddComment}
            onSubmitted={() => onToggleComments(app.id)}
            variant="card"
          />
        )}
      </div>
    </motion.div>
  )
}
