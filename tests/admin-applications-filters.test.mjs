import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("admin applications page filters by search text and review status", async () => {
  const source = await readFile(new URL("../app/admin/applications/page.tsx", import.meta.url), "utf8")

  assert.match(source, /const \[searchQuery, setSearchQuery\] = useState\(""\)/)
  assert.match(source, /const \[statusFilter, setStatusFilter\] = useState<StatusFilter>\("all"\)/)
  assert.match(source, /const filteredApplications = applications\.filter/)
  assert.match(source, /normalizedSearch/)
  assert.match(source, /searchHaystack/)
  assert.match(source, /app\.status !== statusFilter/)
  assert.match(source, /filteredApplications\.map/)
  assert.match(source, /filteredApplications\.length === 0/)
  assert.match(source, /Search by name, email, contact, links, or notes/)
  assert.match(source, /value="approved"/)
  assert.match(source, /value="rejected"/)
})
