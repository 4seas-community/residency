import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

const programs = ["crypto", "art", "longevity"]

test("lib/programs defines exactly the three residency tracks", async () => {
  const source = await readFile(new URL("../lib/programs.ts", import.meta.url), "utf8")

  assert.match(source, /export type ProgramType = 'crypto' \| 'art' \| 'longevity'/)
  assert.match(source, /export const PROGRAMS: Record<ProgramType, ProgramConfig>/)
  for (const program of programs) {
    assert.match(source, new RegExp(`${program}: \\{\\s*id: '${program}'`), `PROGRAMS must define ${program}`)
  }
})

test("hub status badges use the same active state as program detail pages", async () => {
  const hubSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8")
  const programsSource = await readFile(new URL("../lib/programs.ts", import.meta.url), "utf8")

  assert.match(hubSource, /program\.isActive \? 'Now Open' : 'Coming Soon'/)
  assert.doesNotMatch(hubSource, /program\.cohortStartDate === 'Coming Soon'/)
  assert.match(programsSource, /longevity: \{[\s\S]*?isActive: true,[\s\S]*?cohortStartDate: 'Rolling admissions'/)
})

test("every track ships a page and an apply page wired to the shared form", async () => {
  for (const program of programs) {
    const page = await readFile(new URL(`../app/${program}/page.tsx`, import.meta.url), "utf8")
    assert.ok(page.length > 0, `app/${program}/page.tsx must exist`)

    const applyPage = await readFile(new URL(`../app/${program}/apply/page.tsx`, import.meta.url), "utf8")
    assert.match(applyPage, /import ApplicationForm from "@\/components\/residency\/application-form"/)
    assert.match(applyPage, new RegExp(`programType="${program}"`), `apply page must submit as ${program}`)
  }
})

test("unknown program slugs hit notFound", async () => {
  const source = await readFile(new URL("../app/[program]/page.tsx", import.meta.url), "utf8")

  assert.match(source, /notFound\(\)/)
  assert.match(source, /getProgram/)
})

test("the public API only accepts the three known tracks", async () => {
  const routeSource = await readFile(new URL("../app/api/applications/route.ts", import.meta.url), "utf8")
  const dbSource = await readFile(new URL("../lib/applications/db.ts", import.meta.url), "utf8")

  assert.match(routeSource, /const VALID_PROGRAMS = new Set\(\["crypto", "art", "longevity"\]\)/)
  assert.match(routeSource, /VALID_PROGRAMS\.has\(programType\)/)
  assert.match(dbSource, /add column if not exists program_type text default 'crypto'/)
  assert.match(dbSource, /update residency_applications set program_type = 'crypto' where program_type is null/)
})

test("application form submits the selected program", async () => {
  const formSource = await readFile(new URL("../components/residency/application-form.tsx", import.meta.url), "utf8")

  assert.match(formSource, /programType: ProgramType/)
  assert.match(formSource, /program_type: programType/)
  assert.match(formSource, /2026-10-01/)
})
