// Read-only PNG inspection. No decoding libraries or raster mutations.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const paeth = (a, b, c) => {
  const p = a + b - c;
  const da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
  return da <= db && da <= dc ? a : db <= dc ? b : c;
};

function inspect(file) {
  const data = readFileSync(path.join(root, file));
  const width = data.readUInt32BE(16), height = data.readUInt32BE(20);
  const color = data[25], channels = color === 6 ? 4 : 3;
  if (data[24] !== 8 || ![2, 6].includes(color) || data[28] !== 0) {
    throw new Error(`Unsupported PNG encoding: ${file}`);
  }
  const chunks = [];
  for (let at = 8; at < data.length;) {
    const length = data.readUInt32BE(at), type = data.toString('ascii', at + 4, at + 8);
    if (type === 'IDAT') chunks.push(data.subarray(at + 8, at + 8 + length));
    at += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * channels;
  if (raw.length !== (stride + 1) * height) throw new Error(`Invalid data size: ${file}`);
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    if (filter > 4) throw new Error(`Unknown filter: ${file}`);
    for (let x = 0; x < stride; x++) {
      const at = y * stride + x;
      const left = x >= channels ? pixels[at - channels] : 0;
      const up = y ? pixels[at - stride] : 0;
      const upperLeft = y && x >= channels ? pixels[at - stride - channels] : 0;
      const prediction = [0, left, up, Math.floor((left + up) / 2), paeth(left, up, upperLeft)][filter];
      pixels[at] = (raw[y * (stride + 1) + 1 + x] + prediction) & 255;
    }
  }
  const alpha = (x, y) => channels === 4 ? pixels[(y * width + x) * channels + 3] : 255;
  let transparent = 0, partial = 0, opaque = 0;
  let left = width, top = height, right = 0, bottom = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const a = alpha(x, y);
    if (a === 0) transparent++; else if (a < 255) partial++; else opaque++;
    if (a > 8) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1); }
  }
  return {
    file, width, height, bytes: data.length,
    sha256: createHash('sha256').update(data).digest('hex'),
    transparentPixels: transparent, partialAlphaPixels: partial, opaquePixels: opaque,
    boundsAboveAlpha8: [left, top, right, bottom],
    centerAlpha: alpha(Math.floor(width / 2), Math.floor(height / 2)),
    cornerAlpha: [alpha(0, 0), alpha(width - 1, 0), alpha(width - 1, height - 1), alpha(0, height - 1)],
  };
}

const assets = readdirSync(root).filter(file => file.endsWith('.png')).sort().map(inspect);
const report = { date: '2026-10-10', method: 'Read-only PNG decoding, pixel alpha/bounds and SHA-256; not browser QA', assets };
writeFileSync(path.join(root, 'asset-inspection.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
