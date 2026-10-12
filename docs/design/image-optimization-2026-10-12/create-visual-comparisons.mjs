import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const reportDir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sharp = process.env.READING_SHARP_MODULE ? require(process.env.READING_SHARP_MODULE) : require('sharp');
const beforeDir = path.join(reportDir, 'before');
const afterDir = path.join(reportDir, 'after');
const stats = {};

function difference(reference, actual, channels) {
  let absoluteSum = 0;
  let maximum = 0;
  let overEight = 0;
  const count = reference.length / channels;
  for (let offset = 0; offset < reference.length; offset += channels) {
    let pixelMax = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      const delta = Math.abs(reference[offset + channel] - actual[offset + channel]);
      absoluteSum += delta;
      pixelMax = Math.max(pixelMax, delta);
    }
    maximum = Math.max(maximum, pixelMax);
    if (pixelMax > 8) overEight += 1;
  }
  return {
    meanAbsoluteChannelDelta: Math.round((absoluteSum / reference.length) * 1000) / 1000,
    maximumChannelDelta: maximum,
    pixelsWithChannelDeltaOver8Percent: Math.round((overEight / count) * 10000) / 100,
  };
}

async function comparePngs(beforePath, afterPath, key) {
  const [beforeMeta, afterMeta] = await Promise.all([sharp(beforePath).metadata(), sharp(afterPath).metadata()]);
  if (beforeMeta.width !== afterMeta.width || beforeMeta.height !== afterMeta.height) {
    throw new Error(`${key} dimensions differ: ${beforeMeta.width}x${beforeMeta.height} vs ${afterMeta.width}x${afterMeta.height}`);
  }
  const [before, after] = await Promise.all([
    sharp(beforePath).ensureAlpha().raw().toBuffer(),
    sharp(afterPath).ensureAlpha().raw().toBuffer(),
  ]);
  stats[key] = {
    width: beforeMeta.width,
    height: beforeMeta.height,
    screenshotDiff: difference(before, after, 4),
  };
  return { beforePath, afterPath, width: beforeMeta.width, height: beforeMeta.height };
}

async function sideBySide(beforePath, afterPath, outputPath, topCrop, bottomCrop) {
  const beforeMeta = await sharp(beforePath).metadata();
  const afterMeta = await sharp(afterPath).metadata();
  if (beforeMeta.width !== afterMeta.width || beforeMeta.height !== afterMeta.height) throw new Error(`Screenshot dimensions differ for ${outputPath}`);
  const header = 54;
  const gutter = 8;
  const panelWidth = topCrop?.width ?? beforeMeta.width;
  const panelHeight = topCrop ? topCrop.height + (bottomCrop ? bottomCrop.height + 12 : 0) : beforeMeta.height;
  const width = panelWidth * 2 + gutter;
  const height = panelHeight + header;
  const makePanel = async (input, x) => {
    const parts = [];
    if (topCrop) {
      parts.push({ input: await sharp(input).extract(topCrop).png().toBuffer(), left: x, top: header });
      if (bottomCrop) parts.push({ input: await sharp(input).extract(bottomCrop).png().toBuffer(), left: x, top: header + topCrop.height + 12 });
    } else {
      parts.push({ input: await sharp(input).png().toBuffer(), left: x, top: header });
    }
    return parts;
  };
  const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${header}"><rect width="100%" height="100%" fill="#101418"/><text x="${Math.round(panelWidth / 2)}" y="36" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="24">PNG · до</text><text x="${panelWidth + gutter + Math.round(panelWidth / 2)}" y="36" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="24">WebP · после</text></svg>`);
  const overlays = [
    { input: label, left: 0, top: 0 },
    ...await makePanel(beforePath, 0),
    ...await makePanel(afterPath, panelWidth + gutter),
  ];
  await sharp({ create: { width, height, channels: 4, background: '#101418' } })
    .composite(overlays)
    .webp({ quality: 96, effort: 4 })
    .toFile(outputPath);
}

const desktop = await comparePngs(
  path.join(beforeDir, 'baseline-desktop-viewport.png'),
  path.join(afterDir, 'optimized-desktop-viewport.png'),
  'desktop',
);
const mobile = await comparePngs(
  path.join(beforeDir, 'baseline-mobile-viewport.png'),
  path.join(afterDir, 'optimized-mobile-viewport.png'),
  'mobile',
);
const desktopFull = await sharp(path.join(beforeDir, 'baseline-desktop-full.png')).metadata();
const mobileFull = await sharp(path.join(beforeDir, 'baseline-mobile-full.png')).metadata();

await sideBySide(desktop.beforePath, desktop.afterPath, path.join(reportDir, 'desktop-comparison.webp'));
await sideBySide(mobile.beforePath, mobile.afterPath, path.join(reportDir, 'mobile-comparison.webp'));
await sideBySide(
  path.join(beforeDir, 'baseline-desktop-full.png'),
  path.join(afterDir, 'optimized-desktop-full.png'),
  path.join(reportDir, 'paper-desktop-comparison.webp'),
  { left: 280, top: 675, width: 976, height: 260 },
  { left: 280, top: desktopFull.height - 190, width: 976, height: 190 },
);
await sideBySide(
  path.join(beforeDir, 'baseline-mobile-viewport.png'),
  path.join(afterDir, 'optimized-mobile-viewport.png'),
  path.join(reportDir, 'paper-mobile-comparison.webp'),
  { left: 0, top: 1030, width: 780, height: 600 },
);

const outputPath = path.join(reportDir, 'visual-comparison.json');
await fs.writeFile(outputPath, `${JSON.stringify({ stats }, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, stats }, null, 2));
