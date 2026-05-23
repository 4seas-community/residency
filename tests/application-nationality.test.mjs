import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("application flow captures nationality and exposes it to admins", async () => {
  const applyPageSource = await readFile(new URL("../app/apply/page.tsx", import.meta.url), "utf8")
  const applicationRouteSource = await readFile(new URL("../app/api/applications/route.ts", import.meta.url), "utf8")
  const applicationsSource = await readFile(new URL("../lib/applications.ts", import.meta.url), "utf8")
  const adminPageSource = await readFile(new URL("../app/admin/applications/page.tsx", import.meta.url), "utf8")

  assert.match(applyPageSource, /nationality: ""/)
  assert.match(applyPageSource, /htmlFor="nationality"/)
  assert.match(applyPageSource, /Nationality <span className="text-destructive">\*<\/span>/)
  assert.match(applyPageSource, /newErrors\.nationality = "Nationality is required"/)
  assert.match(applyPageSource, /nationality: formData\.nationality/)

  assert.match(applicationRouteSource, /nationality: stringValue\(data\.nationality\)/)
  assert.match(applicationRouteSource, /if \(!application\.nationality\) throw new Error\("Nationality is required"\)/)

  assert.match(applicationsSource, /nationality: string/)
  assert.match(applicationsSource, /nationality text/)
  assert.match(applicationsSource, /add column if not exists nationality text/)
  assert.match(applicationsSource, /input\.nationality\.trim\(\)/)

  assert.match(adminPageSource, /nationality: string \| null/)
  assert.match(adminPageSource, /"Nationality"/)
  assert.match(adminPageSource, /app\.nationality \|\| "-"/)
  assert.match(adminPageSource, /csvField\(app\.nationality\)/)
})
