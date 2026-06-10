"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Download, LogOut, RefreshCw, Users, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { PROGRAMS, getStatusConfig, type ApplicationStatus } from "@/lib/programs"
import type {
  ColumnSort,
  ColumnSortKey,
  ProgramFilter,
  SortType,
  StatusFilter,
} from "@/lib/applications/types"
import {
  buildApplicationsCsv,
  downloadCsv,
  filterApplications,
  sortApplications,
  getCountByProgram,
  getStatusCount,
} from "@/lib/applications/utils"
import { useApplications } from "@/hooks/use-applications"
import { ApplicationsTable } from "@/components/admin/applications-table"
import { ApplicationCard } from "@/components/admin/application-card"

const STATUS_CARDS: ApplicationStatus[] = [
  "new",
  "shortlisted",
  "interview_needed",
  "accepted",
  "rejected",
  "reviewing",
]

export default function AdminApplicationsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Guard the dashboard behind the session flag set on the login page.
  useEffect(() => {
    if (sessionStorage.getItem("admin_authenticated") !== "true") {
      router.push("/admin")
      return
    }
    setIsAuthenticated(true)
  }, [router])

  const {
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
  } = useApplications(isAuthenticated)

  // View + filter state
  const [viewMode, setViewMode] = useState<"card" | "table">("table")
  const [programFilter, setProgramFilter] = useState<ProgramFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<SortType>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [startDateFrom, setStartDateFrom] = useState("")
  const [startDateTo, setStartDateTo] = useState("")
  const [columnSort, setColumnSort] = useState<ColumnSort>({ key: null, direction: "asc" })
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated")
    router.push("/admin")
  }

  const handleColumnSort = (key: ColumnSortKey) => {
    setColumnSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    )
  }

  const toggleComments = (id: string) =>
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }))

  const visibleApps = sortApplications(
    filterApplications(applications, {
      programFilter,
      statusFilter,
      startDateFrom,
      startDateTo,
      searchQuery,
    }),
    columnSort,
    sortBy,
  )

  const handleExportCsv = () => {
    if (visibleApps.length === 0) return
    const csv = buildApplicationsCsv(visibleApps, comments)
    downloadCsv(csv, `4seas-applications-${programFilter}-${new Date().toISOString().split("T")[0]}.csv`)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <img src="/images/4seas-logo.png" alt="4Seas" className="h-8 w-auto" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="font-medium text-foreground">Applications Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchApplications} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={visibleApps.length === 0}
            >
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

      <main className="max-w-full mx-auto px-4 py-6">
        {/* Program Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={programFilter === "all" ? "default" : "outline"}
            onClick={() => setProgramFilter("all")}
            className="whitespace-nowrap"
          >
            All Tracks ({getCountByProgram(applications, "all")})
          </Button>
          {Object.values(PROGRAMS).map((program) => (
            <Button
              key={program.id}
              variant={programFilter === program.id ? "default" : "outline"}
              onClick={() => setProgramFilter(program.id)}
              className="whitespace-nowrap gap-2"
              style={
                programFilter === program.id
                  ? { backgroundColor: program.color }
                  : { borderColor: program.color, color: program.color }
              }
            >
              <span>{program.icon}</span>
              {program.shortName} ({getCountByProgram(applications, program.id)})
            </Button>
          ))}
          <Button
            variant={programFilter === "other" ? "default" : "outline"}
            onClick={() => setProgramFilter("other")}
            className="whitespace-nowrap"
          >
            Other ({getCountByProgram(applications, "other")})
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {STATUS_CARDS.map((status) => {
            const config = getStatusConfig(status)
            const count = getStatusCount(applications, programFilter, status)
            return (
              <motion.button
                key={status}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                className={`p-3 rounded-lg border transition-all text-left ${
                  statusFilter === status
                    ? `${config.bgColor} border-current ${config.color}`
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1">{config.label}</p>
                <p className="text-xl font-bold">{count}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, telegram, whatsapp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatusFilter("all")
                setStartDateFrom("")
                setStartDateTo("")
              }}
            >
              Clear Filters
            </Button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Start Date:</span>
              <input
                type="date"
                value={startDateFrom}
                onChange={(e) => setStartDateFrom(e.target.value)}
                className="px-2 py-1 border border-border rounded bg-background text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={startDateTo}
                onChange={(e) => setStartDateTo(e.target.value)}
                className="px-2 py-1 border border-border rounded bg-background text-sm"
              />
            </div>

            <div className="flex gap-2 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>

              <Button
                size="sm"
                variant={viewMode === "card" ? "default" : "outline"}
                onClick={() => setViewMode("card")}
              >
                Card
              </Button>
              <Button
                size="sm"
                variant={viewMode === "table" ? "default" : "outline"}
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
            </div>
          </div>

          {/* Results Info */}
          <div className="text-sm text-muted-foreground">
            Showing {visibleApps.length} of {applications.length} applications
            {programFilter !== "all" && programFilter !== "other" && ` in ${PROGRAMS[programFilter].name}`}
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading applications...</p>
          </div>
        ) : visibleApps.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No applications found.</p>
          </div>
        ) : viewMode === "table" ? (
          <ApplicationsTable
            applications={visibleApps}
            comments={comments}
            columnSort={columnSort}
            onColumnSort={handleColumnSort}
            expandedComments={expandedComments}
            onToggleComments={toggleComments}
            savingCommentId={savingCommentId}
            onUpdateStatus={updateStatus}
            onUpdateProgramType={updateProgramType}
            onUpdateActualStartDate={updateActualStartDate}
            onAddComment={addComment}
          />
        ) : (
          <div className="space-y-4">
            {visibleApps.map((app, index) => (
              <ApplicationCard
                key={app.id}
                app={app}
                index={index}
                comments={comments[app.id] || []}
                expanded={!!expandedComments[app.id]}
                onToggleComments={toggleComments}
                savingCommentId={savingCommentId}
                onUpdateStatus={updateStatus}
                onUpdateProgramType={updateProgramType}
                onUpdateActualStartDate={updateActualStartDate}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
