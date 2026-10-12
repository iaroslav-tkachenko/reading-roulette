import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
const root = fileURLToPath(new URL('../../', import.meta.url))
const out = process.env.READING_TEST_OUTPUT_DIR ? path.resolve(process.env.READING_TEST_OUTPUT_DIR) : path.join(root, 'docs/localization/verification')
fs.mkdirSync(out, { recursive: true })
const reactSsrShim = path.join(root, 'docs/localization/react-ssr-shim.mjs')
const server = await createServer({
 root,
 resolve: { alias: [
  { find: /^react$/, replacement: reactSsrShim },
  { find: /^react\/(?:jsx-runtime|jsx-dev-runtime)$/, replacement: reactSsrShim },
 ] },
 server: { middlewareMode: true, hmr: false, ws: false },
 appType: 'custom',
})
const api = {}
const names = ['i18n/locale', 'i18n/messages', 'i18n/catalogs.ru', 'i18n/catalogLabels.ru', 'i18n/textLength', 'i18n/promptResources.ru', 'random/compatibility', 'data/cefrLevels', 'data/languages', 'data/textLengths', 'data/catalogStats', 'motion/drumSpinController', 'clipboard/promptCopier', 'prompt/buildPrompt', 'components/scene/drumData']
try {
 for (const name of names) Object.assign(api, await server.ssrLoadModule('/src/' + name + '.ts'))
 const initial = await server.ssrLoadModule('/src/components/scene/initialReading.ts')
 const { LocaleContext } = await server.ssrLoadModule('/src/i18n/LocaleContext.tsx')
 const { MachineScene } = await server.ssrLoadModule('/src/components/scene/MachineScene.tsx')
 const { PromptSheet } = await server.ssrLoadModule('/src/components/scene/PromptSheet.tsx')
 const { HowToUse } = await server.ssrLoadModule('/src/components/HowToUse.tsx')
 const { InterfaceLanguageSelect } = await server.ssrLoadModule('/src/components/InterfaceLanguageSelect.tsx')
 const { readingCatalogs, topicsRu, formatsRu, anglesRu, buildPrompt, languages, cefrLevels, textLengths, getTextLength, localizedTextLength, catalogLabelsRu } = api
 const checks = []
 const check = (name, condition = true) => { assert.ok(condition, name); checks.push(name) }
 assert.deepEqual(Object.keys(api.en).sort(), Object.keys(api.ru).sort())
 for (const key of Object.keys(api.en)) {
  const slots = text => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort()
  assert.deepEqual(slots(api.en[key]), slots(api.ru[key]), key)
  assert.ok(api.ru[key].trim())
 }
 check('All UI keys and interpolation slots match EN/RU')
 let catalogFields = 0
 const ids = []
 for (const [name, translated, fields] of [['topics', topicsRu, ['label','promptHint','simpleFocus']], ['formats', formatsRu, ['label','promptHint','registerHint']], ['angles', anglesRu, ['label','promptHint','simpleAction']]]) {
  assert.deepEqual(Object.keys(translated).sort(), readingCatalogs[name].map(x => x.id).sort())
  for (const entry of readingCatalogs[name]) {
   ids.push(entry.id)
   for (const field of fields) {
    assert.ok(/[А-Яа-яЁё]/.test(translated[entry.id][field]), entry.id + '/' + field)
    assert.ok(!/[a-z]{3,}/i.test(translated[entry.id][field].replaceAll('CEFR','').replaceAll('{focus}','')), entry.id + '/' + field)
    catalogFields++
   }
   if (name === 'topics') {
    assert.deepEqual(Object.keys(translated[entry.id].disclosures), Object.keys(entry.disclosures))
    for (const disclosure of Object.values(translated[entry.id].disclosures)) { assert.ok(/[А-Яа-яЁё]/.test(disclosure)); catalogFields++ }
   }
   if (name === 'angles') assert.equal((translated[entry.id].simpleAction.match(/\{focus\}/g) ?? []).length, 1)
  }
 }
 assert.deepEqual(Object.keys(catalogLabelsRu).sort(), ids.sort())
 assert.equal(catalogFields, 419)
 check('All 419 catalog text fields, 100 labels and 119 disclosure profiles have Russian text')
 let prompts = 0, cells = 0
 const uniqueIdeas = new Set()
 const coverage = { topics: new Set(), formats: new Set(), angles: new Set(), models: new Set(), statuses: new Set() }
 for (const cefrLevel of Object.keys(cefrLevels)) for (const textLength of Object.keys(textLengths)) {
  const baseSettings = { language: languages[0], cefrLevel, textLength }
  const allowed = api.enumerateCombinations(baseSettings)
  const representatives = new Map()
  for (const combination of allowed) {
   uniqueIdeas.add([combination.topic.id, combination.format.id, combination.angle.id].join('/'))
   const prompt = buildPrompt(baseSettings, combination, 'ru')
   assert.ok(prompt.includes('на английском языке'))
   assert.ok(prompt.includes('«Полезная лексика»'))
   assert.ok(!/\{\w+\}/.test(prompt))
   assert.ok(!/[a-z]{3,}/i.test(prompt.replaceAll('CEFR','').replaceAll('URL','')), combination.format.id)
   const expected = getTextLength(baseSettings, combination.format)
   if (expected.wordRange) assert.ok(prompt.includes(expected.wordRange))
   for (const field of ['topic','format','angle']) coverage[field + 's'].add(combination[field].id)
   coverage.models.add(combination.format.volumeModel); coverage.statuses.add(combination.format.contentStatus)
   representatives.set(combination.format.id, combination)
   prompts++
  }
  for (const language of languages) {
   cells++
   for (const combination of representatives.values()) {
    const settings = { ...baseSettings, language }
    const prompt = buildPrompt(settings, combination, 'ru')
    const ruLength = localizedTextLength(settings, combination.format, 'ru')
    const enLength = getTextLength(settings, combination.format)
    assert.equal(ruLength.wordRange, enLength.wordRange)
    assert.equal(ruLength.profile, enLength.profile)
    assert.ok(prompt.includes(api.readingLanguagePhrase(language.code)))
    assert.ok(prompt.includes(language.code === 'ru' ? 'краткое простое определение' : 'краткий перевод'))
    if (language.lengthUnit === 'structure' && !['form-fields','list-items'].includes(combination.format.volumeModel)) assert.equal(ruLength.wordRange, null)
    prompts++
   }
  }
 }
 assert.deepEqual(Object.values(coverage).map(set => set.size), [26,44,30,8,4])
 assert.equal(uniqueIdeas.size, api.readingIdeaCount)
 check('Reading-idea count equals the union of eligible topic/format/angle triples without multiplying settings or languages')
 check('RU covers every eligible tuple across 45 level/length settings, all languages and every conditional model/status')
 assert.equal(cells, 495)
 const initialSnapshot = { interfaceLocale: 'en', settings: initial.initialSettings, combination: initial.initialCombination, prompt: buildPrompt(initial.initialSettings, initial.initialCombination), revision: 0, spinCount: 0 }
 let selections = 0
 const controller = api.createDrumSpinController(initialSnapshot, () => {}, () => { selections++; return initial.initialCombination })
 assert.equal(controller.changeInterfaceLocale('ru'), true)
 const russian = controller.getState().snapshot
 assert.deepEqual(russian.settings, initialSnapshot.settings)
 assert.deepEqual(russian.combination, initialSnapshot.combination)
 assert.equal(russian.prompt, buildPrompt(russian.settings, russian.combination, 'ru'))
 assert.equal(russian.spinCount, 0); assert.equal(russian.revision, 1); assert.equal(selections, 0)
 assert.equal(controller.changeInterfaceLocale('ru'), false)
 assert.equal(controller.getState().snapshot, russian)
 controller.start()
 assert.equal(controller.changeInterfaceLocale('en'), false)
 const running = controller.getState().run
 assert.ok(running.drums.every(drum => drum.rows.every(row => !/[a-z]{3,}/i.test(row.label))))
 controller.finish(running.id)
 assert.equal(controller.getState().snapshot.interfaceLocale, 'ru')
 assert.equal(controller.changeInterfaceLocale('en'), true)
 check('Locale switches preserve settings/IDs without selection; same-locale and active-run events are ignored')
 const empty = api.createDrumSpinController(initialSnapshot, () => {})
 empty.changeSettings({ ...initial.initialSettings, cefrLevel: 'A1' })
 assert.equal(empty.getState().snapshot.combination, null)
 const reason = empty.getState().failure
 empty.changeInterfaceLocale('ru')
 assert.equal(empty.getState().snapshot.prompt, '')
 assert.deepEqual(empty.getState().failure, reason)
 check('Empty result remains empty with the same typed cause after switching locale')
 const broken = api.createDrumSpinController(initialSnapshot, () => {}, undefined, (...args) => { if (args[2] === 'ru') throw new Error('test'); return buildPrompt(...args) })
 assert.equal(broken.changeInterfaceLocale('ru'), false)
 assert.equal(broken.getState().snapshot, initialSnapshot)
 check('Failed rebuild preserves the last consistent locale/prompt snapshot')
 let resolve, writes = [], statuses = []
 const copier = api.createPromptCopier(status => statuses.push(status), text => { writes.push(text); return new Promise(done => { resolve = done }) })
 copier.reset(initialSnapshot.prompt)
 const pending = copier.copy()
 copier.reset(russian.prompt); copier.reset(initialSnapshot.prompt)
 resolve(); await pending
 assert.equal(statuses.at(-1), 'idle')
 copier.reset(russian.prompt); const next = copier.copy(); resolve(); await next
 assert.equal(writes.at(-1), russian.prompt); assert.equal(statuses.at(-1), 'success')
 check('EN/RU/EN invalidates stale clipboard replies; a new copy uses the exact Russian preview')
 const storage = new Map()
 const adapter = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }
 assert.equal(api.readLocalePreference(adapter), 'en')
 api.saveLocalePreference('ru', adapter); assert.equal(api.readLocalePreference(adapter), 'ru')
 adapter.setItem(api.localePreferenceKey, 'invalid'); assert.equal(api.readLocalePreference(adapter), 'en')
 assert.equal(api.readLocalePreference({ getItem() { throw new Error('blocked') } }), 'en')
 assert.doesNotThrow(() => api.saveLocalePreference('ru', { setItem() { throw new Error('blocked') } }))
 check('Storage defaults, recovery, validation and denied access are safe')
 const wrap = component => createElement(LocaleContext, { value: 'ru' }, component)
 for (const compact of [false, true]) {
  const markup = renderToStaticMarkup(wrap(createElement(MachineScene, { compact, settings: initialSnapshot.settings, combination: initialSnapshot.combination, onSpin() {}, onSettingsChange() {} })))
  for (const text of ['Язык текста','Путешествия','Рассказ из жизни','Неожиданное открытие','КРУТИТЬ']) assert.ok(markup.toLowerCase().includes(text.toLowerCase()), text)
  assert.ok(!markup.includes('Try your luck'))
 }
 const sheet = renderToStaticMarkup(wrap(createElement(PromptSheet, { prompt: russian.prompt })))
 assert.ok(sheet.includes('Копировать промпт')); assert.ok(sheet.includes('lang="ru"'))
 const help = renderToStaticMarkup(wrap(createElement(HowToUse, { open: false, onClose() {}, returnFocusRef: { current: null } })))
 assert.ok(help.includes('Читайте увереннее')); assert.ok(help.replace(/[\s,]/g, '').includes('4300+')); assert.ok(help.includes('Идей для чтения'))
 const select = renderToStaticMarkup(wrap(createElement(InterfaceLanguageSelect, { busy: false, closeSignal: '', onChange() {} })))
 assert.ok(select.includes('Язык интерфейса: Русский')); assert.ok(select.includes('aria-haspopup="listbox"'))
 check('Both scene layouts, help, prompt and selector render Russian semantic markup')
 fs.writeFileSync(path.join(out, 'sample-prompt.ru.txt'), russian.prompt + '\n')
 fs.writeFileSync(path.join(out, 'sample-prompt.en.txt'), initialSnapshot.prompt + '\n')
 const report = { date: '2026-10-12', checks, catalogFields, readingIdeas: uniqueIdeas.size, russianPrompts: prompts, readingSettings: cells, coverage: Object.fromEntries(Object.entries(coverage).map(([key,set]) => [key,set.size])), browser: 'SSR only; real browser is checked separately' }
 fs.writeFileSync(path.join(out, 'automated.json'), JSON.stringify(report, null, 2) + '\n')
 console.log(JSON.stringify(report, null, 2))
} finally { await server.close() }
