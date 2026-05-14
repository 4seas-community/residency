import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("application page header does not link to the old program information page", async () => {
  const source = await readFile(new URL("../app/apply/page.tsx", import.meta.url), "utf8")

  assert.equal(source.includes("Program Information"), false)
  assert.equal(source.includes("v0-4seas-crypto-residency.vercel.app"), false)
})
