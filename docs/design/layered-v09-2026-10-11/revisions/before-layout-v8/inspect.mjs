import fs from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, 'assets');
const source = fs.readFileSync(path.join(dir, '../assets/inspect-assets.mjs'), 'utf8');
const decoder = source.slice(source.indexOf('const paeth'), source.indexOf('const assets ='));
const inspect = new Function('readFileSync', 'inflateSync', 'createHash', 'path', 'root', 'Buffer', decoder + '\nreturn inspect;')(fs.readFileSync, inflateSync, createHash, path, root, Buffer);
const assets = fs.readdirSync(root).filter(f => f.endsWith('.png')).sort().map(inspect);
fs.writeFileSync(path.join(dir, 'asset-inspection.json'), JSON.stringify({ method: 'Read-only PNG decoding; original alpha preserved', assets }, null, 2) + '\n');
console.log(JSON.stringify(assets.map(({file,width,height,boundsAboveAlpha8,transparentPixels,centerAlpha}) => ({file,width,height,boundsAboveAlpha8,transparentPixels,centerAlpha})), null, 2));
