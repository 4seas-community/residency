"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  LogOut,
  RefreshCw,
  Save,
  Search,
  Users,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { withBasePath } from "@/lib/paths"
import Link from "next/link"

type StatusType = "pending" | "approved" | "rejected"
type StatusFilter = StatusType | "all"

interface Application {
  id: string
  created_at: string
  full_name: string
  email: string
  contact_info: string | null
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

const getStatusLabel = (status: string) => {
  switch (status) {
    case "approved":
      return "Approved"
    case "rejected":
      return "Rejected"
    default:
      return "Pending"
  }
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const router = useRouter()

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(withBasePath("/api/admin/applications"), { cache: "no-store" })

      if (response.status === 401) {
        router.replace("/admin")
        return
      }
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(result?.error || "Unable to load applications")
      }

      const result = await response.json() as { applications: Application[] }
      setApplications(result.applications)
      setIsAuthenticated(true)

      const notes: Record<string, string> = {}
      result.applications.forEach(app => {
        notes[app.id] = app.admin_notes || ""
      })
      setEditingNotes(notes)
      setRowError({})
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    void fetchApplications()
  }, [fetchApplications])

  const mergeUpdate = (updated: Application) => {
    setApplications(apps => apps.map(app => (app.id === updated.id ? updated : app)))
    setEditingNotes(prev => ({ ...prev, [updated.id]: updated.admin_notes || "" }))
  }

  const sendReviewUpdate = async (id: string, body: { status?: StatusType; adminNotes?: string }) => {
    setSavingId(id)
    setRowError(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      const response = await fetch(withBasePath(`/api/admin/applications/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.status === 401) {
        router.replace("/admin")
        return
      }
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(result?.error || "Unable to update application")
      }

      const result = await response.json() as { application: Application }
      mergeUpdate(result.application)
    } catch (error) {
      console.error("Error updating application:", error)
      setRowError(prev => ({
        ...prev,
        [id]: error instanceof Error ? error.message : "Update failed",
      }))
    } finally {
      setSavingId(null)
    }
  }

  const updateStatus = (id: string, newStatus: StatusType) =>
    sendReviewUpdate(id, { status: newStatus })

  const saveNotes = (id: string) =>
    sendReviewUpdate(id, { adminNotes: editingNotes[id] ?? "" })

  const handleLogout = async () => {
    await fetch(withBasePath("/api/admin/logout"), { method: "POST" })
    router.push("/admin")
  }

  const exportToCSV = () => {
    if (applications.length === 0) return

    const headers = [
      "ID",
      "Submitted At",
      "Full Name",
      "Email",
      "Contact Info",
      "Preferred Start Date",
      "About & Contribution",
      "Social Links",
      "LinkedIn",
      "GitHub",
      "Content Studio Plans",
      "Status",
      "Admin Notes",
      "Reviewed By",
      "Reviewed At",
    ]

    const csvContent = [
      headers.join(","),
      ...applications.map(app => [
        app.id,
        new Date(app.created_at).toLocaleString(),
        `"${app.full_name.replace(/"/g, '""')}"`,
        app.email,
        `"${(app.contact_info || '').replace(/"/g, '""')}"`,
        app.preferred_start_date,
        `"${app.about_and_contribution.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${app.social_links.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${(app.linkedin_link || '').replace(/"/g, '""')}"`,
        `"${(app.github_link || '').replace(/"/g, '""')}"`,
        `"${(app.content_studio_plans || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        app.status,
        `"${(app.admin_notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        app.reviewed_by || '',
        app.reviewed_at ? new Date(app.reviewed_at).toLocaleString() : '',
      ].join(","))
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

  const pendingCount = applications.filter(app => app.status === "pending").length
  const approvedCount = applications.filter(app => app.status === "approved").length
  const rejectedCount = applications.filter(app => app.status === "rejected").length
  const thisMonthCount = applications.filter(app => {
    const date = new Date(app.created_at)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredApplications = applications.filter(app => {
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    const searchHaystack = [
      app.full_name,
      app.email,
      app.contact_info,
      app.preferred_start_date,
      app.about_and_contribution,
      app.social_links,
      app.linkedin_link,
      app.github_link,
      app.content_studio_plans,
      app.status,
      app.admin_notes,
      app.reviewed_by,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return searchHaystack.includes(normalizedSearch)
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
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

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold text-foreground">{applications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-semibold text-foreground">{approvedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-semibold text-foreground">{rejectedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-semibold text-foreground">{thisMonthCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, email, contact, links, or notes"
              className="pl-9"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm text-muted-foreground">
              Showing {filteredApplications.length} of {applications.length}
            </span>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Review status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No applications yet.</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No applications match the current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app.id}
                className="bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{app.full_name}</h3>
                    <p className="text-muted-foreground">{app.email}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 text-sm">
                  {app.contact_info && (
                    <div>
                      <p className="text-muted-foreground">Contact Info</p>
                      <p className="text-foreground font-medium">{app.contact_info}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Preferred Start Date</p>
                    <p className="text-foreground font-medium">{app.preferred_start_date}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">About & Contribution</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-3">
                      {app.about_and_contribution}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Social Links</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-3">
                      {app.social_links}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {app.linkedin_link && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">LinkedIn</p>
                        <a
                          href={app.linkedin_link.startsWith('http') ? app.linkedin_link : `https://${app.linkedin_link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline bg-muted/50 rounded-lg p-3 block"
                        >
                          {app.linkedin_link}
                        </a>
                      </div>
                    )}
                    {app.github_link && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">GitHub</p>
                        <a
                          href={app.github_link.startsWith('http') ? app.github_link : `https://${app.github_link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline bg-muted/50 rounded-lg p-3 block"
                        >
                          {app.github_link}
                        </a>
                      </div>
                    )}
                  </div>
                  {app.content_studio_plans && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Content Studio Plans</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-3">
                        {app.content_studio_plans}
                      </p>
                    </div>
                  )}
                </div>

                {/* Admin Review Section */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground mb-4">Admin Review</h4>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      size="sm"
                      variant={app.status === "pending" ? "default" : "outline"}
                      onClick={() => updateStatus(app.id, "pending")}
                      disabled={savingId === app.id}
                      className={app.status === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant={app.status === "approved" ? "default" : "outline"}
                      onClick={() => updateStatus(app.id, "approved")}
                      disabled={savingId === app.id}
                      className={app.status === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant={app.status === "rejected" ? "default" : "outline"}
                      onClick={() => updateStatus(app.id, "rejected")}
                      disabled={savingId === app.id}
                      className={app.status === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Admin Notes (evaluation, research results, rejection reasons, etc.)
                    </label>
                    <Textarea
                      value={editingNotes[app.id] ?? ""}
                      onChange={(e) => setEditingNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                      placeholder="Add your notes here..."
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveNotes(app.id)}
                        disabled={savingId === app.id}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {savingId === app.id ? "Saving..." : "Save Notes"}
                      </Button>
                      {app.reviewed_by && app.reviewed_at && (
                        <p className="text-xs text-muted-foreground">
                          Last reviewed by {app.reviewed_by} on {new Date(app.reviewed_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {rowError[app.id] && (
                      <p className="text-xs text-destructive">{rowError[app.id]}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
