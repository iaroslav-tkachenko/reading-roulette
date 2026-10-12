import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const out = path.resolve(process.env.READING_TEST_OUTPUT_DIR ?? 'docs/design/drum-label-fit-2026-10-12')
fs.mkdirSync(out, { recursive: true })
const { chromium } = await import(pathToFileURL(process.env.READING_PLAYWRIGHT_MODULE).href)
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1536, height: 1100 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(process.env.READING_FIXTURE_URL ?? 'http://127.0.0.1:5179/docs/design/drum-label-fit-2026-10-12/fixtures.html')
  await page.locator('#all-labels text').first().waitFor({ state: 'attached' })
  await page.evaluate(() => document.fonts.ready)
  const results = await page.locator('#all-labels text').evaluateAll(nodes => nodes.map(text => {
    const box = text.getBBox()
    return {
      label: text.getAttribute('aria-label'), locale: text.parentElement.dataset.locale,
      selected: text.classList.contains('selected'), compact: text.parentElement.dataset.compact === 'true',
      angle: text.parentElement.dataset.angle === 'true',
      lines: [...text.children].map(e => e.textContent), width: box.width, height: box.height,
      fontSize: parseFloat(getComputedStyle(text).fontSize),
    }
  }))
  const failures = results.filter(r => r.width > (r.compact ? 312 : r.selected ? r.angle ? 164 : 184 : 210) + 0.5 || r.lines.length > 2 || (r.compact && r.height > 48))
  for (let index = 0; index < 6; index++) {
    await page.locator('.fixture-scene').nth(index).scrollIntoViewIfNeeded()
    const box = await page.locator('.fixture-scene').nth(index).boundingBox()
    await page.screenshot({ path: path.join(out, `example-${index + 1}.png`), clip: { x: 290, y: box.y + 190, width: 960, height: 420 } })
  }
  await page.goto(process.env.READING_TEST_URL ?? 'http://127.0.0.1:5178/reading-roulette/')
  await page.locator('button#spin-control').waitFor()
  await page.locator('button#spin-control').click()
  await page.waitForFunction(() => document.querySelector('.reading-scene').dataset.spinning === 'true')
  const moving = await page.locator('[data-moving-drum] .selected').evaluateAll(nodes => nodes.map(text => ({
    width: text.getBBox().width, angle: text.closest('[data-moving-drum]').dataset.movingDrum === 'angle',
  })))
  assert(moving.length >= 3 && moving.every(r => r.width <= (r.angle ? 164 : 184) + 0.5), JSON.stringify(moving))
  await page.waitForFunction(() => document.querySelector('.reading-scene').dataset.spinning === 'false')
  const values = await page.locator('[data-selected-value]').evaluateAll(nodes => nodes.map(e => e.dataset.selectedValue))
  const prompt = await page.locator('#reading-prompt').textContent()
  assert(values.every(value => prompt.includes(value)))
  const layouts = []
  for (const locale of ['en', 'ru']) {
    if (locale === 'ru') {
      await page.locator('.locale-trigger').click()
      await page.getByRole('option', { name: 'Русский', exact: true }).click()
    }
    for (const width of [320, 390, 900, 901, 1366, 1536, 1920]) {
      await page.setViewportSize({ width, height: 1100 })
      await page.waitForFunction(compact => !!document.querySelector('.compact-machine') === compact, width <= 900)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
      assert.equal(overflow, false)
      layouts.push({ locale, width, overflow })
    }
  }
  assert.equal(errors.length, 0)
  fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify({ cases: results.length, failures, spinAndPrompt: 'passed', movingRows: moving.length, layouts, errors, results }, null, 2) + '\n')
  console.log(JSON.stringify({ cases: results.length, failures, spinAndPrompt: 'passed', movingRows: moving.length, layouts: layouts.length, errors }, null, 2))
  assert.equal(results.length, 600)
  assert.equal(failures.length, 0)
} finally { await browser.close() }
