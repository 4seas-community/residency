import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("application form captures country and region as a required searchable selection", async () => {
  const formSource = await readFile(new URL("../components/residency/application-form.tsx", import.meta.url), "utf8")

  assert.match(formSource, /nationality: string/)
  assert.match(formSource, /nationality: ''/)
  assert.match(formSource, /if \(!formData\.nationality\.trim\(\)\)/)
  assert.match(formSource, /Country &amp; Region/)
  assert.match(formSource, /COUNTRIES_AND_REGIONS\.map/)
  assert.match(formSource, /handleFieldChange\('nationality', value === formData\.nationality \? '' : value\)/)
})

test("selected country flows through the API into the database", async () => {
  const formSource = await readFile(new URL("../components/residency/application-form.tsx", import.meta.url), "utf8")
  const routeSource = await readFile(new URL("../app/api/applications/route.ts", import.meta.url), "utf8")
  const dbSource = await readFile(new URL("../lib/applications/db.ts", import.meta.url), "utf8")

  assert.match(formSource, /country: formData\.nationality \|\| null/)
  assert.match(routeSource, /country: optStr\(data\.country\)/)
  assert.match(dbSource, /add column if not exists country text/)
  assert.match(dbSource, /country\?: string \| null/)
  assert.match(dbSource, /input\.country \?\? null/)
})

test("admin API still returns nationality for every application", async () => {
  const dbSource = await readFile(new URL("../lib/applications/db.ts", import.meta.url), "utf8")

  const selectColumns = dbSource.slice(dbSource.indexOf("SELECT_COLUMNS"), dbSource.indexOf("listApplications"))
  assert.ok(selectColumns.includes("nationality"), "shared SELECT_COLUMNS must include nationality")
  assert.match(dbSource, /select \$\{SELECT_COLUMNS\} from residency_applications order by created_at desc/)
})
