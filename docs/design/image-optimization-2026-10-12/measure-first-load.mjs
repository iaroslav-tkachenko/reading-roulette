import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const reportDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(reportDir, '../../..');
const outputDir = path.resolve(process.argv[2] ?? path.join(reportDir, 'before'));
const label = process.argv[3] ?? 'capture';
const playwrightPath = process.env.READING_PLAYWRIGHT_MODULE;
const { chromium } = await import(playwrightPath ? pathToFileURL(playwrightPath).href : 'playwright');
fs.mkdirSync(outputDir, { recursive: true });

let previewServer;
let url = process.env.READING_TEST_URL;
if (process.env.READING_BUILD_DIR) {
  const { preview } = await import('vite');
  previewServer = await preview({
    root: projectRoot,
    configFile: path.join(projectRoot, 'vite.config.ts'),
    base: '/reading-roulette/',
    build: { outDir: path.resolve(projectRoot, process.env.READING_BUILD_DIR) },
    preview: { host: '127.0.0.1', port: 0 },
  });
  const address = previewServer.httpServer.address();
  url = `http://127.0.0.1:${address.port}/reading-roulette/`;
}
url ??= 'http://127.0.0.1:4173/reading-roulette/';

const browser = await chromium.launch({ headless: true });
const profiles = [
  { name: 'desktop', viewport: { width: 1536, height: 900 }, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
];
const report = { label, url, cache: 'new Chromium context per run, Network.setCacheDisabled=true', chromium: browser.version(), profiles: [] };

for (const profile of profiles) {
  const runs = [];
  for (let run = 1; run <= 3; run += 1) {
    const context = await browser.newContext({ viewport: profile.viewport, deviceScaleFactor: profile.deviceScaleFactor });
    await context.addInitScript(() => { Math.random = () => 0.3141592653589793; });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const pageErrors = [];
    const requestFailures = [];
    const httpErrors = [];
    const webpResponses = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(message.text()); });
    page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
    page.on('response', (response) => {
      const entry = { url: response.url(), status: response.status(), contentType: response.headers()['content-type'] ?? '' };
      if (entry.status >= 400) httpErrors.push(entry);
      if (/\.webp$/i.test(new URL(entry.url).pathname)) webpResponses.push(entry);
    });
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    const measured = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource').map((entry) => ({
        name: entry.name.split('/').at(-1),
        transferBytes: entry.transferSize,
        encodedBodyBytes: entry.encodedBodySize,
        decodedBodyBytes: entry.decodedBodySize,
        durationMs: Math.round(entry.duration * 10) / 10,
      }));
      const images = resources.filter((entry) => /\.(png|webp)(?:\?|$)/i.test(entry.name));
      const paints = Object.fromEntries(performance.getEntriesByType('paint').map((entry) => [entry.name, Math.round(entry.startTime * 10) / 10]));
      return {
        responseStartMs: Math.round(nav.responseStart * 10) / 10,
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd * 10) / 10,
        loadEventMs: Math.round(nav.loadEventEnd * 10) / 10,
        firstPaintMs: paints['first-paint'] ?? null,
        firstContentfulPaintMs: paints['first-contentful-paint'] ?? null,
        documentTransferBytes: nav.transferSize,
        resourceCount: resources.length,
        transferBytes: resources.reduce((sum, entry) => sum + entry.transferBytes, 0),
        firstLoadTransferBytes: nav.transferSize + resources.reduce((sum, entry) => sum + entry.transferBytes, 0),
        decodedBodyBytes: resources.reduce((sum, entry) => sum + entry.decodedBodyBytes, 0),
        imageRequestCount: images.length,
        imageTransferBytes: images.reduce((sum, entry) => sum + entry.transferBytes, 0),
        imageDecodedBodyBytes: images.reduce((sum, entry) => sum + entry.decodedBodyBytes, 0),
        resources,
      };
    });
    const webpMimeErrors = webpResponses.filter((entry) => entry.status !== 200 || !/image\/webp/i.test(entry.contentType));
    runs.push({ run, ...measured, pageErrors, requestFailures, httpErrors, webpResponseCount: webpResponses.length, webpMimeErrors });
    if (pageErrors.length || requestFailures.length || httpErrors.length || webpMimeErrors.length) {
      throw new Error(`${profile.name} run ${run} has load errors: ${JSON.stringify({ pageErrors, requestFailures, httpErrors, webpMimeErrors })}`);
    }

    if (run === 1) {
      const fullPath = path.join(outputDir, `${label}-${profile.name}-full.png`);
      const viewportPath = path.join(outputDir, `${label}-${profile.name}-viewport.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      await page.screenshot({ path: viewportPath, fullPage: false });
    }
    await context.close();
  }

  const median = (key) => [...runs.map((run) => run[key])].sort((a, b) => a - b)[1];
  report.profiles.push({
    name: profile.name,
    viewport: profile.viewport,
    deviceScaleFactor: profile.deviceScaleFactor,
    runs,
    median: Object.fromEntries(['responseStartMs', 'domContentLoadedMs', 'loadEventMs', 'firstPaintMs', 'firstContentfulPaintMs', 'documentTransferBytes', 'transferBytes', 'firstLoadTransferBytes', 'decodedBodyBytes', 'imageTransferBytes', 'imageDecodedBodyBytes'].map((key) => [key, median(key)])),
  });
}

await browser.close();
if (previewServer) await previewServer.close();
const reportPath = path.join(outputDir, `${label}-first-load.json`);
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Saved ${reportPath}`);
