import { STATUS_CONFIG } from "@/lib/programs"
import type { ApplicationStatus } from "@/lib/programs"

interface StatusSelectProps {
  status: ApplicationStatus
  onChange: (status: ApplicationStatus) => void
  className?: string
}

/** Status dropdown styled with the current status's colors. */
export function StatusSelect({ status, onChange, className = "" }: StatusSelectProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.new
  const groups: { label: string; statuses: ApplicationStatus[] }[] = [
    { label: "New", statuses: ["new", "reviewing"] },
    { label: "In Progress", statuses: ["interview_needed", "interviewing"] },
    { label: "Interview Result", statuses: ["interview_passed", "interview_rejected"] },
    { label: "Final Decision", statuses: ["accepted", "accepted_post_interview", "rejected"] },
  ]

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      className={`cursor-pointer rounded border px-2 py-1 text-xs font-medium ${config.bgColor} ${config.color} ${className}`}
    >
      {groups.map((group) => <optgroup key={group.label} label={group.label}>{group.statuses.map((item) => <option key={item} value={item}>{STATUS_CONFIG[item].label}</option>)}</optgroup>)}
    </select>
  )
}
