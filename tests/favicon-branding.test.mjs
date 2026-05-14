import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

const officialAssetHashes = {
  "public/images/favicon.jpg": "a5e78fa0ec3bb3b3d285edf1c3a0418a354077ec64c6366e36d465cb274febf3",
  "public/images/webclip.jpg": "7921e500b95485dd355f90ce72d97110fb7a7d2ac67d5e259bfae7f3ef6f5cad",
}

async function sha256(path) {
  const buffer = await readFile(new URL(`../${path}`, import.meta.url))
  return createHash("sha256").update(buffer).digest("hex")
}

test("metadata uses the official 4seas.xyz favicon files", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8")

  assert.match(layout, /images\/favicon\.jpg/)
  assert.match(layout, /images\/webclip\.jpg/)
  assert.match(layout, /image\/x-icon/)
  assert.doesNotMatch(layout, /icon-light-32x32|icon-dark-32x32|apple-icon\.png|icon\.svg/)
})

test("official homepage favicon assets are bundled without modification", async () => {
  for (const [path, expectedHash] of Object.entries(officialAssetHashes)) {
    assert.equal(await sha256(path), expectedHash, `${path} must match the official 4seas.xyz asset`)
  }
})

test("legacy favicon paths no longer serve the handmade icon", async () => {
  const svg = await readFile(new URL("../public/icon.svg", import.meta.url), "utf8")

  assert.match(svg, /images\/favicon\.jpg/)
  assert.doesNotMatch(svg, /#007A5E|clip0_7960_43945/)
})
