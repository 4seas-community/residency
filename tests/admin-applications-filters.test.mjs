import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("admin applications page matches the issue 10 package dashboard controls", async () => {
  const source = await readFile(new URL("../app/admin/applications/page.tsx", import.meta.url), "utf8")

  assert.match(source, /const \[searchQuery, setSearchQuery\] = useState\(""\)/)
  assert.match(source, /const \[viewMode, setViewMode\] = useState<ViewMode>\("table"\)/)
  assert.match(source, /const \[statusFilter, setStatusFilter\] = useState<StatusFilter>\("all"\)/)
  assert.match(source, /const \[sortBy, setSortBy\] = useState<SortType>\("newest"\)/)
  assert.match(source, /const filteredApps = applications\.filter/)
  assert.match(source, /normalizedSearch/)
  assert.match(source, /const sortedApps = \[\.\.\.filteredApps\]\.sort/)
  assert.match(source, /sortedApps\.map/)
  assert.match(source, /Search by name, email, contact, or date\.\.\./)
  assert.match(source, /View All \(\{applications\.length\}\)/)
  assert.match(source, /Newest First/)
  assert.match(source, /Card View/)
  assert.match(source, /Table View/)
  assert.match(source, /Comments \(\{comments\.length\}\)/)
  assert.match(source, /\/api\/admin\/applications\/\$\{applicationId\}\/comments/)
  assert.match(source, /value="approved"/)
  assert.match(source, /value="rejected"/)
})

test("admin application backend supports comment storage", async () => {
  const applicationsSource = await readFile(new URL("../lib/applications.ts", import.meta.url), "utf8")
  const listRouteSource = await readFile(new URL("../app/api/admin/applications/route.ts", import.meta.url), "utf8")
  const commentRouteSource = await readFile(new URL("../app/api/admin/applications/[id]/comments/route.ts", import.meta.url), "utf8")
  const deleteRouteSource = await readFile(new URL("../app/api/admin/applications/[id]/comments/[commentId]/route.ts", import.meta.url), "utf8")

  assert.match(applicationsSource, /create table if not exists admin_comments/)
  assert.match(applicationsSource, /application_id uuid not null references residency_applications\(id\) on delete cascade/)
  assert.match(applicationsSource, /export async function listAdminComments/)
  assert.match(applicationsSource, /export async function createAdminComment/)
  assert.match(applicationsSource, /export async function deleteAdminComment/)
  assert.match(listRouteSource, /listAdminComments/)
  assert.match(listRouteSource, /return NextResponse\.json\(\{ applications, comments \}\)/)
  assert.match(commentRouteSource, /export async function POST/)
  assert.match(deleteRouteSource, /export async function DELETE/)
})
