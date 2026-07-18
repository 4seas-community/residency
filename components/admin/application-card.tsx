"use client"

import { motion } from "framer-motion"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import type { Application, AdminComment } from "@/lib/applications/types"
import type { ApplicationStatus, ProgramType } from "@/lib/programs"
import { Button } from "@/components/ui/button"
import { StatusSelect } from "@/components/admin/status-select"
import { TrackBadge } from "@/components/admin/track-badge"

interface ApplicationCardProps {
  app: Application
  index: number
  comments: AdminComment[]
  onOpen: (application: Application) => void
  onUpdateStatus: (id: string, status: ApplicationStatus) => void
  onUpdateProgramType: (id: string, program: ProgramType | "other") => void
}

export function ApplicationCard({ app, index, comments, onOpen, onUpdateStatus, onUpdateProgramType }: ApplicationCardProps) {
  const summary = app.proposed_contribution || app.about_and_contribution || app.why_this_track

  return (
    <motion.article
      className="flex min-h-64 cursor-pointer flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03 }}
      tabIndex={0}
      role="button"
      onClick={() => onOpen(app)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen(app)
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-foreground">{app.full_name}</h3>
          <p className="truncate text-sm text-muted-foreground">{app.email}</p>
        </div>
        <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <StatusSelect status={app.status} onChange={(status) => onUpdateStatus(app.id, status)} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <TrackBadge programType={app.program_type} onMove={(program) => onUpdateProgramType(app.id, program)} />
        </span>
        <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />{app.preferred_start_date || "No date"}</span>
        <span className="flex min-w-0 items-center gap-1"><MapPin className="size-3.5" /><span className="truncate">{app.city || app.current_location || app.country || "Location not provided"}</span></span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{summary || "No application summary provided."}</p>

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <span className="text-xs text-muted-foreground">{comments.length} note{comments.length === 1 ? "" : "s"}</span>
        <Button type="button" variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); onOpen(app) }}>
          View details <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </motion.article>
  )
}
