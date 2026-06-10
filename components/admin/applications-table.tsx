"use client"

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { getStatusConfig } from "@/lib/programs"
import type { ProgramType, ApplicationStatus } from "@/lib/programs"
import type {
  Application,
  AdminComment,
  ColumnSort,
  ColumnSortKey,
  CommentDraft,
} from "@/lib/applications/types"
import { formatDateTimeGMT7 } from "@/lib/applications/utils"
import { ExternalLink } from "@/components/admin/external-link"
import { StatusSelect } from "@/components/admin/status-select"
import { TrackBadge } from "@/components/admin/track-badge"
import { CommentComposer } from "@/components/admin/comment-composer"

interface ApplicationsTableProps {
  applications: Application[]
  comments: Record<string, AdminComment[]>
  columnSort: ColumnSort
  onColumnSort: (key: ColumnSortKey) => void
  expandedComments: Record<string, boolean>
  onToggleComments: (id: string) => void
  savingCommentId: string | null
  onUpdateStatus: (id: string, status: ApplicationStatus) => void
  onUpdateProgramType: (id: string, program: ProgramType | "other") => void
  onUpdateActualStartDate: (id: string, date: string) => void
  onAddComment: (id: string, draft: CommentDraft) => Promise<boolean>
}

export function ApplicationsTable({
  applications,
  comments,
  columnSort,
  onColumnSort,
  expandedComments,
  onToggleComments,
  savingCommentId,
  onUpdateStatus,
  onUpdateProgramType,
  onUpdateActualStartDate,
  onAddComment,
}: ApplicationsTableProps) {
  const SortableHeader = ({
    label,
    sortKey,
    className = "",
  }: {
    label: string
    sortKey: ColumnSortKey
    className?: string
  }) => (
    <th
      className={`px-3 py-3 text-left font-semibold cursor-pointer hover:bg-muted/50 transition-colors select-none ${className}`}
      onClick={() => onColumnSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {columnSort.key === sortKey ? (
          columnSort.direction === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  )

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b">
            <tr>
              <SortableHeader label="Submitted (GMT+7)" sortKey="created_at" />
              <SortableHeader label="Track" sortKey="program_type" />
              <SortableHeader label="Name" sortKey="full_name" />
              <SortableHeader label="Email" sortKey="email" />
              <th className="px-3 py-3 text-left font-semibold">Contact</th>
              <th className="px-3 py-3 text-left font-semibold">Country</th>
              <SortableHeader label="Start Date" sortKey="preferred_start_date" />
              <th className="px-3 py-3 text-left font-semibold">Actual Start Date</th>
              <th className="px-3 py-3 text-left font-semibold min-w-[300px]">About You</th>
              <th className="px-3 py-3 text-left font-semibold min-w-[300px]">Proposed Contribution</th>
              <th className="px-3 py-3 text-left font-semibold">Portfolio/Website</th>
              <th className="px-3 py-3 text-left font-semibold">LinkedIn</th>
              <th className="px-3 py-3 text-left font-semibold">GitHub/Social</th>
              <th className="px-3 py-3 text-left font-semibold min-w-[150px]">Content Studio</th>
              <SortableHeader label="Status" sortKey="status" />
              <th className="px-3 py-3 text-left font-semibold min-w-[200px]">Comments</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const appComments = comments[app.id] || []

              return (
                <tr key={app.id} className="border-b hover:bg-muted/30 align-top">
                  <td className="px-3 py-4 text-xs whitespace-nowrap">
                    {formatDateTimeGMT7(app.created_at)}
                  </td>
                  <td className="px-3 py-4 relative group/track">
                    <TrackBadge
                      programType={app.program_type}
                      onMove={(program) => onUpdateProgramType(app.id, program)}
                    />
                  </td>
                  <td className="px-3 py-4 font-medium">{app.full_name}</td>
                  <td className="px-3 py-4 text-xs break-all">{app.email}</td>
                  <td className="px-3 py-4 text-xs">
                    <div className="space-y-1">
                      {app.telegram && <div>TG: {app.telegram}</div>}
                      {app.whatsapp && <div>WA: {app.whatsapp}</div>}
                      {app.contact_info && <div>{app.contact_info}</div>}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-xs">{app.country || "-"}</td>
                  <td className="px-3 py-4 text-xs">{app.preferred_start_date}</td>
                  <td className="px-3 py-4 text-xs">
                    <input
                      type="date"
                      value={app.actual_start_date || ""}
                      onChange={(e) => onUpdateActualStartDate(app.id, e.target.value)}
                      className="bg-background border border-border rounded px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-sm whitespace-pre-wrap max-h-[150px] overflow-y-auto leading-relaxed">
                      {app.about_and_contribution}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-sm whitespace-pre-wrap max-h-[150px] overflow-y-auto leading-relaxed">
                      {app.proposed_contribution || "-"}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-xs">
                    {app.social_links ? (
                      <ExternalLink url={app.social_links} />
                    ) : app.portfolio_url ? (
                      <ExternalLink url={app.portfolio_url} />
                    ) : (
                      <ExternalLink url={app.website} />
                    )}
                  </td>
                  <td className="px-3 py-4 text-xs">
                    <ExternalLink url={app.linkedin_link} />
                  </td>
                  <td className="px-3 py-4 text-xs">
                    <ExternalLink url={app.github_link} />
                  </td>
                  <td className="px-3 py-4 text-xs">{app.needs_support || "-"}</td>
                  <td className="px-3 py-4">
                    <div className="space-y-2">
                      <StatusSelect
                        status={app.status}
                        onChange={(status) => onUpdateStatus(app.id, status)}
                        className="text-xs px-2 py-1"
                      />
                      {app.reviewed_at && (
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(app.reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 min-w-[200px]">
                    <div className="space-y-2">
                      <span className="text-xs bg-muted rounded px-2 py-1">
                        {appComments.length} comments
                      </span>
                      {appComments.length > 0 && (
                        <div className="max-h-[100px] overflow-y-auto space-y-1">
                          {appComments.slice(0, 2).map((comment) => (
                            <div key={comment.id} className="text-xs bg-muted/50 rounded p-2">
                              <span className="font-medium">{comment.reviewer_name}</span>
                              <p className="text-muted-foreground">{comment.comment.slice(0, 80)}...</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => onToggleComments(app.id)}
                        className="text-[10px] text-primary hover:underline"
                      >
                        {expandedComments[app.id] ? "Close" : "Add Comment"}
                      </button>
                      {expandedComments[app.id] && (
                        <CommentComposer
                          applicationId={app.id}
                          saving={savingCommentId === app.id}
                          onSubmit={onAddComment}
                          onSubmitted={() => onToggleComments(app.id)}
                          variant="table"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
