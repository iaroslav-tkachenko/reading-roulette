import { languages } from '../../../src/data/languages'
import { cefrLevels } from '../../../src/data/cefrLevels'
import { getTextLength, textLengths } from '../../../src/data/textLengths'
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
const spinFace = element('spin-face')
const wheels = [element('wheel-left'), element('wheel-right')]
const mechanicalKeys = ['key-q', 'key-s', 'key-o', 'key-j'].map(id => element(id))
const mobileTab = element('mobile-tab')
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
  animations: Animation[]; timer?: ReturnType<typeof setTimeout>; draws: number; stops: number[]
} = null

const definitions = [
  { key: 'topic', title: 'Topic', catalog: topics, n: 16, cruise: 900, duration: 1380 },
  { key: 'format', title: 'Format', catalog: formats, n: 23, cruise: 1380, duration: 1860 },
  { key: 'angle', title: 'Angle', catalog: angles, n: 30, cruise: 1860, duration: 2340 },
] as const

const reelNodes = definitions.map(definition => {
  const root = document.createElement('article')
  root.className = 'reel'
  root.innerHTML = `<h3>${definition.title}</h3><div class="window"><div class="neighbor before"></div><div class="center"><div class="sizer"></div><div class="still"></div><div class="track" hidden></div></div><div class="neighbor after"></div></div>`
  reelGrid.append(root)
  return {
    root, still: root.querySelector<HTMLElement>('.still')!, sizer: root.querySelector<HTMLElement>('.sizer')!,
    track: root.querySelector<HTMLElement>('.track')!, before: root.querySelector<HTMLElement>('.before')!, after: root.querySelector<HTMLElement>('.after')!, window: root.querySelector<HTMLElement>('.window')!,
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
  element('word-range').textContent = getTextLength(settings).description
}

function semantic() {
  semanticResult.replaceChildren(...definitions.map(({ key, title }) => {
    const row = document.createElement('div')
    const label = document.createElement('dt'); label.textContent = title
    const value = document.createElement('dd'); value.textContent = current[key].label
    row.append(label, value); return row
  }))
}

function poolFor(key: typeof definitions[number]['key'], combination: ReadingCombination): readonly string[] {
  if (key === 'topic') return topics.map(item => item.label)
  if (key === 'format') return formats.map(item => item.label)
  const pool = angles.filter(item => combination.format.angleIds.includes(item.id)).map(item => item.label)
  return pool.length ? pool : [combination.angle.label]
}

function settleReel(i: number, combination: ReadingCombination) {
  const definition = definitions[i]
  const node = reelNodes[i]
  const pool = poolFor(definition.key, combination)
  node.still.textContent = combination[definition.key].label
  node.before.textContent = pool[0]
  node.after.textContent = pool.at(-1)!
  node.root.classList.remove('moving')
  node.root.dataset.state = 'settled'
  node.track.hidden = true
}

function renderStill(combination: ReadingCombination) {
  definitions.forEach((_, i) => settleReel(i, combination))
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
  metric.textContent = `Motion v2 · ${Math.round(performance.now() - run.started)} ms · stops: ${run.stops.join(' / ') || 'immediate'} ms · ${reason}`
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
  return definitions.map(({ key, n }) => {
    const pool = poolFor(key, next)
    const middle: string[] = []
    for (let i = 0; i < n - 1; i++) {
      const previous = middle.at(-1) ?? current[key].label
      let index = (i + spinCount) % pool.length
      if (pool.length > 1 && pool[index] === previous) index = (index + 1) % pool.length
      middle.push(pool[index])
    }
    return [pool.at(-1)!, current[key].label, ...middle, next[key].label, pool[0]]
  })
}

// Keep focus and the layout box stationary: only the enamel face depresses.
let pointerHeld = false
let releaseTimer: ReturnType<typeof setTimeout> | undefined
function releasePress() {
  clearTimeout(releaseTimer)
  pointerHeld = false
  spinFace.classList.remove('held')
}
spin.addEventListener('pointerdown', event => {
  if (event.button !== 0 || active) return
  clearTimeout(releaseTimer)
  pointerHeld = true
  spinFace.classList.add('held')
})
window.addEventListener('pointerup', () => { if (pointerHeld) releaseTimer = setTimeout(releasePress, 80) })
window.addEventListener('pointercancel', releasePress)
window.addEventListener('blur', releasePress)

function secondary(run: NonNullable<typeof active>, target: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions, clock: number | CSSNumberish | null) {
  const animation = target.animate(frames, options)
  if (typeof clock === 'number') animation.startTime = clock
  void animation.finished.catch(() => {})
  run.animations.push(animation)
}

function animateDetails(run: NonNullable<typeof active>, clock: number | CSSNumberish | null) {
  ;[0, 2].forEach((reelIndex, wheelIndex) => {
    const definition = definitions[reelIndex]
    const denominator = 70 + definition.cruise + 260 / 3
    const a = 70 / denominator
    const c = definition.cruise / denominator
    const degrees = wheelIndex === 0 ? 540 : 900
    secondary(run, wheels[wheelIndex], [
      { transform: 'rotate(0deg)', offset: 0, easing: 'cubic-bezier(.333333,0,.666667,.333333)' },
      { transform: `rotate(${degrees * a}deg)`, offset: 140 / definition.duration, easing: 'linear' },
      { transform: `rotate(${degrees * (a + c)}deg)`, offset: (140 + definition.cruise) / definition.duration, easing: 'cubic-bezier(.333333,1,.666667,1)' },
      { transform: `rotate(${degrees}deg)`, offset: (definition.duration - 80) / definition.duration },
      { transform: `rotate(${degrees}deg)`, offset: 1 },
    ], { delay: 100, duration: definition.duration, fill: 'forwards' }, clock)
  })
  const wave: Keyframe[] = []
  for (let start = 0; start <= 1560; start += 520) {
    wave.push(
      { transform: 'translateY(0)', offset: start / 1720 },
      { transform: 'translateY(1.5px)', offset: (start + 80) / 1720 },
      { transform: 'translateY(0)', offset: (start + 160) / 1720 },
    )
  }
  mechanicalKeys.forEach((key, i) => secondary(run, key, wave, { delay: 240 + i * 90, duration: 1720, easing: 'ease-in-out' }, clock))
  secondary(run, mobileTab, [
    { transform: 'translateY(0)', offset: 0 }, { transform: 'translateY(1px)', offset: .25 },
    { transform: 'translateY(-1px)', offset: .75 }, { transform: 'translateY(0)', offset: 1 },
  ], { delay: 240, duration: 260, iterations: 7 }, clock)
  for (const reel of reelNodes) secondary(run, reel.window, [
    { borderColor: '#756354', offset: 0 }, { borderColor: '#619d94', offset: .4 }, { borderColor: '#756354', offset: 1 },
  ], { delay: 2140, duration: 300 }, clock)
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
    active = { id, next, nextPrompt, started, animations: [], draws, stops: [] }
    spinCount++
    availability()
    if (reduced() || document.hidden || typeof reelNodes[0].track.animate !== 'function') {
      releasePress()
      finish(id, reduced() ? 'without motion' : 'immediate result')
      return
    }
    message('Spinning… Your current prompt stays below.', 'normal', 'Spinning…')
    const run = active
    const clock = document.timeline.currentTime
    const depth = window.innerWidth < 640 ? 3 : 4
    secondary(run, spinFace, [
      { transform: pointerHeld ? `translateY(${depth}px)` : 'translateY(0)', boxShadow: pointerHeld ? '0 1px 0 #183a3e' : '0 4px 0 #183a3e', offset: 0 },
      { transform: `translateY(${depth}px)`, boxShadow: '0 1px 0 #183a3e', offset: 60 / 220 },
      { transform: 'translateY(0)', boxShadow: '0 4px 0 #183a3e', offset: 1 },
    ], { duration: 220, easing: 'cubic-bezier(.2,0,0,1)' }, clock)
    releasePress()
    animateDetails(run, clock)
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
      node.root.dataset.state = 'moving'
      const denominator = 70 + definition.cruise + 260 / 3
      const a = 70 / denominator
      const c = definition.cruise / denominator
      const overshootPx = window.innerWidth < 640 ? 2 : 3
      const position = (fraction: number, overshoot = true) => `translateY(calc(${-definition.n * 100 / count * fraction}% - ${overshoot ? overshootPx * fraction : 0}px))`
      const animation = node.track.animate([
        { transform: 'translateY(0)', offset: 0, easing: 'cubic-bezier(.333333,0,.666667,.333333)' },
        { transform: position(a), offset: 140 / definition.duration, easing: 'linear' },
        { transform: position(a + c), offset: (140 + definition.cruise) / definition.duration, easing: 'cubic-bezier(.333333,1,.666667,1)' },
        { transform: position(1), offset: (definition.duration - 80) / definition.duration, easing: 'cubic-bezier(.4,0,.2,1)' },
        { transform: position(1, false), offset: 1 },
      ], { delay: 100, duration: definition.duration, fill: 'forwards' })
      if (typeof clock === 'number') animation.startTime = clock
      run.animations.push(animation)
      return animation.finished.then(() => {
        if (active?.id !== id) return
        run.stops[i] = Math.round(performance.now() - run.started)
        settleReel(i, next)
      })
    })
    run.timer = setTimeout(() => finish(id, 'watchdog recovery'), 3200)
    void Promise.all(endings).then(() => finish(id)).catch(() => finish(id, 'animation interrupted'))
  } catch {
    releasePress()
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
  releasePress()
  if (!active) return
  const run = active; active = null
  clearTimeout(run.timer)
  for (const animation of run.animations) animation.cancel()
})
window.addEventListener('pageshow', event => {
  if (!event.persisted || active) return
  renderStill(current)
  availability()
  message('')
})
const help = element<HTMLDialogElement>('help')
element<HTMLButtonElement>('help-button').addEventListener('click', () => help.showModal())
if (import.meta.hot) import.meta.hot.dispose(() => {
  releasePress()
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
