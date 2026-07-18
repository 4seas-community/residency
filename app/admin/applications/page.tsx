"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Download, LogOut, RefreshCw, Users, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { PROGRAMS, STATUS_CONFIG, STATUS_GROUPS, type ApplicationStatus } from "@/lib/programs"
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
  getGroupCount,
  getStatusCount,
} from "@/lib/applications/utils"
import { withBasePath } from "@/lib/paths"
import { useApplications } from "@/hooks/use-applications"
import { ApplicationsTable } from "@/components/admin/applications-table"
import { ApplicationCard } from "@/components/admin/application-card"

export default function AdminApplicationsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Guard the dashboard behind the server-side admin session cookie.
  useEffect(() => {
    let cancelled = false
    async function checkSession() {
      try {
        const response = await fetch(withBasePath("/api/admin/session"), { cache: "no-store" })
        if (!response.ok) {
          if (!cancelled) router.replace("/admin")
          return
        }
        if (!cancelled) setIsAuthenticated(true)
      } catch {
        if (!cancelled) router.replace("/admin")
      }
    }
    void checkSession()
    return () => {
      cancelled = true
    }
  }, [router])

  const {
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
  const [currentPage, setCurrentPage] = useState(1)
  const applicationsPerPage = 20

  const handleLogout = async () => {
    try {
      await fetch(withBasePath("/api/admin/logout"), { method: "POST" })
    } catch {
      // ignore network errors during logout
    }
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

  const totalPages = Math.max(1, Math.ceil(visibleApps.length / applicationsPerPage))
  const pageStart = (currentPage - 1) * applicationsPerPage
  const paginatedApps = visibleApps.slice(pageStart, pageStart + applicationsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [programFilter, statusFilter, searchQuery, startDateFrom, startDateTo, sortBy, columnSort])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

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
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(Object.entries(STATUS_GROUPS) as [keyof typeof STATUS_GROUPS, typeof STATUS_GROUPS[keyof typeof STATUS_GROUPS]][]).map(([groupKey, group]) => {
            const count = getGroupCount(applications, programFilter, groupKey)
            const active = Array.isArray(statusFilter)
              ? statusFilter.join() === group.statuses.join()
              : group.statuses.includes(statusFilter as ApplicationStatus)
            const styles = {
              new: ["border-blue-200", "bg-blue-50", "bg-blue-500"],
              in_progress: ["border-orange-200", "bg-orange-50", "bg-orange-500"],
              accepted: ["border-green-200", "bg-green-50", "bg-green-500"],
              rejected: ["border-red-200", "bg-red-50", "bg-red-500"],
            }[groupKey]
            return (
              <div key={groupKey} className={`overflow-hidden rounded-xl border-2 ${active ? `${styles[0]} ${styles[1]}` : "border-border bg-card"}`}>
                <motion.button whileTap={{ scale: 0.995 }} onClick={() => setStatusFilter(active ? "all" : group.statuses)} className="flex w-full items-start justify-between px-4 pb-2 pt-3 text-left">
                  <div><p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{group.label}</p><p className="text-3xl font-bold leading-none tabular-nums">{count}</p></div>
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${styles[2]}`} />
                </motion.button>
                <div className="divide-y divide-border/30 border-t border-border/50">
                  {group.statuses.map((status) => {
                    const config = STATUS_CONFIG[status]
                    return <button key={status} onClick={() => setStatusFilter(statusFilter === status ? "all" : status)} className={`flex w-full items-center justify-between px-4 py-2 text-left text-xs ${statusFilter === status ? `${config.bgColor} ${config.color} font-semibold` : "text-muted-foreground hover:bg-muted/60"}`}><span>{config.label}</span><span className="text-sm font-semibold tabular-nums text-foreground">{getStatusCount(applications, programFilter, status)}</span></button>
                  })}
                </div>
              </div>
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
              placeholder="Type any part of a name, email, or contact..."
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
            {visibleApps.length > 0 ? `Showing ${pageStart + 1}–${Math.min(pageStart + applicationsPerPage, visibleApps.length)} of ${visibleApps.length} matching applications` : "Showing 0 matching applications"}
            {programFilter !== "all" && programFilter !== "other" && ` in ${PROGRAMS[programFilter].name}`}
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading applications...</p>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"><p className="font-medium text-destructive">Applications could not be loaded.</p><p className="mt-2 text-sm text-muted-foreground">{loadError}</p><Button className="mt-4" variant="outline" onClick={fetchApplications}>Try again</Button></div>
        ) : visibleApps.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No applications found.</p>
          </div>
        ) : viewMode === "table" ? (
          <ApplicationsTable
            applications={paginatedApps}
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
            {paginatedApps.map((app, index) => (
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
        {!isLoading && !loadError && visibleApps.length > 0 && (
          <nav className="mt-6 flex items-center justify-between border-t border-border pt-4"><p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}><ChevronLeft className="mr-1 h-4 w-4" />Previous</Button><Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>Next<ChevronRight className="ml-1 h-4 w-4" /></Button></div></nav>
        )}
      </main>
    </div>
  )
}
