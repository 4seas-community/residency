"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CommentDraft } from "@/lib/applications/types"

interface CommentComposerProps {
  applicationId: string
  saving: boolean
  onSubmit: (applicationId: string, draft: CommentDraft) => Promise<boolean>
  /** Called after a successful submit (e.g. to collapse the composer). */
  onSubmitted?: () => void
  /** "table" renders a compact variant; "card" renders the larger variant. */
  variant?: "table" | "card"
}

/**
 * Self-contained "add comment" form. Owns its draft state and clears it on a
 * successful submit, so parents no longer track per-application draft maps.
 */
export function CommentComposer({
  applicationId,
  saving,
  onSubmit,
  onSubmitted,
  variant = "card",
}: CommentComposerProps) {
  const [draft, setDraft] = useState<CommentDraft>({ reviewer_name: "", comment: "" })
  const isTable = variant === "table"

  const handleSubmit = async () => {
    const success = await onSubmit(applicationId, draft)
    if (success) {
      setDraft({ reviewer_name: "", comment: "" })
      onSubmitted?.()
    }
  }

  return (
    <div className="space-y-2 pt-2 border-t">
      <Input
        value={draft.reviewer_name}
        onChange={(e) => setDraft((d) => ({ ...d, reviewer_name: e.target.value }))}
        placeholder="Your name"
        className={isTable ? "text-xs h-7" : "text-sm"}
      />
      <Textarea
        value={draft.comment}
        onChange={(e) => setDraft((d) => ({ ...d, comment: e.target.value }))}
        placeholder={isTable ? "Comment" : "Add your comment..."}
        rows={2}
        className={isTable ? "text-xs resize-none" : "resize-none text-sm"}
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={saving}
        className={isTable ? "h-6 text-xs" : ""}
      >
        {!isTable && <Plus className="w-4 h-4 mr-1" />}
        Submit
      </Button>
    </div>
  )
}
