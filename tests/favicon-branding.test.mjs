import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"
import { inflateSync } from "node:zlib"

function has4SeasGreenPixel(buffer) {
  const pngSignature = "89504e470d0a1a0a"
  assert.equal(buffer.subarray(0, 8).toString("hex"), pngSignature)

  let offset = 8
  const chunks = []
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii")
    const data = buffer.subarray(offset + 8, offset + 8 + length)
    chunks.push({ type, data })
    offset += 12 + length
  }

  const header = chunks.find((chunk) => chunk.type === "IHDR")?.data
  assert.ok(header, "PNG must include IHDR")
  const width = header.readUInt32BE(0)
  const height = header.readUInt32BE(4)
  const bitDepth = header[8]
  const colorType = header[9]
  assert.equal(bitDepth, 8)
  assert.equal(colorType, 6, "favicon PNG must be RGBA")

  const idat = Buffer.concat(chunks.filter((chunk) => chunk.type === "IDAT").map((chunk) => chunk.data))
  const inflated = inflateSync(idat)
  const bytesPerPixel = 4
  const stride = width * bytesPerPixel
  const rows = []
  let source = 0
  let previous = Buffer.alloc(stride)

  for (let y = 0; y < height; y++) {
    const filter = inflated[source++]
    const row = Buffer.from(inflated.subarray(source, source + stride))
    source += stride

    for (let x = 0; x < stride; x++) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0
      const up = previous[x]
      const upperLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0
      if (filter === 1) row[x] = (row[x] + left) & 255
      else if (filter === 2) row[x] = (row[x] + up) & 255
      else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255
      else if (filter === 4) {
        const p = left + up - upperLeft
        const pa = Math.abs(p - left)
        const pb = Math.abs(p - up)
        const pc = Math.abs(p - upperLeft)
        row[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft)) & 255
      } else {
        assert.equal(filter, 0, `Unsupported PNG filter ${filter}`)
      }
    }

    rows.push(row)
    previous = row
  }

  return rows.some((row) => {
    for (let x = 0; x < stride; x += bytesPerPixel) {
      const [r, g, b, a] = row.subarray(x, x + bytesPerPixel)
      if (a > 200 && r < 20 && g >= 90 && g <= 140 && b >= 70 && b <= 120) {
        return true
      }
    }
    return false
  })
}

test("favicon SVG uses the 4Seas mark instead of the v0 default", async () => {
  const svg = await readFile(new URL("../public/icon.svg", import.meta.url), "utf8")

  assert.match(svg, /4Seas favicon/)
  assert.match(svg, /#007A5E/i)
  assert.doesNotMatch(svg, /clip0_7960_43945|v0/i)
})

test("PNG favicon assets include the 4Seas green mark", async () => {
  for (const asset of ["icon-light-32x32.png", "icon-dark-32x32.png", "apple-icon.png"]) {
    const buffer = await readFile(new URL(`../public/${asset}`, import.meta.url))
    assert.equal(has4SeasGreenPixel(buffer), true, `${asset} should contain the 4Seas green mark`)
  }
})
