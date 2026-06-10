import { createHash } from "node:crypto"
import { readFile, access } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

// Same official 4seas.xyz assets as before the rebrand, renamed in public/.
const officialAssetHashes = {
  "public/4seas-favicon.jpg": "a5e78fa0ec3bb3b3d285edf1c3a0418a354077ec64c6366e36d465cb274febf3",
  "public/4seas-icon.jpg": "7921e500b95485dd355f90ce72d97110fb7a7d2ac67d5e259bfae7f3ef6f5cad",
}

const legacyAssets = [
  "public/icon.svg",
  "public/apple-icon.png",
  "public/icon-light-32x32.png",
  "public/icon-dark-32x32.png",
  "public/images/favicon.jpg",
  "public/images/webclip.jpg",
]

async function sha256(path) {
  const buffer = await readFile(new URL(`../${path}`, import.meta.url))
  return createHash("sha256").update(buffer).digest("hex")
}

test("metadata uses the official 4seas favicon files through withBasePath", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8")

  assert.match(layout, /withBasePath\('\/4seas-favicon\.jpg'\)/)
  assert.match(layout, /withBasePath\('\/4seas-icon\.jpg'\)/)
  assert.doesNotMatch(layout, /icon-light-32x32|icon-dark-32x32|apple-icon\.png|icon\.svg|images\/favicon\.jpg|images\/webclip\.jpg/)
})

test("official favicon assets are bundled without modification", async () => {
  for (const [path, expectedHash] of Object.entries(officialAssetHashes)) {
    assert.equal(await sha256(path), expectedHash, `${path} must match the official 4seas.xyz asset`)
  }
})

test("legacy favicon files are gone from public/", async () => {
  for (const path of legacyAssets) {
    await assert.rejects(access(new URL(`../${path}`, import.meta.url)), `${path} should no longer exist`)
  }
})
