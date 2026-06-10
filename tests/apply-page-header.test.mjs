import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

const applySources = [
  "../app/apply/page.tsx",
  "../app/art/apply/page.tsx",
  "../app/crypto/apply/page.tsx",
  "../app/longevity/apply/page.tsx",
  "../components/residency/application-form.tsx",
]

test("apply pages never link to the old program information page", async () => {
  for (const path of applySources) {
    const source = await readFile(new URL(path, import.meta.url), "utf8")

    assert.equal(source.includes("Program Information"), false, `${path} must not mention Program Information`)
    assert.equal(source.includes("v0-4seas-crypto-residency.vercel.app"), false, `${path} must not link to the v0 preview`)
  }
})
