import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("admin applications page keeps the dashboard controls", async () => {
  const source = await readFile(new URL("../app/admin/applications/page.tsx", import.meta.url), "utf8")

  assert.match(source, /const \[searchQuery, setSearchQuery\] = useState\(""\)/)
  assert.match(source, /const \[viewMode, setViewMode\] = useState<"card" \| "table">\("table"\)/)
  assert.match(source, /const \[statusFilter, setStatusFilter\] = useState<StatusFilter>\("all"\)/)
  assert.match(source, /const \[sortBy, setSortBy\] = useState<SortType>\("newest"\)/)
  assert.match(source, /Type any part of a name, email, or contact\.\.\./)
  assert.match(source, /STATUS_GROUPS/)
  assert.match(source, /applicationsPerPage = 20/)
  assert.match(source, /Applications could not be loaded/)
  assert.match(source, /Newest First/)
})

test("filtering, sorting and CSV export live in lib/applications/utils", async () => {
  const pageSource = await readFile(new URL("../app/admin/applications/page.tsx", import.meta.url), "utf8")
  const utilsSource = await readFile(new URL("../lib/applications/utils.ts", import.meta.url), "utf8")

  assert.match(pageSource, /const visibleApps = sortApplications\(\s*filterApplications\(applications, \{/)
  assert.match(pageSource, /buildApplicationsCsv\(visibleApps, comments\)/)
  assert.match(utilsSource, /export function filterApplications/)
  assert.match(utilsSource, /export function sortApplications/)
  assert.match(utilsSource, /export function buildApplicationsCsv/)
  assert.match(utilsSource, /export function downloadCsv/)
})

test("admin application backend supports comment storage", async () => {
  const dbSource = await readFile(new URL("../lib/applications/db.ts", import.meta.url), "utf8")
  const listRouteSource = await readFile(new URL("../app/api/admin/applications/route.ts", import.meta.url), "utf8")
  const commentRouteSource = await readFile(new URL("../app/api/admin/applications/[id]/comments/route.ts", import.meta.url), "utf8")
  const deleteRouteSource = await readFile(new URL("../app/api/admin/applications/[id]/comments/[commentId]/route.ts", import.meta.url), "utf8")

  assert.match(dbSource, /create table if not exists admin_comments/)
  assert.match(dbSource, /application_id uuid not null references residency_applications\(id\) on delete cascade/)
  assert.match(dbSource, /export async function listAdminComments/)
  assert.match(dbSource, /export async function createAdminComment/)
  assert.match(dbSource, /export async function deleteAdminComment/)
  assert.match(listRouteSource, /listAdminComments/)
  assert.match(listRouteSource, /return NextResponse\.json\(\{ applications, comments \}\)/)
  assert.match(commentRouteSource, /export async function POST/)
  assert.match(deleteRouteSource, /export async function DELETE/)
})

test("dashboard data access goes through the use-applications hook", async () => {
  const hookSource = await readFile(new URL("../hooks/use-applications.ts", import.meta.url), "utf8")

  assert.match(hookSource, /fetch\(withBasePath\("\/api\/admin\/applications"\)/)
  assert.match(hookSource, /withBasePath\(`\/api\/admin\/applications\/\$\{id\}`\)/)
  assert.match(hookSource, /withBasePath\(`\/api\/admin\/applications\/\$\{applicationId\}\/comments`\)/)
  assert.match(hookSource, /withBasePath\(\s*`\/api\/admin\/applications\/\$\{applicationId\}\/comments\/\$\{commentId\}`/)
})
