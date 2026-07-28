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

  assert.match(source, counterImport)
  assert.match(source, /const remainingCharacters = getRemainingAboutCharacters\(formData\.about_you\)/)
  assert.match(source, /const isOverLimit = isAboutResponseOverCharacterLimit\(formData\.about_you\)/)
  assert.match(source, /characters remaining/)
  assert.doesNotMatch(source, /countWords/)
  assert.doesNotMatch(source, /wordCount/)
  assert.doesNotMatch(source, /300 words/)
})

test("application API enforces the same character limit as the visible counter", async () => {
  const source = await readFile(new URL("../app/api/applications/route.ts", import.meta.url), "utf8")

  assert.match(source, /import \{ ABOUT_RESPONSE_CHARACTER_LIMIT, isAboutResponseOverCharacterLimit \} from "@\/lib\/application-limits"/)
  assert.match(source, /isAboutResponseOverCharacterLimit\(about_and_contribution\)/)
  assert.match(source, /under \$\{ABOUT_RESPONSE_CHARACTER_LIMIT\} characters/)
  assert.doesNotMatch(source, /countWords/)
  assert.doesNotMatch(source, /300 words/)
})
