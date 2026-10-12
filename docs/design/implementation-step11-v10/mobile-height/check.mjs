// Mobile first-screen geometry and the live SPIN cycle, including Russian labels.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../../..');
const url = process.env.READING_TEST_URL ?? 'http://127.0.0.1:5173/';
const { chromium } = await import(process.env.READING_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.READING_PLAYWRIGHT_MODULE).href : 'playwright');
const browser = await chromium.launch({ headless: true });
const checks = [], errors = [], layouts = [];
const check = (name, passed) => { checks.push({ name, passed }); };
const idle = page => page.waitForFunction(() => document.querySelector('.reading-scene').dataset.spinning === 'false');

async function geometry(page, name, firstScreen = true) {
  await page.evaluate(() => { window.scrollTo(0, 0); });
  const state = await page.evaluate(() => {
    const rect = e => e.getBoundingClientRect().toJSON();
    return {
      viewport: { width: innerWidth, height: innerHeight }, scrollY,
      documentWidth: document.documentElement.scrollWidth,
      spin: rect(document.querySelector('#spin-control')),
      preview: rect(document.querySelector('#prompt-heading')),
      copy: rect(document.querySelector('.copy-appearance')),
      housing: rect(document.querySelector('.compact-housing')),
      drums: rect(document.querySelector('.compact-drums')),
      help: rect(document.querySelector('#help-button')),
      promptFont: parseFloat(getComputedStyle(document.querySelector('#reading-prompt')).fontSize),
      labelFonts: [...document.querySelectorAll('.compact-drums .selected')].map(e => parseFloat(getComputedStyle(e).fontSize) * e.getScreenCTM().a),
      controls: [...document.querySelectorAll('select, #spin-control, #help-button, .locale-trigger, .copy-appearance')].map(e => ({ id: e.id || e.className, ...rect(e) })),
      values: [...document.querySelectorAll('[data-selected-value]')].map(e => e.dataset.selectedValue),
      prompt: document.querySelector('#reading-prompt').textContent,
      copyDisabled: document.querySelector('.copy-appearance').disabled,
    };
  });
  check(`${name}: no horizontal overflow`, state.documentWidth <= state.viewport.width + 1 && state.controls.every(r => r.left >= 0 && r.right <= state.viewport.width + 1));
  check(`${name}: touch targets stay at least 44px`, state.controls.every(r => r.height >= 44));
  check(`${name}: prompt remains at least 16px`, state.promptFont >= 16);
  check(`${name}: selected drum labels remain at least 16px`, state.labelFonts.length === 3 && state.labelFonts.every(size => size >= 16));
  if (firstScreen) {
    check(`${name}: SPIN fully visible without scrolling`, state.scrollY === 0 && state.spin.top >= 0 && state.spin.bottom <= state.viewport.height - 8);
    check(`${name}: Preview and Copy fully visible without scrolling`, state.preview.top >= 0 && state.preview.bottom <= state.viewport.height - 8 && state.copy.bottom <= state.viewport.height - 8);
  }
  layouts.push({ name, ...state });
  return state;
}

try {
  for (const locale of ['en', 'ru']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 600 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
    await page.addInitScript(value => localStorage.setItem('reading-roulette.interface-locale.v1', value), locale);
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    for (const [width, height] of [[320,568],[360,560],[390,600],[412,640],[390,844],[768,1024],[900,700],[844,390]]) {
      await page.setViewportSize({ width, height });
      await geometry(page, `${locale} ${width}x${height}`, height >= 500);
    }
    await page.setViewportSize({ width: 390, height: 600 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const before = await page.locator('#reading-prompt').textContent();
    // tap() must not scroll the button into view to make this test pass.
    const spin = await page.locator('#spin-control').boundingBox();
    check(`${locale}: SPIN tappable in the original viewport`, spin.y + spin.height <= 600);
    await page.touchscreen.tap(spin.x + spin.width / 2, spin.y + spin.height / 2);
    await page.waitForFunction(() => document.querySelectorAll('.drum-track').length === 3);
    const targets = await page.locator('.drum-track').evaluateAll(nodes => nodes.map(n => n.dataset.targetValue));
    check(`${locale}: prompt waits while drums move`, await page.locator('#reading-prompt').textContent() === before && await page.locator('.copy-appearance').isDisabled());
    for (let n = 0; n < 8; n++) await page.touchscreen.tap(spin.x + spin.width / 2, spin.y + spin.height / 2);
    await idle(page);
    const result = await geometry(page, `${locale} after rapid taps`);
    check(`${locale}: all three prepared results land together`, JSON.stringify(result.values) === JSON.stringify(targets));
    check(`${locale}: prompt matches all three labels and Copy is enabled`, result.values.length === 3 && result.values.every(value => result.prompt.includes(value)) && !result.copyDisabled);
    await page.screenshot({ path: path.join(dir, `mobile-${locale}-390x600.png`) });

    // Height changes represent expanded/collapsed mobile browser bars.
    await page.locator('#spin-control').tap();
    const resizeTargets = await page.locator('.drum-track').evaluateAll(nodes => nodes.map(n => n.dataset.targetValue));
    await page.setViewportSize({ width: 390, height: 540 });
    await idle(page);
    const resized = await geometry(page, `${locale} browser bars resize`);
    check(`${locale}: viewport resize completes the prepared result`, JSON.stringify(resized.values) === JSON.stringify(resizeTargets) && !resized.copyDisabled);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.screenshot({ path: path.join(dir, `mobile-${locale}-320x568.png`) });
    await page.setViewportSize({ width: 360, height: 560 });
    await page.screenshot({ path: path.join(dir, `mobile-${locale}-360x560.png`) });
    await page.locator('#help-button').tap();
    check(`${locale}: smaller help button opens the dialog`, await page.locator('#reading-help-dialog').evaluate(e => e.open));
    await page.keyboard.press('Escape');
    check(`${locale}: help returns focus`, await page.locator('#help-button').evaluate(e => document.activeElement === e));
    await context.close();
  }

  // Render every compact label through the real component and measure glyphs.
  const server = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  let markup;
  try {
    const [{ DrumLabel }, { topics }, { formats }, { angles }, { catalogLabel }] = await Promise.all([
      server.ssrLoadModule('/src/components/scene/DrumLabel.tsx'), server.ssrLoadModule('/src/data/topics.ts'),
      server.ssrLoadModule('/src/data/formats.ts'), server.ssrLoadModule('/src/data/angles.ts'), server.ssrLoadModule('/src/i18n/catalogs.ru.ts'),
    ]);
    markup = ['en', 'ru'].flatMap(locale => [...topics, ...formats, ...angles].map(item => renderToStaticMarkup(createElement(DrumLabel, { label: catalogLabel(item, locale), x: 180, y: 55, selected: true, compact: true })))).join('');
  } finally { await server.close(); }
  const measuring = await browser.newPage();
  const labels = await measuring.evaluate(html => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position:absolute;visibility:hidden;font-family:Georgia,"Times New Roman",serif;font-weight:700');
    svg.innerHTML = html;
    document.body.append(svg);
    return [...svg.querySelectorAll('text')].map(e => {
      const { x, y, width, height } = e.getBBox();
      return { label: e.getAttribute('aria-label'), lines: e.children.length, x, y, width, height };
    });
  }, markup);
  check('All 200 English/Russian selected labels fit the smaller animation windows', labels.length === 200 && labels.every(r => r.x >= 24 && r.x + r.width <= 336 && r.y >= 24 && r.y + r.height <= 72));
  fs.writeFileSync(path.join(dir, 'label-bounds.json'), JSON.stringify(labels, null, 2) + '\n');

  const desktop = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await desktop.goto(url);
  await desktop.evaluate(() => document.fonts.ready);
  check('Desktop still uses the original machine', await desktop.locator('.compact-machine').count() === 0 && await desktop.locator('.spin-control button').count() === 1);
  await desktop.screenshot({ path: path.join(dir, 'desktop-1366.png') });
  check('No browser errors', errors.length === 0);
  const failed = checks.filter(c => !c.passed);
  const report = { date: '2026-10-12', url, browser: browser.version(), checksPassed: checks.length - failed.length, failed, errors, layouts, limits: ['Touch and reduced visible height are emulated, not a physical Android device'] };
  fs.writeFileSync(path.join(dir, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: report.checksPassed, failed, layouts: layouts.map(({ name, spin, preview, copy, viewport }) => ({ name, height: viewport.height, spinBottom: spin.bottom, previewBottom: preview.bottom, copyBottom: copy.bottom })), labelFailures: labels.filter(r => r.x < 24 || r.x + r.width > 336 || r.y < 24 || r.y + r.height > 72), errors }, null, 2));
  assert.equal(failed.length, 0, 'Mobile geometry and behavior checks');
} finally { await browser.close(); }
