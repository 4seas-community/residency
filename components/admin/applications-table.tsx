"use client"

import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from "lucide-react"
import type { ApplicationStatus, ProgramType } from "@/lib/programs"
import type { Application, AdminComment, ColumnSort, ColumnSortKey } from "@/lib/applications/types"
import { formatDateTimeGMT7 } from "@/lib/applications/utils"
import { Button } from "@/components/ui/button"
import { StatusSelect } from "@/components/admin/status-select"
import { TrackBadge } from "@/components/admin/track-badge"

interface ApplicationsTableProps {
  applications: Application[]
  comments: Record<string, AdminComment[]>
  columnSort: ColumnSort
  onColumnSort: (key: ColumnSortKey) => void
  onOpen: (application: Application) => void
  onUpdateStatus: (id: string, status: ApplicationStatus) => void
  onUpdateProgramType: (id: string, program: ProgramType | "other") => void
  onUpdateActualStartDate: (id: string, date: string) => void
}

export function ApplicationsTable({ applications, comments, columnSort, onColumnSort, onOpen, onUpdateStatus, onUpdateProgramType, onUpdateActualStartDate }: ApplicationsTableProps) {
  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: ColumnSortKey }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
      <button type="button" className="flex items-center gap-1.5 whitespace-nowrap hover:text-foreground" onClick={() => onColumnSort(sortKey)}>
        {label}
        {columnSort.key === sortKey ? (columnSort.direction === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3 opacity-40" />}
      </button>
    </th>
  )
  const stopRowOpen = (event: React.SyntheticEvent) => event.stopPropagation()

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="border-b border-border bg-muted/50"><tr>
            <SortableHeader label="Applicant" sortKey="full_name" />
            <SortableHeader label="Track" sortKey="program_type" />
            <SortableHeader label="Submitted" sortKey="created_at" />
            <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Location</th>
            <SortableHeader label="Preferred" sortKey="preferred_start_date" />
            <th className="w-40 px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Actual start</th>
            <SortableHeader label="Status" sortKey="status" />
            <th className="w-24 px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Details</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {applications.map((app) => {
              const commentCount = comments[app.id]?.length ?? 0
              return <tr key={app.id} tabIndex={0} role="button" onClick={() => onOpen(app)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(app) } }} className="h-20 cursor-pointer align-middle transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none">
                <td className="w-64 px-4 py-3"><p className="truncate font-medium">{app.full_name}</p><p className="truncate text-xs text-muted-foreground">{app.email}</p></td>
                <td className="w-36 px-4 py-3" onClick={stopRowOpen} onKeyDown={stopRowOpen}><TrackBadge programType={app.program_type} onMove={(program) => onUpdateProgramType(app.id, program)} /></td>
                <td className="w-40 px-4 py-3 text-xs text-muted-foreground">{formatDateTimeGMT7(app.created_at)}</td>
                <td className="w-32 px-4 py-3"><p className="truncate">{app.city || app.current_location || app.country || "—"}</p>{app.country && app.city && <p className="truncate text-xs text-muted-foreground">{app.country}</p>}</td>
                <td className="w-36 px-4 py-3 text-xs">{app.preferred_start_date || "—"}</td>
                <td className="w-40 px-4 py-3" onClick={stopRowOpen} onKeyDown={stopRowOpen}><input type="date" aria-label={`Actual start date for ${app.full_name}`} value={app.actual_start_date || ""} onChange={(event) => onUpdateActualStartDate(app.id, event.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs" /></td>
                <td className="w-44 px-4 py-3" onClick={stopRowOpen} onKeyDown={stopRowOpen}><StatusSelect status={app.status} onChange={(status) => onUpdateStatus(app.id, status)} className="max-w-full" /></td>
                <td className="w-24 px-4 py-3 text-right"><Button type="button" variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); onOpen(app) }} aria-label={`View ${app.full_name}'s application`}><Eye /><span className="sr-only">View application</span></Button>{commentCount > 0 && <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">{commentCount} note{commentCount === 1 ? "" : "s"}</p>}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
