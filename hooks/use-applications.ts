"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ProgramType, ApplicationStatus } from "@/lib/programs"
import type { Application, AdminComment, CommentDraft } from "@/lib/applications/types"

/**
 * Centralizes all Supabase reads and writes for the admin applications dashboard.
 * Components stay presentational and call the returned mutators.
 */
export function useApplications(enabled = true) {
  const [applications, setApplications] = useState<Application[]>([])
  const [comments, setComments] = useState<Record<string, AdminComment[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("admin_comments")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const commentsByApp: Record<string, AdminComment[]> = {}
      data?.forEach((comment) => {
        if (!commentsByApp[comment.application_id]) {
          commentsByApp[comment.application_id] = []
        }
        commentsByApp[comment.application_id].push(comment)
      })
      setComments(commentsByApp)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }, [])

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("residency_applications")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setApplications(data || [])
      await fetchComments()
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchComments])

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
        const supabase = createClient()
        const { error } = await supabase
          .from("residency_applications")
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq("id", id)

        if (error) throw error

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
      const supabase = createClient()
      const { data: insertedComment, error } = await supabase
        .from("admin_comments")
        .insert({
          application_id: applicationId,
          reviewer_name: draft.reviewer_name,
          comment: draft.comment,
        })
        .select()

      if (error) throw error

      setComments((prev) => ({
        ...prev,
        [applicationId]: [insertedComment[0], ...(prev[applicationId] || [])],
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
      const supabase = createClient()
      const { error } = await supabase.from("admin_comments").delete().eq("id", commentId)

      if (error) throw error

      setComments((prev) => ({
        ...prev,
        [applicationId]: prev[applicationId].filter((c) => c.id !== commentId),
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
    savingCommentId,
    fetchApplications,
    updateStatus,
    updateActualStartDate,
    updateProgramType,
    addComment,
    deleteComment,
  }
}
