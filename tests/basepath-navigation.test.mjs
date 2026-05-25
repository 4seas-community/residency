import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("client navigation leaves basePath handling to Next router", async () => {
  const adminLoginSource = await readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8")
  const adminApplicationsSource = await readFile(new URL("../app/admin/applications/page.tsx", import.meta.url), "utf8")

  assert.match(adminLoginSource, /fetch\(withBasePath\("\/api\/admin\/session"\)/)
  assert.match(adminLoginSource, /fetch\(withBasePath\("\/api\/admin\/login"\)/)
  assert.match(adminLoginSource, /router\.replace\("\/admin\/applications"\)/)
  assert.match(adminLoginSource, /router\.push\("\/admin\/applications"\)/)
  assert.doesNotMatch(adminLoginSource, /router\.(replace|push)\(withBasePath/)

  assert.match(adminApplicationsSource, /fetch\(withBasePath\("\/api\/admin\/applications"\)/)
  assert.match(adminApplicationsSource, /router\.replace\("\/admin"\)/)
  assert.match(adminApplicationsSource, /router\.push\("\/admin"\)/)
  assert.match(adminApplicationsSource, /<Link href="\/">/)
  assert.doesNotMatch(adminApplicationsSource, /router\.(replace|push)\(withBasePath/)
  assert.doesNotMatch(adminApplicationsSource, /<Link href=\{withBasePath/)
})

test("duplicate basePath URLs redirect to the canonical route", async () => {
  const nextConfigSource = await readFile(new URL("../next.config.mjs", import.meta.url), "utf8")

  assert.match(nextConfigSource, /async redirects\(\)/)
  assert.match(nextConfigSource, /source: `\$\{basePath\}\/:path\*`/)
  assert.match(nextConfigSource, /destination: "\/:path\*"/)
})
