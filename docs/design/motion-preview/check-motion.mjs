// Executes the real preview and its real catalogs in a simulated DOM/clock.
// This checks event/state coordination and requested WAAPI keyframes, not rendering.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const directory = path.dirname(fileURLToPath(import.meta.url))
let now = 0
let sequence = 0
let draws = 0
const timers = new Map()
const animations = []
const elements = []
const checks = []
const setTimer = (callback, delay = 0) => {
  const id = ++sequence
  timers.set(id, { callback, time: now + delay })
  return id
}
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve() }
async function advance(to) {
  assert.ok(to >= now)
  for (;;) {
    const next = [...timers].filter(([, value]) => value.time <= to).sort((a, b) => a[1].time - b[1].time || a[0] - b[0])[0]
    if (!next) break
    now = next[1].time
    timers.delete(next[0])
    next[1].callback()
    await flush()
  }
  now = to
  await flush()
}
class Events {
  listeners = new Map()
  addEventListener(name, listener) { const list = this.listeners.get(name) ?? []; list.push(listener); this.listeners.set(name, list) }
  emit(name, event = {}) { return Promise.all((this.listeners.get(name) ?? []).map(listener => listener(event))) }
}
class Classes {
  values = new Set()
  add(value) { this.values.add(value) }
  remove(value) { this.values.delete(value) }
  contains(value) { return this.values.has(value) }
  toggle(value, force = !this.values.has(value)) { force ? this.add(value) : this.remove(value) }
}
class FakeAnimation {
  playState = 'running'
  paused = false
  constructor(target, frames, options) {
    this.target = target; this.frames = frames; this.options = options
    this.finished = new Promise((resolve, reject) => { this.resolve = resolve; this.reject = reject })
    this.timer = setTimer(() => {
      if (this.paused) return
      this.playState = 'finished'; this.resolve(this)
    }, (options.delay ?? 0) + options.duration * (options.iterations ?? 1))
    animations.push(this)
  }
  cancel() {
    timers.delete(this.timer)
    if (this.playState === 'running') this.reject(new Error('AbortError'))
    this.playState = 'idle'
  }
}
class Element extends Events {
  children = []
  queries = new Map()
  classList = new Classes()
  style = {}
  dataset = {}
  attributes = {}
  checked = false
  disabled = false
  value = ''
  scrollTop = 0
  text = ''
  constructor(tag = 'div', id = '') { super(); this.tag = tag; this.id = id; elements.push(this) }
  set textContent(text) { this.text = text; this.children = [] }
  get textContent() { return this.text + this.children.map(child => child.textContent).join('') }
  append(...children) { this.children.push(...children) }
  replaceChildren(...children) { this.text = ''; this.children = children }
  setAttribute(name, value) { this.attributes[name] = value }
  querySelector(selector) {
    if (!this.queries.has(selector)) this.queries.set(selector, new Element(selector))
    return this.queries.get(selector)
  }
  animate(frames, options) { return new FakeAnimation(this, frames, options) }
  showModal() { this.open = true }
}
const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8')
const ids = new Map([...html.matchAll(/<([\w-]+)[^>]*\bid="([^"]+)"/g)].map(([, tag, id]) => [id, new Element(tag, id)]))
const document = Object.assign(new Events(), {
  body: new Element('body'), hidden: false, timeline: { currentTime: 0 },
  getElementById: id => ids.get(id), createElement: tag => new Element(tag),
})
const window = Object.assign(new Events(), { innerWidth: 1440 })
const preference = Object.assign(new Events(), { matches: false })
let clipboard = text => Promise.resolve(text)
let clipboardCalls = 0
const testMath = Object.create(Math)
testMath.random = () => { draws++; return .1 }
const context = vm.createContext({
  document, window, matchMedia: () => preference,
  navigator: { clipboard: { writeText: text => { clipboardCalls++; return clipboard(text) } } },
  performance: { now: () => now }, setTimeout: setTimer, clearTimeout: id => timers.delete(id),
  Math: testMath, Option: class extends Element { constructor(label, value) { super('option'); this.textContent = label; this.value = value } },
})
const modules = new Map()
function load(file) {
  if (modules.has(file)) return modules.get(file).exports
  const module = { exports: {} }; modules.set(file, module)
  const source = fs.readFileSync(file, 'utf8').replaceAll('import.meta.hot', 'undefined')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.CommonJS } })
  const factory = vm.runInContext(`(function(require,module,exports){${outputText}\n})`, context, { filename: file })
  factory(specifier => load(path.resolve(path.dirname(file), `${specifier}.ts`)), module, module.exports)
  return module.exports
}
load(path.join(directory, 'preview.ts'))
const el = id => ids.get(id)
const reels = el('reels').children
const tracks = reels.map(reel => reel.querySelector('.track'))
const busy = () => document.body.dataset.busy === 'true'
const runAnimations = () => animations.filter(animation => animation.playState === 'running')
const count = () => Number(document.body.dataset.spinCount ?? 0)
const record = name => checks.push(name)

assert.match(el('prompt').value, /Topic: Travel/)
assert.equal(busy(), false)
await el('spin').emit('pointerdown', { button: 0 })
assert.equal(el('spin-face').classList.contains('held'), true)
const oldPrompt = el('prompt').value
await el('spin').emit('click')
const first = now
assert.equal(busy(), true)
assert.equal(draws, 3)
assert.equal(el('copy').disabled, true)
assert.equal(el('prompt').value, oldPrompt)
assert.deepEqual(tracks.map(track => track.children.length), [19, 26, 33])
const main = animations.filter(animation => tracks.includes(animation.target))
assert.deepEqual(main.map(animation => animation.options.delay + animation.options.duration), [1480, 1960, 2440])
assert.equal(animations.find(animation => animation.target.id === 'spin-face').frames[1].transform, 'translateY(4px)')
assert.equal(animations.filter(animation => animation.target.id.startsWith('wheel-')).length, 2)
assert.equal(animations.filter(animation => animation.target.id.startsWith('key-')).length, 4)
assert.ok(animations.filter(animation => animation.target.id.startsWith('key-')).every(animation => animation.frames.some(frame => frame.transform === 'translateY(1.5px)')))
assert.equal(animations.find(animation => animation.target.id === 'wheel-right').frames.at(-1).transform, 'rotate(900deg)')
for (let i = 0; i < 10; i++) await el('spin').emit('click')
await el('copy').emit('click')
assert.equal(draws, 3)
assert.equal(clipboardCalls, 0)
record('single selection; repeated activation ignored; old prompt/copy guarded; 16/23/30 positions')
const compatible = load(path.resolve(directory, '../../../src/data/formats.ts')).formats[0].angleIds
const labels = load(path.resolve(directory, '../../../src/data/angles.ts')).angles.filter(angle => compatible.includes(angle.id)).map(angle => angle.label)
assert.ok(tracks[2].children.slice(2, -2).every(cell => labels.includes(cell.textContent)))
record('intermediate Angle labels respect the prepared format compatibility')
await advance(first + 1480)
assert.deepEqual(reels.map(reel => reel.dataset.state), ['settled', 'moving', 'moving'])
assert.equal(el('prompt').value, oldPrompt)
assert.equal(100 + main[1].frames[2].offset * main[1].options.duration, 1620)
await advance(first + 1960)
assert.deepEqual(reels.map(reel => reel.dataset.state), ['settled', 'settled', 'moving'])
assert.equal(100 + main[2].frames[2].offset * main[2].options.duration, 2100)
await advance(first + 2440)
assert.equal(busy(), false)
assert.match(el('prompt').value, /Topic: Daily life/)
assert.equal(runAnimations().length, 0)
assert.equal(count(), 1)
record('ordered stops; remaining reels still fast; atomic final prompt; all decorations stop')

const beforeReduced = animations.length
el('reduce-test').checked = true
await el('reduce-test').emit('change')
await el('spin').emit('click')
assert.equal(busy(), false)
assert.equal(animations.length, beforeReduced)
el('reduce-test').checked = false
await el('reduce-test').emit('change')
record('reduced motion commits without any animation or artificial delay')

window.innerWidth = 390
await window.emit('resize')
await el('spin').emit('click')
assert.equal(animations.findLast(animation => animation.target.id === 'spin-face').frames[1].transform, 'translateY(3px)')
assert.match(animations.findLast(animation => animation.target === tracks[2]).frames[3].transform, /2px/)
window.innerWidth = 320
await window.emit('resize')
assert.equal(busy(), false)
assert.equal(runAnimations().length, 0)
record('mobile amplitudes; resize interrupts cleanly')

el('long-test').checked = true
await el('spin').emit('click')
assert.equal(el('reels').classList.contains('dense'), true)
await advance(now + 2440)
assert.match(el('prompt').value, /An unexpected change of plans/)
assert.equal(reels[2].querySelector('.still').textContent, 'An unexpected change of plans')
record('long fixtures use dense sizing and preserve the full final text')
el('long-test').checked = false

await el('spin').emit('click')
document.hidden = true
await document.emit('visibilitychange')
assert.equal(busy(), false)
assert.equal(runAnimations().length, 0)
document.hidden = false
record('hidden document commits the already chosen result and cancels all effects')

let resolveCopy
clipboard = () => new Promise(resolve => { resolveCopy = resolve })
const pendingCopy = el('copy').emit('click')
await el('spin').emit('click')
resolveCopy()
await pendingCopy
assert.match(el('visible-status').textContent, /^Spinning/)
el('reduce-test').checked = true
await el('reduce-test').emit('change')
assert.equal(busy(), false)
assert.equal(runAnimations().length, 0)
record('stale clipboard completion cannot replace spin status; reduce during spin cancels effects')
el('reduce-test').checked = false
await el('reduce-test').emit('change')
clipboard = () => Promise.reject(new Error('Clipboard rejected'))
await el('copy').emit('click')
assert.match(el('visible-status').textContent, /copy it manually/)
assert.equal(el('copy').disabled, false)
record('clipboard rejection leaves manual copy and retry available')

await el('spin').emit('click')
animations.filter(animation => tracks.includes(animation.target) && animation.playState === 'running').forEach(animation => { animation.paused = true })
await advance(now + 3200)
assert.equal(busy(), false)
assert.match(el('review-metric').textContent, /watchdog recovery/)
assert.equal(runAnimations().length, 0)
record('watchdog recovers from missing animation completion')

await el('spin').emit('click')
await window.emit('pagehide')
await flush()
await window.emit('pageshow', { persisted: true })
assert.equal(busy(), false)
assert.equal(runAnimations().length, 0)
assert.equal(el('copy').disabled, false)
record('pagehide cleanup and back-forward cache restoration do not leave busy controls')

const topicData = load(path.resolve(directory, '../../../src/data/topics.ts')).topics
const originalTopics = [...topicData]
topicData.length = 0
await el('spin').emit('click')
assert.equal(busy(), false)
assert.match(el('visible-status').textContent, /Could not spin/)
topicData.push(...originalTopics)
record('selection error occurs before success animation and releases controls')

const evidence = { date: '2026-10-10', surface: 'simulated DOM/clock, actual preview.ts and catalogs', checks, count: checks.length, notVerified: ['Browser rendering, CSS layout and mask geometry', 'Real animation frame scheduling/fps', 'Browser clipboard, focus, keyboard and screen reader'] }
fs.writeFileSync(path.join(directory, 'motion-v2-checks-2026-10-10.json'), JSON.stringify(evidence, null, 2) + '\n')
console.log(JSON.stringify(evidence, null, 2))
