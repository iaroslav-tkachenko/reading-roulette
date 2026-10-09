import { languages } from '../../../src/data/languages'
import { cefrLevels } from '../../../src/data/cefrLevels'
import { textLengths } from '../../../src/data/textLengths'
import { topics } from '../../../src/data/topics'
import { formats } from '../../../src/data/formats'
import { angles } from '../../../src/data/angles'
import { buildPrompt } from '../../../src/prompt/buildPrompt'
import { selectReadingCombination } from '../../../src/random/selectReadingCombination'
import type { CefrLevel, ReadingCombination, ReadingSettings, TextLength } from '../../../src/types/reading'

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id)
  if (!found) throw new Error(`Missing preview element: ${id}`)
  return found as T
}

const language = element<HTMLSelectElement>('language')
const level = element<HTMLSelectElement>('level')
const length = element<HTMLSelectElement>('length')
const spin = element<HTMLButtonElement>('spin')
const copy = element<HTMLButtonElement>('copy')
const preview = element<HTMLTextAreaElement>('prompt')
const longTest = element<HTMLInputElement>('long-test')
const reduceTest = element<HTMLInputElement>('reduce-test')
const reelGrid = element('reels')
const semanticResult = element('semantic-result')
const status = element('visible-status')
const announce = element('announce')
const metric = element<HTMLOutputElement>('review-metric')
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)')

function options(select: HTMLSelectElement, rows: readonly (readonly [string, string])[]) {
  select.replaceChildren(...rows.map(([value, label]) => new Option(label, value)))
}
options(language, languages.map(item => [item.code, item.name]))
options(level, Object.keys(cefrLevels).map(item => [item, item]))
options(length, Object.entries(textLengths).map(([value, item]) => [value, item.label]))
language.value = 'en'
level.value = 'B1+'
length.value = 'medium'

let current: ReadingCombination = { topic: topics[1], format: formats[1], angle: angles[0] }
let settings: ReadingSettings
let prompt = ''
let spinId = 0
let copyId = 0
let copyPending = false
let spinCount = 0
let active: null | {
  id: number; next: ReadingCombination; nextPrompt: string; started: number;
  animations: Animation[]; timer?: ReturnType<typeof setTimeout>; draws: number
} = null

const definitions = [
  { key: 'topic', title: 'Topic', catalog: topics, n: 4, cruise: 400, duration: 1000 },
  { key: 'format', title: 'Format', catalog: formats, n: 5, cruise: 600, duration: 1200 },
  { key: 'angle', title: 'Angle', catalog: angles, n: 6, cruise: 800, duration: 1400 },
] as const

const reelNodes = definitions.map(definition => {
  const root = document.createElement('article')
  root.className = 'reel'
  root.innerHTML = `<h3>${definition.title}</h3><div class="window"><div class="neighbor before"></div><div class="center"><div class="sizer"></div><div class="still"></div><div class="track" hidden></div></div><div class="neighbor after"></div></div>`
  reelGrid.append(root)
  return {
    root, still: root.querySelector<HTMLElement>('.still')!, sizer: root.querySelector<HTMLElement>('.sizer')!,
    track: root.querySelector<HTMLElement>('.track')!, before: root.querySelector<HTMLElement>('.before')!, after: root.querySelector<HTMLElement>('.after')!,
  }
})

function message(text: string, kind: 'normal' | 'error' = 'normal', spoken = text) {
  status.textContent = text
  status.classList.toggle('error', kind === 'error')
  announce.textContent = spoken
}

function readSettings(): ReadingSettings {
  return { language: languages.find(item => item.code === language.value) ?? languages[0], cefrLevel: level.value as CefrLevel, textLength: length.value as TextLength }
}

function renderPrompt(next: string) {
  if (prompt !== next) { preview.value = next; preview.scrollTop = 0; prompt = next }
  preview.classList.toggle('spacious', next.length > 1000 || reelGrid.classList.contains('dense'))
  element('word-range').textContent = `${textLengths[settings.textLength].wordRange} words`
}

function semantic() {
  semanticResult.replaceChildren(...definitions.map(({ key, title }) => {
    const row = document.createElement('div')
    const label = document.createElement('dt'); label.textContent = title
    const value = document.createElement('dd'); value.textContent = current[key].label
    row.append(label, value); return row
  }))
}

function renderStill(combination: ReadingCombination) {
  definitions.forEach((definition, i) => {
    const node = reelNodes[i]
    node.still.textContent = combination[definition.key].label
    node.before.textContent = definition.catalog[0].label
    node.after.textContent = definition.catalog[2].label
    node.root.classList.remove('moving')
    node.track.hidden = true
  })
}

function reserve(sequences: readonly (readonly string[])[]) {
  reelGrid.classList.toggle('dense', sequences.flat().some(text => text.length > 28))
  sequences.forEach((labels, i) => {
    reelNodes[i].sizer.replaceChildren(...[...new Set(labels)].map(label => {
      const span = document.createElement('span'); span.textContent = label; return span
    }))
  })
}

function availability() {
  const busy = active !== null
  for (const control of [language, level, length, longTest]) control.disabled = busy
  spin.setAttribute('aria-disabled', String(busy))
  element('spin-label').textContent = busy ? 'SPINNING…' : 'SPIN'
  semanticResult.setAttribute('aria-busy', String(busy))
  copy.disabled = busy || copyPending
  document.body.dataset.busy = String(busy)
}

function finish(id: number, reason = 'complete') {
  const run = active
  if (!run || run.id !== id) return
  active = null
  clearTimeout(run.timer)
  current = run.next
  renderStill(current)
  for (const animation of run.animations) animation.cancel()
  semantic()
  renderPrompt(run.nextPrompt)
  availability()
  const full = definitions.map(item => current[item.key].label).join('. ')
  message('Prompt ready. Copy it to your AI chat.', 'normal', `New combination: ${full}. Prompt ready.`)
  metric.textContent = `Last spin: ${Math.round(performance.now() - run.started)} ms · ${run.draws} random draws · ${reason}`
  document.body.dataset.spinCount = String(spinCount)
  document.body.dataset.lastCommit = String(id)
}

function reduced() { return reduceTest.checked || motionPreference.matches }

function longCombination(next: ReadingCombination): ReadingCombination {
  return {
    topic: { ...next.topic, id: 'preview-train-journey', label: 'An unexpected discovery during a train journey', promptHint: 'An unexpected discovery on a train.' },
    format: { ...next.format, id: 'preview-conversation', label: 'A conversation between two unlikely friends', promptHint: 'A dialogue between two unlikely friends.', angleIds: ['preview-change-of-plans'] },
    angle: { ...next.angle, id: 'preview-change-of-plans', label: 'An unexpected change of plans', promptHint: 'Focus on an unexpected change of plans during the journey.' },
  }
}

function sequencesFor(next: ReadingCombination) {
  return definitions.map(({ key, catalog, n }) => [
    catalog[0].label, current[key].label,
    ...Array.from({ length: n - 1 }, (_, i) => catalog[i % catalog.length].label),
    next[key].label, catalog[2].label,
  ])
}

function spinOnce() {
  if (active) return
  const id = ++spinId
  let draws = 0
  const started = performance.now()
  try {
    let next = selectReadingCombination(() => { draws++; return Math.random() })
    if (longTest.checked) next = longCombination(next)
    settings = readSettings()
    const nextPrompt = buildPrompt(settings, next)
    copyId++
    copyPending = false
    copy.textContent = 'Copy prompt'
    const sequences = sequencesFor(next)
    reserve(sequences)
    active = { id, next, nextPrompt, started, animations: [], draws }
    spinCount++
    availability()
    if (reduced() || document.hidden || typeof reelNodes[0].track.animate !== 'function') {
      finish(id, reduced() ? 'without motion' : 'immediate result')
      return
    }
    message('Spinning… Your current prompt stays below.', 'normal', 'Spinning…')
    const run = active
    const clock = document.timeline.currentTime
    const buttonAnimation = spin.animate([
      { transform: 'translateY(0)', boxShadow: '0 4px 0 #183a3e', offset: 0 },
      { transform: 'translateY(2px)', boxShadow: '0 1px 0 #183a3e', offset: 60 / 140 },
      { transform: 'translateY(0)', boxShadow: '0 4px 0 #183a3e', offset: 1 },
    ], { duration: 140, easing: 'cubic-bezier(.2,0,0,1)' })
    void buttonAnimation.finished.catch(() => {})
    run.animations.push(buttonAnimation)
    const endings = definitions.map((definition, i) => {
      const node = reelNodes[i]
      const labels = sequences[i]
      const count = labels.length
      node.track.style.height = `${count * 100}%`
      node.track.replaceChildren(...labels.map(label => {
        const cell = document.createElement('div'); cell.className = 'cell'; cell.textContent = label; return cell
      }))
      node.track.hidden = false
      node.root.classList.add('moving')
      const denominator = 80 + definition.cruise + 120
      const a = 80 / denominator
      const c = definition.cruise / denominator
      const position = (fraction: number, overshoot = true) => `translateY(calc(${-definition.n * 100 / count * fraction}% - ${overshoot ? 2 * fraction : 0}px))`
      const animation = node.track.animate([
        { transform: 'translateY(0)', offset: 0, easing: 'cubic-bezier(.333333,0,.666667,.333333)' },
        { transform: position(a), offset: 160 / definition.duration, easing: 'linear' },
        { transform: position(a + c), offset: (160 + definition.cruise) / definition.duration, easing: 'cubic-bezier(.333333,1,.666667,1)' },
        { transform: position(1), offset: (definition.duration - 80) / definition.duration, easing: 'cubic-bezier(.4,0,.2,1)' },
        { transform: position(1, false), offset: 1 },
      ], { delay: 80, duration: definition.duration, fill: 'forwards' })
      if (typeof clock === 'number') animation.startTime = clock
      run.animations.push(animation)
      return animation.finished
    })
    run.timer = setTimeout(() => finish(id, 'watchdog recovery'), 2000)
    void Promise.all(endings).then(() => finish(id)).catch(() => finish(id, 'animation interrupted'))
  } catch {
    if (active?.id === id) finish(id, 'animation fallback')
    else { availability(); message('Could not spin. Please try again.', 'error') }
  }
}

spin.addEventListener('click', spinOnce)
for (const select of [language, level, length]) select.addEventListener('change', () => {
  if (active) return
  copyId++
  copyPending = false
  copy.textContent = 'Copy prompt'
  settings = readSettings()
  renderPrompt(buildPrompt(settings, current))
  message('')
  availability()
})

copy.addEventListener('click', async () => {
  if (active || copyPending) return
  const id = ++copyId
  const copied = prompt
  copyPending = true
  copy.textContent = 'Copying…'
  availability()
  message('Copying…')
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(copied)
    if (id === copyId && !active && copied === prompt) message('Prompt copied. Paste it into your AI chat.')
  } catch {
    if (id === copyId && !active && copied === prompt) message('Copy failed. Select the prompt and copy it manually.', 'error')
  } finally {
    if (id === copyId) { copyPending = false; copy.textContent = 'Copy prompt'; availability() }
  }
})

reduceTest.addEventListener('change', () => {
  document.body.classList.toggle('force-reduce', reduceTest.checked)
  if (active && reduced()) finish(active.id, 'without motion')
})
motionPreference.addEventListener('change', () => { if (active && reduced()) finish(active.id, 'system reduced motion') })
document.addEventListener('visibilitychange', () => { if (document.hidden && active) finish(active.id, 'tab hidden') })
let layoutWidth = window.innerWidth
window.addEventListener('resize', () => {
  const width = window.innerWidth
  if (width !== layoutWidth && active) finish(active.id, 'viewport changed')
  layoutWidth = width
})
window.addEventListener('pagehide', () => {
  if (!active) return
  const run = active; active = null
  clearTimeout(run.timer)
  for (const animation of run.animations) animation.cancel()
})
const help = element<HTMLDialogElement>('help')
element<HTMLButtonElement>('help-button').addEventListener('click', () => help.showModal())
if (import.meta.hot) import.meta.hot.dispose(() => {
  if (!active) return
  const run = active; active = null
  clearTimeout(run.timer)
  for (const animation of run.animations) animation.cancel()
})

settings = readSettings()
reserve(definitions.map(({ key }) => [current[key].label]))
renderStill(current)
semantic()
renderPrompt(buildPrompt(settings, current))
availability()
