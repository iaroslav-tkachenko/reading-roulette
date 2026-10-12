import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
const dir = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(dir, 'verification', process.env.READING_TEST_URL?.includes('/reading-roulette/') ? 'production' : '')
fs.mkdirSync(out, { recursive: true })
const { chromium } = await import(process.env.READING_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.READING_PLAYWRIGHT_MODULE).href : 'playwright')
const browser = await chromium.launch({ headless: true })
const checks = [], layouts = [], errors = []
const ssr = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
let labelMarkup
try {
 const { DrumLabel } = await ssr.ssrLoadModule('/src/components/scene/DrumLabel.tsx')
 const { catalogLabelsRu } = await ssr.ssrLoadModule('/src/i18n/catalogLabels.ru.ts')
 labelMarkup = renderToStaticMarkup(createElement('svg', { viewBox: '0 0 1536 800' }, [false, true].flatMap(compact => Object.entries(catalogLabelsRu).map(([id,label]) => createElement('g', { key: id + compact, 'data-label-check': id, 'data-compact': compact }, createElement(DrumLabel, { label, x: 505, y: 489, selected: true, compact }))))))
} finally { await ssr.close() }
const check = (name, value = true) => { assert.ok(value, name); checks.push(name) }
const url = process.env.READING_TEST_URL ?? 'http://127.0.0.1:5173/'
try {
 const context = await browser.newContext({ viewport: { width: 1366, height: 1000 } })
 // Exercise the real browser click and feedback path without touching the OS clipboard.
 await context.addInitScript(() => {
  window.testCopiedPrompts = []
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.testCopiedPrompts.push(text) } } })
 })
 const page = await context.newPage()
 page.on('pageerror', error => errors.push(error.message))
 page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
 await page.goto(url)
 await page.locator('#spin-control').waitFor()
 await page.evaluate(() => document.fonts.ready)
 const locale = () => page.locator('.locale-trigger')
 const prompt = () => page.locator('#reading-prompt').textContent()
 const choose = async value => {
  await locale().click()
  await page.getByRole('listbox').getByRole('option', { name: value === 'ru' ? 'Русский' : 'English', exact: true }).click()
  await page.waitForFunction(expected => document.documentElement.lang === expected, value)
 }
 const idle = () => page.waitForFunction(() => document.querySelector('.reading-scene').dataset.spinning === 'false')
 assert.equal(await page.locator('html').getAttribute('lang'), 'en')
 const original = await prompt()
 const settings = await page.locator('select').evaluateAll(nodes => nodes.map(node => node.value))
 await choose('ru')
 check('First visit defaults EN; selecting RU translates the existing prompt immediately', (await prompt()).includes('на английском языке') && (await prompt()).includes('Полезная лексика'))
 assert.deepEqual(await page.locator('select').evaluateAll(nodes => nodes.map(node => node.value)), settings)
 check('Reading language, CEFR and length survive a locale switch')
 assert.equal(await page.locator('.locale-trigger:focus').count(), 1)
 await locale().click()
 await page.keyboard.press('ArrowUp')
 assert.equal(await page.locator('html').getAttribute('lang'), 'ru')
 await page.keyboard.press('Escape')
 assert.equal(await page.getByRole('listbox').count(), 0)
 assert.equal(await page.locator('.locale-trigger:focus').count(), 1)
 check('Arrow navigation does not select; Escape closes and restores trigger focus')
 await locale().click(); await page.keyboard.press('Tab')
 await page.waitForFunction(() => !document.querySelector('[role="listbox"]'))
 check('Tab exits the dropdown and closes it')
 await page.getByRole('button', { name: 'Копировать промпт', exact: true }).click()
 await page.waitForFunction(() => document.querySelector('#copy-status').textContent.includes('Промпт скопирован'))
 assert.equal(await page.evaluate(() => window.testCopiedPrompts.at(-1)), await prompt())
 check('Copy click passes the exact RU preview to the injected clipboard writer')
 await choose('en')
 assert.equal(await prompt(), original)
 check('EN → RU → EN preserves the exact original idea and English prompt')
 await choose('ru')
 await page.locator('#help-button').click()
 assert.equal(await page.getByRole('dialog').isVisible(), true)
 assert.ok((await page.getByRole('dialog').textContent()).includes('Читайте увереннее'))
 await page.keyboard.press('Escape')
 assert.equal(await page.locator('#help-button:focus').count(), 1)
 check('Russian modal help opens, closes with Escape and restores focus')
 await page.locator('#reading-language').selectOption('ru')
 assert.ok((await prompt()).includes('на русском языке'))
 assert.ok((await prompt()).includes('краткое простое определение'))
 check('RU reading language requests Russian definitions instead of self-translation')
 await page.locator('#reading-language').selectOption('en')
 await page.locator('#reading-cefr').selectOption('A1')
 assert.equal(await page.locator('.copy-appearance').isDisabled(), true)
 await choose('en'); await choose('ru')
 assert.equal(await page.locator('.copy-appearance').isDisabled(), true)
 assert.ok((await prompt()).includes('Нажмите КРУТИТЬ'))
 check('A cleared incompatible result stays empty and translates its SPIN request')
 await page.locator('#spin-control').click()
 assert.equal(await locale().isDisabled(), true)
 await idle()
 assert.equal(await locale().isDisabled(), false)
 assert.ok((await prompt()).includes('на английском языке'))
 const labels = await page.locator('[data-drum-field]').evaluateAll(nodes => nodes.map(node => node.dataset.selectedValue))
 check('SPIN locks locale and commits Russian labels/prompt together', labels.length === 3 && labels.every(label => /[А-Яа-яЁё]/.test(label)))
 await page.reload(); await page.locator('#spin-control').waitFor()
 assert.equal(await page.locator('html').getAttribute('lang'), 'ru')
 assert.ok((await prompt()).includes('на английском языке'))
 check('Reload restores RU while preserving the independent initial reading language')
 const caption = await page.locator('#spin-caption text').evaluate(node => { const box = node.getBBox(); return { x: box.x, right: box.x + box.width } })
 check('Russian SPIN lettering fits inside the fixed button face', caption.x >= 740 && caption.right <= 918)
 const labelBoxes = await page.evaluate(markup => {
  const host = document.createElement('div')
  host.style.cssText = 'position:absolute;left:-3000px;top:0;width:1536px'
  host.innerHTML = markup; document.body.append(host)
  const boxes = [...host.querySelectorAll('[data-label-check]')].map(node => { const b = node.getBBox(); return { id: node.dataset.labelCheck, compact: node.dataset.compact === 'true', width: b.width, height: b.height } })
  host.remove(); return boxes
 }, labelMarkup)
 assert.equal(labelBoxes.length, 200)
 assert.ok(labelBoxes.every(box => box.width <= (box.compact ? 312 : 234) && box.height <= (box.compact ? 48 : 74)), JSON.stringify(labelBoxes.filter(box => box.width > (box.compact ? 312 : 234) || box.height > (box.compact ? 48 : 74))))
 check('All 100 Russian catalog labels fit desktop and compact selected-label renderers without clipping')
 for (const width of [320, 390, 768, 901, 1024, 1280, 1366, 1920]) {
  await page.setViewportSize({ width, height: 1000 })
  await idle()
  const state = await page.evaluate(() => {
   const boxes = [...document.querySelectorAll('.locale-trigger,#help-button,.copy-appearance,select')].map(node => {
    const r = node.getBoundingClientRect()
    return { name: node.id || node.className, x: r.x, right: r.right, width: r.width, height: r.height }
   })
   return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, boxes }
  })
  assert.ok(state.scrollWidth <= width + 1, JSON.stringify(state))
  assert.ok(state.boxes.every(box => box.x >= -1 && box.right <= width + 1 && box.height >= (width < 900 ? 43 : 20)), JSON.stringify(state))
  await locale().click()
  const menu = await page.getByRole('listbox').boundingBox()
  assert.ok(menu.x >= 0 && menu.x + menu.width <= width, JSON.stringify(menu))
  await page.screenshot({ path: path.join(out, 'ru-' + width + '-menu.png') })
  await page.keyboard.press('Escape')
  await page.screenshot({ path: path.join(out, 'ru-' + width + '.png') })
  layouts.push(state)
 }
 check('RU controls and dropdown fit eight widths from 320 to 1920 without horizontal overflow')
 await page.setViewportSize({ width: 1366, height: 1000 }); await choose('en')
 await page.screenshot({ path: path.join(out, 'en-desktop.png') })
 await page.emulateMedia({ reducedMotion: 'reduce' }); await page.locator('#spin-control').click()
 await idle(); assert.equal(await locale().isDisabled(), false)
 check('Reduced motion completes a spin and leaves locale available')
 const denied = await browser.newContext()
 await denied.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage denied') } }))
 const deniedPage = await denied.newPage(); await deniedPage.goto(url); await deniedPage.locator('#spin-control').waitFor()
 assert.equal(await deniedPage.locator('html').getAttribute('lang'), 'en')
 await deniedPage.locator('.locale-trigger').click()
 await deniedPage.getByRole('listbox').getByRole('option', { name: 'Русский', exact: true }).click()
 await deniedPage.waitForFunction(() => document.documentElement.lang === 'ru')
 check('Denied localStorage still permits EN/RU in the current tab')
 await denied.close()
 assert.deepEqual(errors, [])
 check('No browser page/console errors')
 const report = { date: '2026-10-12', url, checks, layouts, labelBoxes, clipboard: 'Injected writer; system clipboard untouched', browser: 'Isolated headless Chromium; in-app Browser unavailable with EPERM', notVerified: ['Physical mobile devices', 'Screen reader', 'System clipboard', 'Native browser zoom', 'Public deployment'] }
 fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 2) + '\n')
 console.log(JSON.stringify({ ...report, layouts: layouts.map(x => x.width), labelBoxes: labelBoxes.length }, null, 2))
} finally { await browser.close() }
