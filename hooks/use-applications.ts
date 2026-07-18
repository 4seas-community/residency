"use client"

import { useCallback, useEffect, useState } from "react"
import { withBasePath } from "@/lib/paths"
import type { ProgramType, ApplicationStatus } from "@/lib/programs"
import type { Application, AdminComment, CommentDraft } from "@/lib/applications/types"
import { normalizeApplicationStatus } from "@/lib/applications/utils"

/**
 * Centralizes all reads and writes for the admin applications dashboard.
 * Backed by the server-side API routes (PostgreSQL); components stay
 * presentational and call the returned mutators.
 */
export function useApplications(enabled = true) {
  const [applications, setApplications] = useState<Application[]>([])
  const [comments, setComments] = useState<Record<string, AdminComment[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await fetch(withBasePath("/api/admin/applications"), { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to load applications")
      const data = (await response.json()) as {
        applications: Application[]
        comments: AdminComment[]
      }

      setApplications((data.applications || []).map((application) => ({
        ...application,
        status: normalizeApplicationStatus(application.status),
      })))

      const commentsByApp: Record<string, AdminComment[]> = {}
      ;(data.comments || []).forEach((comment) => {
        if (!commentsByApp[comment.application_id]) {
          commentsByApp[comment.application_id] = []
        }
        commentsByApp[comment.application_id].push(comment)
      })
      setComments(commentsByApp)
    } catch (error) {
      console.error("Error fetching applications:", error)
      setLoadError(error instanceof Error ? error.message : "Unable to load applications")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) fetchApplications()
  }, [enabled, fetchApplications])

  /**
   * Persist a partial update to a single application and optimistically merge
   * the same fields into local state. Used by every field-level mutator below.
   */
  const updateApplicationFields = useCallback(
    async (id: string, fields: Partial<Application>, errorMessage: string) => {
      try {
        const response = await fetch(withBasePath(`/api/admin/applications/${id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        })
        if (!response.ok) throw new Error(errorMessage)

        setApplications((apps) =>
          apps.map((app) => (app.id === id ? { ...app, ...fields } : app)),
        )
      } catch (error) {
        console.error(errorMessage, error)
        alert(errorMessage)
      }
    },
    [],
  )

  const updateStatus = useCallback(
    (id: string, newStatus: ApplicationStatus) =>
      updateApplicationFields(
        id,
        { status: newStatus, reviewed_at: new Date().toISOString(), reviewed_by: "Admin" },
        "Failed to update status",
      ),
    [updateApplicationFields],
  )

  const updateActualStartDate = useCallback(
    (id: string, newDate: string) =>
      updateApplicationFields(
        id,
        { actual_start_date: newDate || null },
        "Failed to update actual start date",
      ),
    [updateApplicationFields],
  )

  const updateProgramType = useCallback(
    (id: string, newProgram: ProgramType | "other") =>
      updateApplicationFields(
        id,
        { program_type: newProgram as ProgramType },
        "Failed to update track",
      ),
    [updateApplicationFields],
  )

  /** Insert a comment for an application. Returns true on success. */
  const addComment = useCallback(async (applicationId: string, draft: CommentDraft) => {
    if (!draft.reviewer_name.trim() || !draft.comment.trim()) {
      alert("Please fill in both reviewer name and comment")
      return false
    }

    setSavingCommentId(applicationId)
    try {
      const response = await fetch(
        withBasePath(`/api/admin/applications/${applicationId}/comments`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewer_name: draft.reviewer_name, comment: draft.comment }),
        },
      )
      if (!response.ok) throw new Error("Failed to add comment")
      const data = (await response.json()) as { comment: AdminComment }

      setComments((prev) => ({
        ...prev,
        [applicationId]: [data.comment, ...(prev[applicationId] || [])],
      }))
      return true
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Failed to add comment")
      return false
    } finally {
      setSavingCommentId(null)
    }
  }, [])

  const deleteComment = useCallback(async (commentId: string, applicationId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(
        withBasePath(`/api/admin/applications/${applicationId}/comments/${commentId}`),
        { method: "DELETE" },
      )
      if (!response.ok) throw new Error("Failed to delete comment")

      setComments((prev) => ({
        ...prev,
        [applicationId]: (prev[applicationId] || []).filter((c) => c.id !== commentId),
      }))
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment")
    }
  }, [])

  return {
    applications,
    comments,
    isLoading,
    loadError,
    savingCommentId,
    fetchApplications,
    updateStatus,
    updateActualStartDate,
    updateProgramType,
    addComment,
    deleteComment,
  }
}
