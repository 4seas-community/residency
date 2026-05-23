"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  CheckCircle,
  Clock,
  Download,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { withBasePath } from "@/lib/paths"
import Link from "next/link"

type StatusType = "pending" | "approved" | "rejected"
type StatusFilter = StatusType | "all"
type SortType = "newest" | "oldest" | "name"
type ViewMode = "card" | "table"

interface Application {
  id: string
  created_at: string
  full_name: string
  email: string
  contact_info: string | null
  nationality: string | null
  preferred_start_date: string
  about_and_contribution: string
  social_links: string
  linkedin_link: string | null
  github_link: string | null
  content_studio_plans: string | null
  status: StatusType | string
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
}

interface AdminComment {
  id: string
  application_id: string
  reviewer_name: string
  comment: string
  created_at: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }
}

function groupComments(comments: AdminComment[]) {
  return comments.reduce<Record<string, AdminComment[]>>((grouped, comment) => {
    if (!grouped[comment.application_id]) {
      grouped[comment.application_id] = []
    }
    grouped[comment.application_id].push(comment)
    return grouped
  }, {})
}

function csvField(value: string | null | undefined) {
  return `"${(value || "").replace(/"/g, '""').replace(/\n/g, " ")}"`
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [comments, setComments] = useState<Record<string, AdminComment[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<SortType>("newest")
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [newCommentData, setNewCommentData] = useState<Record<string, { reviewerName: string; comment: string }>>({})
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null)
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(withBasePath("/api/admin/applications"), { cache: "no-store" })

      if (response.status === 401) {
        router.replace(withBasePath("/admin"))
        return
      }
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(result?.error || "Unable to load applications")
      }

      const result = await response.json() as { applications: Application[]; comments?: AdminComment[] }
      setApplications(result.applications)
      setComments(groupComments(result.comments || []))
      setRowError({})
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    void fetchApplications()
  }, [fetchApplications])

  const updateStatus = async (id: string, newStatus: StatusType) => {
    setSavingStatusId(id)
    setRowError(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      const response = await fetch(withBasePath(`/api/admin/applications/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.status === 401) {
        router.replace(withBasePath("/admin"))
        return
      }
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(result?.error || "Unable to update status")
      }

      const result = await response.json() as { application: Application }
      setApplications(apps => apps.map(app => (app.id === id ? result.application : app)))
    } catch (error) {
      console.error("Error updating status:", error)
      setRowError(prev => ({
        ...prev,
        [id]: error instanceof Error ? error.message : "Update failed",
      }))
    } finally {
      setSavingStatusId(null)
    }
  }

  const addComment = async (applicationId: string) => {
    const commentData = newCommentData[applicationId]
    if (!commentData?.reviewerName.trim() || !commentData.comment.trim()) {
      setRowError(prev => ({
        ...prev,
        [applicationId]: "Please fill in both reviewer name and comment",
      }))
      return
    }

    setSavingCommentId(applicationId)
    setRowError(prev => {
      const next = { ...prev }
      delete next[applicationId]
      return next
    })
    try {
      const response = await fetch(withBasePath(`/api/admin/applications/${applicationId}/comments`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerName: commentData.reviewerName,
          comment: commentData.comment,
        }),
      })

      if (response.status === 401) {
        router.replace(withBasePath("/admin"))
        return
      }
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(result?.error || "Unable to add comment")
      }

      const result = await response.json() as { comment: AdminComment }
      setComments(prev => ({
        ...prev,
        [applicationId]: [result.comment, ...(prev[applicationId] || [])],
      }))
      setNewCommentData(prev => ({
        ...prev,
        [applicationId]: { reviewerName: "", comment: "" },
      }))
      setExpandedComments(prev => ({ ...prev, [applicationId]: false }))
    } catch (error) {
      console.error("Error adding comment:", error)
      setRowError(prev => ({
        ...prev,
        [applicationId]: error instanceof Error ? error.message : "Comment failed",
      }))
    } finally {
      setSavingCommentId(null)
    }
  }

  const deleteComment = async (commentId: string, applicationId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    setRowError(prev => {
      const next = { ...prev }
      delete next[applicationId]
      return next
    })
    try {
      const response = await fetch(withBasePath(`/api/admin/applications/${applicationId}/comments/${commentId}`), {
        method: "DELETE",
      })

      if (response.status === 401) {
        router.replace(withBasePath("/admin"))
        return
      }
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(result?.error || "Unable to delete comment")
      }

      setComments(prev => ({
        ...prev,
        [applicationId]: (prev[applicationId] || []).filter(comment => comment.id !== commentId),
      }))
    } catch (error) {
      console.error("Error deleting comment:", error)
      setRowError(prev => ({
        ...prev,
        [applicationId]: error instanceof Error ? error.message : "Delete failed",
      }))
    }
  }

  const handleLogout = async () => {
    await fetch(withBasePath("/api/admin/logout"), { method: "POST" })
    router.push(withBasePath("/admin"))
  }

  const exportToCSV = () => {
    if (applications.length === 0) return

    const headers = [
      "ID",
      "Submitted At",
      "Full Name",
      "Email",
      "Contact Info",
      "Nationality",
      "Preferred Start Date",
      "About & Contribution",
      "Social Links",
      "LinkedIn",
      "GitHub",
      "Content Studio Plans",
      "Status",
      "Comments",
    ]

    const csvContent = [
      headers.join(","),
      ...applications.map(app => {
        const appComments = comments[app.id] || []
        const commentText = appComments
          .map(comment => `[${comment.reviewer_name} - ${new Date(comment.created_at).toLocaleString()}]: ${comment.comment}`)
          .join(" | ")

        return [
          app.id,
          new Date(app.created_at).toLocaleString(),
          csvField(app.full_name),
          app.email,
          csvField(app.contact_info),
          csvField(app.nationality),
          app.preferred_start_date,
          csvField(app.about_and_contribution),
          csvField(app.social_links),
          csvField(app.linkedin_link),
          csvField(app.github_link),
          csvField(app.content_studio_plans),
          app.status,
          csvField(commentText),
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `4seas-applications-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  if (!isAuthenticated) {
    return null
  }

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredApps = applications.filter(app => (
    (statusFilter === "all" || app.status === statusFilter) &&
    (
      normalizedSearch === "" ||
      app.full_name.toLowerCase().includes(normalizedSearch) ||
      app.email.toLowerCase().includes(normalizedSearch) ||
      (app.contact_info || "").toLowerCase().includes(normalizedSearch) ||
      (app.nationality || "").toLowerCase().includes(normalizedSearch) ||
      app.preferred_start_date.toLowerCase().includes(normalizedSearch)
    )
  ))

  const sortedApps = [...filteredApps].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "name":
        return a.full_name.localeCompare(b.full_name)
      default:
        return 0
    }
  })

  const pendingCount = applications.filter(app => app.status === "pending").length
  const approvedCount = applications.filter(app => app.status === "approved").length
  const rejectedCount = applications.filter(app => app.status === "rejected").length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={withBasePath("/")}>
              <img src={withBasePath("/images/4seas-logo.png")} alt="4Seas" className="h-8 w-auto" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="font-medium text-foreground">Applications Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchApplications} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={applications.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter("pending")}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              statusFilter === "pending" ? "border-yellow-500 bg-yellow-50" : "border-yellow-200 bg-white hover:border-yellow-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter("approved")}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              statusFilter === "approved" ? "border-green-500 bg-green-50" : "border-green-200 bg-white hover:border-green-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-foreground">{approvedCount}</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter("rejected")}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              statusFilter === "rejected" ? "border-red-500 bg-red-50" : "border-red-200 bg-white hover:border-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-foreground">{rejectedCount}</p>
              </div>
            </div>
          </motion.button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, contact, or date..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-primary text-white" : ""}
            >
              View All ({applications.length})
            </Button>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortType)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "card" ? "default" : "outline"}
                  onClick={() => setViewMode("card")}
                >
                  Card View
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "table" ? "default" : "outline"}
                  onClick={() => setViewMode("table")}
                >
                  Table View
                </Button>
              </div>
            </div>
          </div>

          {searchQuery && (
            <div className="text-sm text-muted-foreground">
              Found {sortedApps.length} matching results out of {applications.length} applications
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading applications...</p>
          </div>
        ) : sortedApps.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No applications found.</p>
          </div>
        ) : (
          <>
            {viewMode === "table" && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b">
                      <tr>
                        <th className="px-3 py-3 text-left font-semibold min-w-[120px]">Name</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[180px]">Email</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[100px]">Contact</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[120px]">Nationality</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[100px]">Start Date</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[200px]">About</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[180px]">Social Links</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[120px]">LinkedIn</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[120px]">GitHub</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[150px]">Content Studio</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[180px]">Status</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[100px]">Comments</th>
                        <th className="px-3 py-3 text-left font-semibold min-w-[100px]">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedApps.map(app => {
                        const appComments = comments[app.id] || []

                        return (
                          <tr key={app.id} className="border-b hover:bg-muted/30 align-top">
                            <td className="px-3 py-4 font-medium">{app.full_name}</td>
                            <td className="px-3 py-4 text-xs break-all">{app.email}</td>
                            <td className="px-3 py-4 text-xs">{app.contact_info || "-"}</td>
                            <td className="px-3 py-4 text-xs">{app.nationality || "-"}</td>
                            <td className="px-3 py-4 text-xs">{app.preferred_start_date}</td>
                            <td className="px-3 py-4">
                              <p className="text-xs whitespace-pre-wrap max-h-[120px] overflow-y-auto">{app.about_and_contribution}</p>
                            </td>
                            <td className="px-3 py-4">
                              <p className="text-xs whitespace-pre-wrap max-h-[80px] overflow-y-auto">{app.social_links || "-"}</p>
                            </td>
                            <td className="px-3 py-4 text-xs">
                              {app.linkedin_link ? (
                                <a
                                  href={app.linkedin_link.startsWith("http") ? app.linkedin_link : `https://${app.linkedin_link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline break-all"
                                >
                                  {app.linkedin_link}
                                </a>
                              ) : "-"}
                            </td>
                            <td className="px-3 py-4 text-xs">
                              {app.github_link ? (
                                <a
                                  href={app.github_link.startsWith("http") ? app.github_link : `https://${app.github_link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline break-all"
                                >
                                  {app.github_link}
                                </a>
                              ) : "-"}
                            </td>
                            <td className="px-3 py-4">
                              <p className="text-xs whitespace-pre-wrap max-h-[80px] overflow-y-auto">{app.content_studio_plans || "-"}</p>
                            </td>
                            <td className="px-3 py-4">
                              <div className="space-y-2">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => updateStatus(app.id, "pending")}
                                    disabled={savingStatusId === app.id}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${app.status === "pending" ? "bg-yellow-100 border-yellow-300 text-yellow-800" : "border-border hover:bg-muted"}`}
                                  >
                                    Pending
                                  </button>
                                  <button
                                    onClick={() => updateStatus(app.id, "approved")}
                                    disabled={savingStatusId === app.id}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${app.status === "approved" ? "bg-green-100 border-green-300 text-green-800" : "border-border hover:bg-muted"}`}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => updateStatus(app.id, "rejected")}
                                    disabled={savingStatusId === app.id}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${app.status === "rejected" ? "bg-red-100 border-red-300 text-red-800" : "border-border hover:bg-muted"}`}
                                  >
                                    Reject
                                  </button>
                                </div>
                                {app.reviewed_at && (
                                  <p className="text-[10px] text-muted-foreground">
                                    Updated: {new Date(app.reviewed_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <CommentControls
                                applicationId={app.id}
                                comments={appComments}
                                expanded={expandedComments[app.id] || false}
                                newComment={newCommentData[app.id] || { reviewerName: "", comment: "" }}
                                saving={savingCommentId === app.id}
                                error={rowError[app.id]}
                                compact
                                onToggle={() => setExpandedComments(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                                onChange={(value) => setNewCommentData(prev => ({ ...prev, [app.id]: value }))}
                                onAdd={() => addComment(app.id)}
                                onDelete={(commentId) => deleteComment(commentId, app.id)}
                              />
                            </td>
                            <td className="px-3 py-4 text-xs">
                              {new Date(app.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === "card" && (
              <div className="space-y-4">
                {sortedApps.map((app, index) => (
                  <motion.div
                    key={app.id}
                    className="bg-card border border-border rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{app.full_name}</h3>
                        <p className="text-muted-foreground text-sm">{app.email}</p>
                      </div>
                      <div className="text-right">
                        <select
                          value={app.status}
                          onChange={(event) => updateStatus(app.id, event.target.value as StatusType)}
                          disabled={savingStatusId === app.id}
                          className={`text-sm px-3 py-1 rounded border ${getStatusColor(app.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        {app.reviewed_at && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Updated: {new Date(app.reviewed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Contact Info</p>
                        <p className="text-foreground font-medium">{app.contact_info || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Nationality</p>
                        <p className="text-foreground font-medium">{app.nationality || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="text-foreground font-medium">{app.preferred_start_date}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">About & Contribution</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded p-3">{app.about_and_contribution}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Social Links</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded p-3">{app.social_links}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {app.linkedin_link && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">LinkedIn</p>
                            <a
                              href={app.linkedin_link.startsWith("http") ? app.linkedin_link : `https://${app.linkedin_link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              {app.linkedin_link}
                            </a>
                          </div>
                        )}
                        {app.github_link && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">GitHub</p>
                            <a
                              href={app.github_link.startsWith("http") ? app.github_link : `https://${app.github_link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              {app.github_link}
                            </a>
                          </div>
                        )}
                      </div>

                      {app.content_studio_plans && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Content Studio Plans</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded p-3">{app.content_studio_plans}</p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <CommentControls
                          applicationId={app.id}
                          comments={comments[app.id] || []}
                          expanded={expandedComments[app.id] || false}
                          newComment={newCommentData[app.id] || { reviewerName: "", comment: "" }}
                          saving={savingCommentId === app.id}
                          error={rowError[app.id]}
                          onToggle={() => setExpandedComments(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                          onChange={(value) => setNewCommentData(prev => ({ ...prev, [app.id]: value }))}
                          onAdd={() => addComment(app.id)}
                          onDelete={(commentId) => deleteComment(commentId, app.id)}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function CommentControls({
  applicationId,
  comments,
  compact = false,
  expanded,
  newComment,
  saving,
  error,
  onToggle,
  onChange,
  onAdd,
  onDelete,
}: {
  applicationId: string
  comments: AdminComment[]
  compact?: boolean
  expanded: boolean
  newComment: { reviewerName: string; comment: string }
  saving: boolean
  error: string | undefined
  onToggle: () => void
  onChange: (value: { reviewerName: string; comment: string }) => void
  onAdd: () => void
  onDelete: (commentId: string) => void
}) {
  return (
    <div className={compact ? "space-y-1" : "space-y-3"}>
      <h4 className={compact ? "sr-only" : "font-medium"}>Comments ({comments.length})</h4>
      <span className="text-xs bg-muted rounded px-2 py-1 inline-block">
        {comments.length} comments
      </span>

      {comments.length > 0 && (
        <div className={`${compact ? "max-h-[80px]" : "max-h-64"} overflow-y-auto space-y-1`}>
          {comments.slice(0, compact ? 2 : comments.length).map(comment => (
            <div key={comment.id} className={compact ? "text-[10px] bg-muted/50 rounded p-1" : "bg-background rounded p-3 text-sm"}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium">{comment.reviewer_name}</span>
                {!compact && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-destructive hover:text-destructive/80"
                    aria-label={`Delete comment for ${applicationId}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {!compact && (
                <p className="text-xs text-muted-foreground mb-1">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              )}
              <p className="whitespace-pre-wrap">
                {compact && comment.comment.length > 50 ? `${comment.comment.slice(0, 50)}...` : comment.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onToggle}
        className={compact ? "text-[10px] text-primary hover:underline" : "text-sm text-primary hover:underline"}
      >
        {expanded ? (compact ? "Close" : "Cancel") : (compact ? "Add/View" : "Add Comment")}
      </button>

      {expanded && (
        <div className="space-y-2 pt-2 border-t">
          <Input
            value={newComment.reviewerName}
            onChange={(event) => onChange({ ...newComment, reviewerName: event.target.value })}
            placeholder={compact ? "Name" : "Your name"}
            className={compact ? "text-xs h-7" : "text-sm"}
          />
          <Textarea
            value={newComment.comment}
            onChange={(event) => onChange({ ...newComment, comment: event.target.value })}
            placeholder={compact ? "Comment" : "Add your comment..."}
            rows={compact ? 2 : 3}
            className={compact ? "text-xs resize-none" : "resize-none text-sm"}
          />
          <Button
            size="sm"
            onClick={onAdd}
            disabled={saving}
            className={compact ? "h-6 text-xs" : ""}
          >
            {!compact && <Plus className="w-4 h-4 mr-1" />}
            {saving ? "Saving..." : "Submit"}
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  )
}
