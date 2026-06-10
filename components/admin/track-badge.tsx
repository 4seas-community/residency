"use client"

import { useEffect, useState } from "react"
import { PROGRAMS } from "@/lib/programs"
import type { ProgramType } from "@/lib/programs"
import { getProgramColor, getProgramName } from "@/lib/applications/utils"

interface TrackBadgeProps {
  programType: ProgramType
  onMove: (program: ProgramType | "other") => void
}

/**
 * Colored track badge. Right-clicking opens a context menu (managed via React
 * state) to move the application to another track.
 */
export function TrackBadge({ programType, onMove }: TrackBadgeProps) {
  const resolvedType = programType || "crypto"
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)

  // Close the menu when clicking anywhere else on the page.
  useEffect(() => {
    if (!menuPosition) return
    const close = () => setMenuPosition(null)
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [menuPosition])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition((prev) => (prev ? null : { top: rect.bottom + 4, left: rect.left }))
  }

  const handleMove = (program: ProgramType | "other") => {
    onMove(program)
    setMenuPosition(null)
  }

  return (
    <div className="relative inline-block">
      <span
        className="px-2 py-1 rounded text-xs font-medium text-white cursor-context-menu"
        style={{ backgroundColor: getProgramColor(resolvedType) }}
        title="Right-click to move to another track"
        onContextMenu={handleContextMenu}
      >
        {getProgramName(resolvedType)}
      </span>

      {menuPosition && (
        <div
          className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onMouseLeave={() => setMenuPosition(null)}
        >
          <div className="px-3 py-1 text-xs text-muted-foreground border-b border-border mb-1">
            Move to:
          </div>
          {Object.values(PROGRAMS)
            .filter((p) => p.id !== programType)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => handleMove(p.id)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2"
              >
                <span>{p.icon}</span>
                {p.shortName}
              </button>
            ))}
          <button
            onClick={() => handleMove("other")}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted"
          >
            Other
          </button>
        </div>
      )}
    </div>
  )
}
