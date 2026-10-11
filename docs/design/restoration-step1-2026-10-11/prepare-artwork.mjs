// Reuse the existing read-only PNG decoder; never rewrite raster masters.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { inflateSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '../assets')
const source = fs.readFileSync(path.join(root, 'inspect-assets.mjs'), 'utf8')
const decoder = source.slice(source.indexOf('const paeth'), source.indexOf('const assets ='))
  .replace('return {\n    file,', 'return {\n    pixels, channels, file,')
const inspect = vm.runInNewContext(decoder + '\ninspect', { readFileSync: fs.readFileSync, inflateSync, createHash, path, root, Buffer })
const frame = inspect('reel-cradle-v1.png')
if (frame.centerAlpha !== 0 || frame.cornerAlpha.some(alpha => alpha !== 0)) throw Error('Cradle must have a transparent opening and exterior')
const [left, top, right, bottom] = frame.boundsAboveAlpha8
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${right - left} ${bottom - top}"><image width="${frame.width}" height="${frame.height}" href="data:image/png;base64,${fs.readFileSync(path.join(root, frame.file)).toString('base64')}"/></svg>\n`
fs.writeFileSync(path.join(root, 'reel-cradle-display.svg'), svg)

const keycap = inspect('keycap-v1.png')
// High-luminance low-saturation pixels identify the ivory face, excluding the dark sidewall.
let count = 0, xSum = 0, ySum = 0
for (let y = 100; y < 1159; y++) for (let x = 132; x < 1121; x++) {
  const at = (y * keycap.width + x) * keycap.channels
  const [r, g, b, a] = keycap.pixels.subarray(at, at + 4)
  if (a > 200 && r > 200 && g > 175 && b > 140 && r - g < 55) { count++; xSum += x; ySum += y }
}
const faceCentre = { method: 'Centroid of bright ivory pixels in original keycap, excluding dark sidewall; not browser glyph alignment', count, master: [xSum / count, ySum / count], displayPercent: [(xSum / count - 132) / 989 * 100, (ySum / count - 100) / 1059 * 100] }
const historical = JSON.parse(fs.readFileSync(path.join(root, 'asset-inspection.json'), 'utf8'))
const originals = historical.assets.map(asset => ({ file: asset.file, unchanged: createHash('sha256').update(fs.readFileSync(path.join(root, asset.file))).digest('hex') === asset.sha256 }))
if (originals.some(asset => !asset.unchanged)) throw Error('An original master differs from its recorded hash')
const { pixels: framePixels, channels: frameChannels, ...frameReport } = frame
const report = { date: '2026-10-11', frame: frameReport, wrapperViewBox: [left, top, right - left, bottom - top], keycapFace: faceCentre, originals }
fs.writeFileSync(path.join(directory, 'artwork-inspection.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
