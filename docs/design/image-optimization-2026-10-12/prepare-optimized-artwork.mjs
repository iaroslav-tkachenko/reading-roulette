import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const reportDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(reportDir, '../../..');
const sourceDir = path.join(projectRoot, 'src/assets/reading-machine');
const outputDir = path.join(sourceDir, 'optimized');
const compactDir = path.join(outputDir, 'compact');
const require = createRequire(import.meta.url);
let sharp;
if (process.env.READING_SHARP_MODULE) {
  sharp = require(process.env.READING_SHARP_MODULE);
} else {
  sharp = require('sharp');
}

// At 1536 CSS px, artwork extents are resolved from the nested SVG viewBox
// and element size. These limits provide about 2 source pixels per CSS pixel.
// Large background and paper sources already need their full native dimensions.
const desktopSizes = {
  'chassis-v3.png': null,
  'desk-books-v7.png': [1490, 993],
  'desk-lamp-books-v7.png': [568, 1033],
  'desk-pen-cup-v7.png': [392, 589],
  'drum-v1.png': [652, 502],
  'key-v1.png': [130, 128],
  'mechanism-v2.png': null,
  'paper-v1.png': null,
  'settings-v2.png': null,
  'spin-button-v3.png': [651, 224],
  'study-bookcase-wide-v8.png': [796, 1282],
  'study-shell-v7.png': null,
  'study-window-wide-v8.png': [740, 1232],
  'wheel-v1.png': [162, 269],
};

// Room props use a second set at the compact layout ceiling (900 CSS px).
// It covers the maximum compact viewport at 2x while avoiding desktop-sized
// downloads on phones and narrow tablets.
const compactSizes = {
  'desk-books-v7.png': [874, 582],
  'desk-lamp-books-v7.png': [333, 605],
  'desk-pen-cup-v7.png': [230, 345],
  'study-bookcase-wide-v8.png': [467, 751],
  'study-window-wide-v8.png': [434, 722],
};

await fs.mkdir(compactDir, { recursive: true });
const results = [];

async function encode(file, size, destination) {
  const sourcePath = path.join(sourceDir, file);
  const sourceMetadata = await sharp(sourcePath).metadata();
  let image = sharp(sourcePath);
  if (size) image = image.resize(size[0], size[1], { fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' });
  const result = await image.webp({ quality: 92, alphaQuality: 100, effort: 4, smartSubsample: true }).toFile(destination);
  results.push({ file, variant: destination.includes(`${path.sep}compact${path.sep}`) ? 'compact' : 'desktop', source: `${sourceMetadata.width}x${sourceMetadata.height}`, output: `${result.width}x${result.height}`, bytes: result.size });
  console.log(`Created ${path.relative(outputDir, destination)} (${result.width}x${result.height}, ${result.size} bytes)`);
}

for (const [file, size] of Object.entries(desktopSizes)) {
  await encode(file, size, path.join(outputDir, file.replace(/\.png$/i, '.webp')));
}
for (const [file, size] of Object.entries(compactSizes)) {
  await encode(file, size, path.join(compactDir, file.replace(/\.png$/i, '.webp')));
}

console.log(JSON.stringify({ sharp: sharp.versions.sharp, webpEncoder: sharp.versions.webp, quality: 92, alphaQuality: 100, effort: 4, results }, null, 2));
