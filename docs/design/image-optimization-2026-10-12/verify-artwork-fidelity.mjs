import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const reportDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(reportDir, '../../..');
const assetsDir = path.join(projectRoot, 'src/assets/reading-machine');
const optimizedDir = path.join(assetsDir, 'optimized');
const require = createRequire(import.meta.url);
const sharp = process.env.READING_SHARP_MODULE ? require(process.env.READING_SHARP_MODULE) : require('sharp');
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
const compactSizes = {
  'desk-books-v7.png': [874, 582],
  'desk-lamp-books-v7.png': [333, 605],
  'desk-pen-cup-v7.png': [230, 345],
  'study-bookcase-wide-v8.png': [467, 751],
  'study-window-wide-v8.png': [434, 722],
};
const results = [];

function channelError(reference, actual, channels) {
  let absoluteSum = 0;
  let maxChannelDelta = 0;
  let pixelsOverEight = 0;
  const count = reference.length / channels;
  for (let offset = 0; offset < reference.length; offset += channels) {
    let maxForPixel = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      const delta = Math.abs(reference[offset + channel] - actual[offset + channel]);
      absoluteSum += delta;
      maxForPixel = Math.max(maxForPixel, delta);
    }
    maxChannelDelta = Math.max(maxChannelDelta, maxForPixel);
    if (maxForPixel > 8) pixelsOverEight += 1;
  }
  return {
    meanAbsoluteChannelDelta: Math.round((absoluteSum / reference.length) * 1000) / 1000,
    maxChannelDelta,
    pixelsOverEightPercent: Math.round((pixelsOverEight / count) * 10000) / 100,
  };
}

async function verify(file, size, compact) {
  const sourcePath = path.join(assetsDir, file);
  const webpPath = path.join(optimizedDir, compact ? 'compact' : '', file.replace(/\.png$/i, '.webp'));
  let reference = sharp(sourcePath);
  if (size) reference = reference.resize(size[0], size[1], { fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' });
  const [referenceRaw, outputRaw, sourceMeta, outputMeta] = await Promise.all([
    reference.clone().ensureAlpha().raw().toBuffer(),
    sharp(webpPath).ensureAlpha().raw().toBuffer(),
    sharp(sourcePath).metadata(),
    sharp(webpPath).metadata(),
  ]);
  let alphaMismatches = 0;
  for (let offset = 3; offset < referenceRaw.length; offset += 4) {
    if (referenceRaw[offset] !== outputRaw[offset]) alphaMismatches += 1;
  }
  const matteResults = {};
  for (const background of ['#172126', '#fff1da']) {
    const [before, after] = await Promise.all([
      reference.clone().flatten({ background }).removeAlpha().raw().toBuffer(),
      sharp(webpPath).flatten({ background }).removeAlpha().raw().toBuffer(),
    ]);
    matteResults[background] = channelError(before, after, 3);
  }
  const stats = await fs.stat(webpPath);
  return {
    file: `${compact ? 'compact/' : ''}${file.replace(/\.png$/i, '.webp')}`,
    source: `${sourceMeta.width}x${sourceMeta.height}`,
    output: `${outputMeta.width}x${outputMeta.height}`,
    alphaMismatches,
    originalBytes: (await fs.stat(sourcePath)).size,
    optimizedBytes: stats.size,
    composites: matteResults,
  };
}

for (const [file, size] of Object.entries(desktopSizes)) results.push(await verify(file, size, false));
for (const [file, size] of Object.entries(compactSizes)) results.push(await verify(file, size, true));

const report = { encoder: `libwebp ${sharp.versions.webp}`, quality: 92, alphaQuality: 100, effort: 4, results };
const outputPath = path.join(reportDir, 'artwork-fidelity.json');
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, count: results.length, alphaMismatches: results.reduce((sum, result) => sum + result.alphaMismatches, 0) }));
