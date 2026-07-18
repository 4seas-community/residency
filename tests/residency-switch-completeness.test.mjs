import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("root metadata describes all residency programs", async () => {
  const source = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8")

  assert.match(source, /4Seas Residency Programs \| Chiang Mai/)
  assert.doesNotMatch(source, /4Seas Crypto Residency Program/)
})

test("admin track badges do not turn missing tracks into crypto", async () => {
  const source = await readFile(new URL("../components/admin/track-badge.tsx", import.meta.url), "utf8")

  assert.doesNotMatch(source, /programType \|\| ["']crypto["']/)
  assert.match(source, /getProgramName\(programType\)/)
})

test("application details explain an empty links section", async () => {
  const source = await readFile(new URL("../components/admin/application-details-sheet.tsx", import.meta.url), "utf8")

  assert.match(source, /No links provided\./)
})
