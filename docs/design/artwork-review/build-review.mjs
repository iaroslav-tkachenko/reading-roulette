// Static artwork review only: SVG viewports embed unmodified raster masters.
// No runtime product logic, animation, image resampling, or raster writes.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const assetRoot = path.join(root, '../assets');
const parts = [
  { id: 'chassis', file: 'chassis-frame-v1.png', crop: [17, 159, 1502, 710], purpose: 'Static responsive outer frame', pivot: null },
  { id: 'deck', file: 'keyboard-deck-v1.png', crop: [33, 147, 2105, 424], purpose: 'Static keyboard platform', pivot: null },
  { id: 'wheel', file: 'wheel-v1.png', crop: [46, 40, 1162, 1162], purpose: 'Rotating side wheel, two instances', pivot: ['50%', '50%'] },
  { id: 'keycap', file: 'keycap-v1.png', crop: [132, 100, 989, 1059], purpose: 'Decorative typewriter keyboard, 19 instances; four animated keys Q/S/O/J; HTML letters', pivot: null },
  { id: 'spin-face', file: 'spin-face-v1.png', crop: [52, 171, 1918, 425], purpose: 'Movable SPIN face, independent of focus/housing', pivot: null },
];
const inspection = JSON.parse(readFileSync(path.join(assetRoot, 'asset-inspection.json'), 'utf8'));
for (const part of parts) {
  const data = readFileSync(path.join(assetRoot, part.file));
  const item = inspection.assets.find(asset => asset.file === part.file);
  // Self-contained wrapper: external SVG images cannot fetch nested resources.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${part.crop[2]}" height="${part.crop[3]}" viewBox="${part.crop.join(' ')}"><image x="0" y="0" width="${item.width}" height="${item.height}" href="data:image/png;base64,${data.toString('base64')}"/></svg>\n`;
  writeFileSync(path.join(assetRoot, `${part.id}-display.svg`), svg);
}
writeFileSync(path.join(assetRoot, 'manifest.json'), `${JSON.stringify({
  version: 1, date: '2026-10-10', status: 'Stage 2 source artwork and static layer review; production integration pending',
  background: { file: 'study-background-v1.png', mode: 'cover; centered; static', mobile: 'Center crop with dark fallback; no keyboard or side-wheel overflow' },
  parts, zOrder: ['study', 'chassis-fill', 'chassis-frame', 'reel-paper-and-HTML', 'stationary-button-housing', 'movable-spin-face-and-HTML-label'],
  keyboard: { total: 19, leftRows: ['QWERT', 'ASDFG'], rightRows: ['YUIOP', 'HJKL'], movingKeys: ['Q', 'S', 'O', 'J'], decorative: true, hiddenBelow: 768 },
  rasterPolicy: 'Master PNG bytes are unchanged. SVG wrappers embed those same bytes and set a display viewport. No bitmap cutting, resampling, or recompression.',
  loading: 'Source masters total about 10 MB. Display SVGs embed their PNGs; do not load both formats in production. Derivative/export budget belongs to stage 3.',
}, null, 2)}\n`);

const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const prompt = 'Write a reading text in English for a B1+ learner.\nLength: 250–350 words.\nTopic: Travel. Format: Dialogue.\nAngle: Unexpected discovery.';
const cases = [
  { file: 'index.html', title: 'Normal labels', language: 'English', level: 'B1+', length: 'Medium', helper: '250–350 words', values: ['Travel', 'Dialogue', 'Unexpected discovery'], preview: prompt, dense: false },
  { file: 'long-labels.html', title: 'Long-label layout fixture', language: 'Portuguese (Brazil)', level: 'B2-', length: 'Long', helper: '500–700 words', values: ['An unexpected discovery during a train journey', 'A conversation between two unlikely friends', 'An unexpected change of plans'], preview: 'Write a reading text in Portuguese (Brazil) for a B2- learner.\nLength: 500–700 words.\nTopic: An unexpected discovery during a train journey.\nFormat: A conversation between two unlikely friends.\nAngle: An unexpected change of plans.\n\nLayout fixture only; these strings do not extend the current runtime catalogs.', dense: true },
];
const neighbors = [['Nature', 'Daily life'], ['Short story', 'Article'], ['An overlooked detail', 'A change of plans']];
const labelNames = ['Topic', 'Format', 'Angle'];
const key = letter => `<span class="keycap" data-letter="${letter}"${'QSOJ'.includes(letter) ? ' data-motion-key="true"' : ''} aria-hidden="true"><img src="../assets/keycap-display.svg" alt=""/><b>${letter}</b></span>`;
const keyGroup = rows => `<div class="keys" aria-hidden="true">${rows.map(row => `<div class="key-row">${[...row].map(key).join('')}</div>`).join('')}</div>`;
for (const sample of cases) {
  const reels = sample.values.map((value, i) => `<div class="reel"><dt>${labelNames[i]}</dt><dd><span class="neighbor" aria-hidden="true">${sample.dense ? '' : neighbors[i][0]}</span><strong>${esc(value)}</strong><span class="neighbor" aria-hidden="true">${sample.dense ? '' : neighbors[i][1]}</span></dd></div>`).join('');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#26343e"/><title>Reading Roulette — Stage 2 artwork review</title><link rel="stylesheet" href="review.css"/></head>
<body><aside class="review-bar"><strong>Stage 2 · Static artwork review · Full keyboard</strong><span>Appearance only. SPIN and Copy are inactive.</span><nav><a href="index.html">Normal</a><a href="long-labels.html">Long fixture</a><a href="#layers">Layer kit</a><a href="assembly-illustration-v3.png">Illustrated direction</a></nav></aside>
<main class="${sample.dense ? 'dense' : ''}"><header><span class="help-appearance">? &nbsp; How to use</span><h1>Reading Roulette</h1><p class="subtitle">Try your luck. Find your next great read.</p></header>
<section class="machine" aria-label="Static machine composition"><div class="settings">
<div class="setting language"><span>Language</span><div class="field">${sample.language}<i aria-hidden="true">▾</i></div><small aria-hidden="true">&nbsp;</small></div>
<div class="setting"><span>CEFR Level</span><div class="field">${sample.level}<i aria-hidden="true">▾</i></div><small aria-hidden="true">&nbsp;</small></div>
<div class="setting"><span>Text Length</span><div class="field">${sample.length}<i aria-hidden="true">▾</i></div><small>${sample.helper}</small></div></div>
<div class="reel-body"><img class="wheel wheel-left" src="../assets/wheel-display.svg" alt="" aria-hidden="true"/><img class="wheel wheel-right" src="../assets/wheel-display.svg" alt="" aria-hidden="true"/><dl class="reels">${reels}</dl></div>
<div class="keyboard">${keyGroup(['QWERT','ASDFG'])}<div class="spin-housing" aria-label="SPIN appearance, inactive"><span class="spin-face"><img src="../assets/spin-face-display.svg" alt="" aria-hidden="true"/><span class="spin-label"><span aria-hidden="true">↻</span> SPIN</span></span></div>${keyGroup(['YUIOP','HJKL'])}<span class="mobile-tab" aria-hidden="true"></span></div></section>
<section class="paper" aria-labelledby="prompt-heading"><h2 id="prompt-heading">Prompt preview</h2><pre>${esc(sample.preview)}</pre><div class="copy-row"><span class="copy-appearance">▢ &nbsp; Copy prompt</span></div><p class="status">✓ &nbsp; Prompt ready. Copy it to your AI chat.</p></section>
<p class="fixture-note">${sample.title}. Static sample text, not buildPrompt output. Resize the viewport to inspect the responsive composition.</p></main>
<section class="layers" id="layers"><h2>Prepared artwork layers</h2><p>The images below are the actual source kit. Transparent areas use a checkerboard for inspection. The illustrated direction is an ImageGen mockup; the composition above uses separate real layers and HTML text.</p><div class="layer-grid">${[{id:'study-background-v1.png',name:'Quiet study background'},...parts.map(p=>({id:p.file,name:p.purpose}))].map(p=>`<figure><a class="asset" href="../assets/${p.id}"><img loading="lazy" src="../assets/${p.id}" alt="${p.name}"/></a><figcaption>${p.name}<br/><a href="../assets/${p.id}">Open full PNG</a></figcaption></figure>`).join('')}</div><p><a href="../ASSETS.md">Asset and animation handoff</a> · <a href="../assets/IMAGEGEN_PROMPTS.md">Generation prompts</a> · <a href="../motion-preview/">Accepted v2 reel prototype</a></p></section></body></html>\n`;
  writeFileSync(path.join(root, sample.file), html);
}
console.log('Saved five lossless SVG display wrappers, asset manifest and two static review pages.');
