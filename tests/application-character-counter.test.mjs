import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

const counterImport =
  /import \{ ABOUT_RESPONSE_CHARACTER_LIMIT, getRemainingAboutCharacters, isAboutResponseOverCharacterLimit \} from "@\/lib\/application-limits"/

test("public apply page shows a remaining character counter that updates from raw text length", async () => {
  const source = await readFile(new URL("../app/apply/page.tsx", import.meta.url), "utf8")

  assert.match(source, counterImport)
  assert.match(source, /const remainingCharacters = getRemainingAboutCharacters\(formData\.aboutAndContribution\)/)
  assert.match(source, /const isOverLimit = isAboutResponseOverCharacterLimit\(formData\.aboutAndContribution\)/)
  assert.match(source, /characters remaining/)
  assert.doesNotMatch(source, /countWords/)
  assert.doesNotMatch(source, /wordCount/)
  assert.doesNotMatch(source, /300 words/)
})

test("shared residency application form shows a remaining character counter that updates from raw text length", async () => {
  const source = await readFile(new URL("../components/residency/application-form.tsx", import.meta.url), "utf8")

  assert.match(
    source,
    /import \{\s*APPLICATION_RESPONSE_CHARACTER_LIMIT,\s*getRemainingCharacters,\s*isResponseOverCharacterLimit,\s*\} from "@\/lib\/application-limits"/,
  )
  assert.match(source, /const remainingCharacters = getRemainingCharacters\(value\)/)
  assert.match(source, /const isOverLimit = isResponseOverCharacterLimit\(value\)/)
  assert.match(source, /characters remaining/)
  assert.doesNotMatch(source, /countWords/)
  assert.doesNotMatch(source, /wordCount/)
  assert.doesNotMatch(source, /300 words/)
})

test("application API enforces the same character limit as the visible counter", async () => {
  const source = await readFile(new URL("../app/api/applications/route.ts", import.meta.url), "utf8")

  assert.match(
    source,
    /import \{\s*APPLICATION_RESPONSE_CHARACTER_LIMIT,\s*isResponseOverCharacterLimit,\s*\} from "@\/lib\/application-limits"/,
  )
  assert.match(source, /isResponseOverCharacterLimit\(about_and_contribution\)/)
  assert.match(source, /under \$\{APPLICATION_RESPONSE_CHARACTER_LIMIT\} characters/)
  assert.doesNotMatch(source, /countWords/)
  assert.doesNotMatch(source, /300 words/)
})

test("new contribution questions submit through the existing server API", async () => {
  const formSource = await readFile(new URL("../components/residency/application-form.tsx", import.meta.url), "utf8")
  const routeSource = await readFile(new URL("../app/api/applications/route.ts", import.meta.url), "utf8")

  assert.match(formSource, /fetch\(withBasePath\('\/api\/applications'\)/)
  assert.doesNotMatch(formSource, /supabase|createClient/)
  for (const field of ["contribution_plan", "contribution_past", "contribution_commitment"]) {
    assert.match(formSource, new RegExp(`${field}: formData\\.${field}`))
    assert.match(routeSource, new RegExp(`const ${field} = str\\(data\\.${field}\\)`))
  }
  assert.match(routeSource, /proposed_contribution: usesStructuredContributions \? contribution_plan/)
  assert.match(routeSource, /\? contribution_past\s*: optStr\(data\.previous_community_experience\)/)
  assert.match(routeSource, /anything_else: usesStructuredContributions \? contribution_commitment/)
})
