import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("application form captures nationality as a required field", async () => {
  const formSource = await readFile(new URL("../components/residency/application-form.tsx", import.meta.url), "utf8")

  assert.match(formSource, /nationality: string/)
  assert.match(formSource, /nationality: ''/)
  assert.match(formSource, /if \(!formData\.nationality\.trim\(\)\)/)
  assert.match(formSource, /value=\{formData\.nationality\}/)
  assert.match(formSource, /handleInputChange\('nationality', e\.target\.value\)/)
})

test("nationality flows through the API into the database", async () => {
  const routeSource = await readFile(new URL("../app/api/applications/route.ts", import.meta.url), "utf8")
  const dbSource = await readFile(new URL("../lib/applications/db.ts", import.meta.url), "utf8")

  assert.match(routeSource, /nationality: optStr\(data\.nationality\)/)
  assert.match(dbSource, /add column if not exists nationality text/)
  assert.match(dbSource, /nationality\?: string \| null/)
  assert.match(dbSource, /input\.nationality \?\? null/)
})

test("admin API still returns nationality for every application", async () => {
  const dbSource = await readFile(new URL("../lib/applications/db.ts", import.meta.url), "utf8")

  const selectColumns = dbSource.slice(dbSource.indexOf("SELECT_COLUMNS"), dbSource.indexOf("listApplications"))
  assert.ok(selectColumns.includes("nationality"), "shared SELECT_COLUMNS must include nationality")
  assert.match(dbSource, /select \$\{SELECT_COLUMNS\} from residency_applications order by created_at desc/)
})
