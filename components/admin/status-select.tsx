import { getStatusConfig } from "@/lib/programs"
import type { ApplicationStatus } from "@/lib/programs"
import { ALL_STATUSES } from "@/lib/applications/types"

interface StatusSelectProps {
  status: ApplicationStatus
  onChange: (status: ApplicationStatus) => void
  className?: string
}

/** Status dropdown styled with the current status's colors. */
export function StatusSelect({ status, onChange, className = "" }: StatusSelectProps) {
  const config = getStatusConfig(status)

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      className={`rounded border ${config.bgColor} ${config.color} ${className}`}
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {getStatusConfig(s).label}
        </option>
      ))}
    </select>
  )
}
