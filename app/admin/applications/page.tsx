"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Download, LogOut, RefreshCw, Users, Calendar, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { withBasePath } from "@/lib/paths"
import Link from "next/link"

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
  status: string
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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

      const result = await response.json() as { applications: Application[] }
      setApplications(result.applications)
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
      "Preferred Start Date",
      "About & Contribution",
      "Social Links",
      "LinkedIn",
      "GitHub",
      "Content Studio Plans",
      "Status"
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
        app.status
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-semibold text-foreground">{applications.length}</p>
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
                <p className="text-2xl font-semibold text-foreground">
                  {applications.filter(app => {
                    const date = new Date(app.created_at)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-semibold text-foreground">
                  {applications.filter(app => app.status === "pending").length}
                </p>
              </div>
            </div>
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
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => (
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
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === "pending" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : app.status === "approved" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {app.status}
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
