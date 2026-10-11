// Executes actual App.tsx/components/catalogs/motion with simulated hooks/DOM/time.
// It verifies coordination, not React DOM rendering, CSS, native focus or clipboard.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '../..')
let now = 0, serial = 0, draws = 0, randomValue = .9, dirty = false, cursor = 0
const hooks = [], nodes = new Map(), timers = new Map(), animations = [], checks = []
const setTimer = (fn, delay = 0) => { const id = ++serial; timers.set(id, { fn, at: now + delay }); return id }
class Events {
  listeners = new Map()
  addEventListener(type, fn) { const set = this.listeners.get(type) ?? new Set(); set.add(fn); this.listeners.set(type, set) }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn) }
  emit(type, event = {}) { for (const fn of this.listeners.get(type) ?? []) fn(event) }
}
class FakeAnimation {
  playState = 'running'
  paused = false
  constructor(node, frames, options) {
    this.node = node; this.frames = frames; this.options = options
    this.finished = new Promise((resolve, reject) => { this.resolve = resolve; this.reject = reject })
    this.timer = setTimer(() => { if (!this.paused) { this.playState = 'finished'; this.resolve() } }, (options.delay ?? 0) + options.duration * (options.iterations ?? 1))
    animations.push(this)
  }
  cancel() { timers.delete(this.timer); if (this.playState === 'running') this.reject(Error('AbortError')); this.playState = 'idle' }
}
class Element {
  dataset = {}; style = {}; props = {}; children = []; scrollTop = 0; open = false
  classes = new Set()
  classList = { add: value => this.classes.add(value), remove: value => this.classes.delete(value), contains: value => this.classes.has(value) }
  animate(frames, options) { return new FakeAnimation(this, frames, options) }
  querySelector(selector) { return this.children.find(node => node.type === selector) }
  focus() { document.activeElement = this }
  showModal() { this.open = true }
}
const media = Object.assign(new Events(), { matches: false })
const document = Object.assign(new Events(), { hidden: false, timeline: { get currentTime() { return now } } })
const window = Object.assign(new Events(), { innerWidth: 1440, matchMedia: () => media })
let clipboard = () => Promise.resolve(), clipboardCalls = []
const math = Object.create(Math)
math.random = () => { draws++; return randomValue }
const effect = (fn, deps, layout) => {
  const index = cursor++, old = hooks[index]
  if (!old || deps.some((value, i) => !Object.is(old.deps[i], value))) hooks[index] = { fn, deps, layout, cleanup: old?.cleanup, pending: true }
}
const react = {
  useState(initial) {
    const index = cursor++
    if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial
    return [hooks[index], value => { const next = typeof value === 'function' ? value(hooks[index]) : value; if (!Object.is(next, hooks[index])) { hooks[index] = next; dirty = true } }]
  },
  useRef(initial) { const index = cursor++; if (!(index in hooks)) hooks[index] = { current: initial }; return hooks[index] },
  useEffect: (fn, deps) => effect(fn, deps, false), useLayoutEffect: (fn, deps) => effect(fn, deps, true),
}
const jsx = (type, props) => ({ type, props })
const context = vm.createContext({ window, document, navigator: { clipboard: { writeText: text => { clipboardCalls.push(text); return clipboard(text) } } }, Math: math, setTimeout: setTimer, clearTimeout: id => timers.delete(id) })
const modules = new Map()
function load(file) {
  if (modules.has(file)) return modules.get(file).exports
  const module = { exports: {} }; modules.set(file, module)
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const factory = vm.runInContext('(function(require,module,exports){' + code + '\n})', context, { filename: file })
  factory(specifier => {
    if (specifier === 'react') return react
    if (specifier === 'react/jsx-runtime') return { jsx, jsxs: jsx }
    if (/\.(css|svg|png)$/.test(specifier)) return { default: specifier }
    const base = path.resolve(path.dirname(file), specifier)
    return load([base + '.ts', base + '.tsx'].find(candidate => fs.existsSync(candidate)))
  }, module, module.exports)
  return module.exports
}
const App = load(path.join(root, 'src/App.tsx')).default
let tree
function expand(value, key = 'root') {
  if (value == null || typeof value === 'boolean') return null
  if (typeof value !== 'object') return String(value)
  if (Array.isArray(value)) return value.map((child, i) => expand(child, key + '/' + i)).flat().filter(child => child !== null)
  if (typeof value.type === 'function') return expand(value.type(value.props), key)
  const node = nodes.get(key) ?? new Element(); nodes.set(key, node)
  if (node.props.className !== value.props.className) node.classes = new Set((value.props.className ?? '').split(' '))
  node.type = value.type; node.props = value.props
  if (value.props.style) Object.assign(node.style, value.props.style)
  for (const [name, v] of Object.entries(value.props)) if (name.startsWith('data-')) node.dataset[name.slice(5)] = String(v)
  const children = expand(value.props.children, key + '/children')
  node.children = Array.isArray(children) ? children : children == null ? [] : [children]
  const ref = value.props.ref
  if (typeof ref === 'function') ref(node); else if (ref) ref.current = node
  return node
}
function render() {
  dirty = false; cursor = 0; tree = expand(App())
  for (const layout of [true, false]) for (const hook of hooks) if (hook?.pending && hook.layout === layout) {
    hook.pending = false; hook.cleanup?.(); hook.cleanup = hook.fn()
  }
}
async function flush() { for (let i = 0; i < 12; i++) { await Promise.resolve(); if (dirty) render() } }
async function act(fn) { fn(); await flush() }
async function advance(to) {
  for (;;) {
    const next = [...timers].filter(([, timer]) => timer.at <= to).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0]
    if (!next) break
    now = next[1].at; timers.delete(next[0]); next[1].fn(); await flush()
  }
  now = to; await flush()
}
const all = (node = tree) => typeof node === 'string' ? [] : [node, ...node.children.flatMap(child => all(child))]
const text = node => typeof node === 'string' ? node : node.children.map(text).join('')
const find = fn => all().find(fn)
const cls = name => find(node => node.classes.has(name))
const spin = () => cls('spin-button').props.onClick()
const copy = () => cls('copy-button').props.onClick()
const prompt = () => find(node => node.type === 'textarea').props.value
const status = () => text(find(node => node.props.id === 'visible-status'))
const busy = () => cls('machine').props['data-busy']
const reels = () => all().filter(node => node.classes.has('reel'))
const running = () => animations.filter(animation => animation.playState === 'running')
const record = name => checks.push(name)
render()
// Replay mount effects, as development StrictMode does; no user selection occurs.
for (const hook of hooks) if (hook?.fn) { hook.cleanup?.(); hook.cleanup = hook.fn() }
assert.equal(draws, 0)
assert.equal(all().filter(node => node.classes.has('keycap')).map(node => node.props['data-letter']).join(''), 'QWERTASDFGYUIOPHJKL')
assert.equal(find(node => node.type === 'select').props.value, 'en')
assert.match(prompt(), /Topic: Daily life/)
record('fixed starter; 19-key keyboard; no selection on StrictMode mount')

const header = cls('paper-header'), paperChildren = cls('paper').children
assert.ok(header.children.includes(cls('copy-button')))
assert.ok(paperChildren.indexOf(header) < paperChildren.indexOf(find(node => node.type === 'textarea')))
for (const mount of all().filter(node => node.classes.has('wheel-mount'))) {
  const wheel = mount.children.find(node => node.classes.has('wheel'))
  const hub = mount.children.find(node => node.classes.has('wheel-hub'))
  assert.ok(wheel && hub && !all(wheel).includes(hub))
}
for (const key of all().filter(node => node.classes.has('keycap'))) {
  assert.ok(key.children.some(node => node.type === 'img'))
  assert.ok(key.children.some(node => node.type === 'b' && text(node) === key.props['data-letter']))
}
record('Copy lives in the paper header before the full preview; wheel hubs stay outside rotating nodes; all 19 letters share their keycap motion parent')

const oldPrompt = prompt(), started = now
await act(() => { cls('spin-button').props.onPointerDown({ button: 0 }); spin(); for (let i = 0; i < 10; i++) spin(); copy() })
assert.equal(draws, 3); assert.equal(busy(), true); assert.equal(cls('copy-button').props.disabled, true)
assert.equal(find(node => node.type === 'fieldset').props.disabled, true)
assert.equal(prompt(), oldPrompt); assert.equal(clipboardCalls.length, 0)
const mains = running().filter(animation => animation.node.classes.has('reel-track'))
assert.deepEqual(mains.map(animation => animation.options.delay + animation.options.duration), [1480, 1960, 2440])
assert.equal(animations.find(animation => animation.node.classes.has('spin-face')).frames[1].transform, 'translateY(4px)')
assert.equal(running().filter(animation => animation.node.classes.has('keycap')).length, 4)
assert.equal(running().filter(animation => animation.node.classes.has('wheel')).length, 2)
assert.equal(running().filter(animation => animation.node.classes.has('wheel-hub') || animation.node.classes.has('wheel-mount') || animation.node.classes.has('reel-bracket')).length, 0)
record('single prepared selection; repeats/copy/settings guarded; button face and four keys/two wheels animate')
await advance(started + 1480)
assert.deepEqual(reels().map(node => node.props['data-state']), ['settled', 'moving', 'moving']); assert.equal(prompt(), oldPrompt)
assert.equal(100 + mains[1].frames[2].offset * mains[1].options.duration, 1620)
await advance(started + 1960)
assert.deepEqual(reels().map(node => node.props['data-state']), ['settled', 'settled', 'moving']); assert.equal(prompt(), oldPrompt)
assert.equal(100 + mains[2].frames[2].offset * mains[2].options.duration, 2100)
await advance(started + 2440)
assert.equal(busy(), false); assert.match(prompt(), /Topic: Nature/); assert.match(prompt(), /Angle: A common misconception/)
assert.equal(running().length, 0)
assert.equal(cls('wheel-left').dataset.turn, '540'); assert.equal(cls('wheel-right').dataset.turn, '900')
assert.equal(cls('wheel-left').style.transform, 'rotate(540deg)')
record('sequential stops, remaining reels stay fast, atomic prompt commit, wheel orientation retained and cleanup')

const oldCount = animations.length, beforeDraws = draws
media.matches = true
await act(() => { media.emit('change'); spin() })
assert.equal(busy(), false); assert.equal(animations.length, oldCount); assert.equal(draws, beforeDraws + 3)
media.matches = false
window.innerWidth = 390
await act(() => { window.emit('resize'); spin() })
assert.equal(animations.findLast(animation => animation.node.classes.has('spin-face')).frames[1].transform, 'translateY(3px)')
assert.match(animations.findLast(animation => animation.node.classes.has('reel-track')).frames[3].transform, /2px/)
assert.equal(running().filter(animation => animation.node.classes.has('wheel') || animation.node.classes.has('keycap')).length, 0)
window.innerWidth = 320
await act(() => window.emit('resize'))
assert.equal(busy(), false); assert.equal(running().length, 0)
record('reduced motion immediate; mobile amplitudes and no hidden desktop effects; resize commits/cancels')

window.innerWidth = 1440
let resolveCopy
clipboard = () => new Promise(resolve => { resolveCopy = resolve })
await act(copy)
await act(spin)
resolveCopy(); await flush()
assert.match(status(), /^Spinning/)
media.matches = true; await act(() => media.emit('change'))
assert.equal(busy(), false); assert.equal(running().length, 0)
media.matches = false
record('stale clipboard completion cannot overwrite a spin; enabling reduced motion ends active effects')

await act(copy)
const selectedBeforeSettings = text(find(node => node.type === 'dl'))
const selects = all().filter(node => node.type === 'select')
await act(() => selects[1].props.onChange({ target: { value: 'B1+' } }))
assert.match(prompt(), /B1\+/); assert.equal(text(find(node => node.type === 'dl')), selectedBeforeSettings)
assert.match(status(), /Prompt updated/); assert.equal(cls('copy-button').props.disabled, false)
resolveCopy(); await flush(); assert.match(status(), /Prompt updated/)
await advance(now + 1600); assert.match(status(), /Prompt ready/)
record('settings preserve combination; prompt/helper update; copy revision guard; 1600ms feedback')

clipboard = () => Promise.reject(Error('denied'))
await act(copy); await flush(); assert.match(status(), /Select the prompt/)
clipboard = () => Promise.resolve()
await act(copy); await flush(); assert.match(status(), /Prompt copied/)
assert.equal(clipboardCalls.at(-1), prompt())
record('clipboard rejection leaves full manual preview; retry copies the full current prompt')

await act(spin); document.hidden = true; await act(() => document.emit('visibilitychange'))
assert.equal(busy(), false); assert.equal(running().length, 0); document.hidden = false
await act(spin); for (const animation of running()) if (animation.node.classes.has('reel-track')) animation.paused = true
await advance(now + 3200); assert.equal(busy(), false); assert.equal(running().length, 0)
record('hidden document and missing-finish watchdog recover once with no remaining effects')

const textarea = find(node => node.type === 'textarea')
textarea.animate = () => { throw Error('WAAPI failure') }
await act(() => all().filter(node => node.type === 'select')[2].props.onChange({ target: { value: 'long' } }))
assert.match(status(), /Prompt updated/); assert.match(prompt(), /500–700/)
delete textarea.animate
const firstTrack = cls('reel-track'); firstTrack.animate = undefined
const animationCount = animations.length
await act(spin); assert.equal(busy(), false); assert.equal(animations.length, animationCount)
delete firstTrack.animate
record('decorative feedback API failure preserves settings; missing animation API returns immediate result')

const topicModule = load(path.join(root, 'src/data/topics.ts'))
const removed = topicModule.topics.splice(0)
await act(spin); assert.match(status(), /Could not spin/); assert.equal(busy(), false)
topicModule.topics.push(...removed)
record('empty-catalog selection error happens before successful-result animation')

randomValue = 0
const formatModule = load(path.join(root, 'src/data/formats.ts'))
const angleModule = load(path.join(root, 'src/data/angles.ts'))
const oldLabels = [topicModule.topics[0].label, formatModule.formats[0].label, angleModule.angles[0].label]
topicModule.topics[0].label = 'An unexpected discovery during a train journey'
formatModule.formats[0].label = 'A conversation between two unlikely friends'
angleModule.angles[0].label = 'An unexpected change of plans'
await act(spin); assert.equal(cls('reels').classes.has('dense'), true)
await advance(now + 2440)
for (const label of ['An unexpected discovery during a train journey', 'A conversation between two unlikely friends', 'An unexpected change of plans']) assert.ok(prompt().includes(label))
topicModule.topics[0].label = oldLabels[0]; formatModule.formats[0].label = oldLabels[1]; angleModule.angles[0].label = oldLabels[2]
record('long-label fixture keeps full strings and a shared persistent dense envelope (no CSS geometry claim)')

const beforeHide = prompt()
await act(spin); await act(() => window.emit('pagehide'))
assert.equal(prompt(), beforeHide); assert.equal(running().length, 0)
await act(() => window.emit('pageshow', { persisted: true })); assert.equal(busy(), false)
await act(spin)
for (const hook of hooks) hook?.cleanup?.()
dirty = false; await advance(now + 4000); assert.equal(dirty, false); assert.equal(running().length, 0)
record('pagehide cancels without committing; BFCache restores idle; unmount prevents late state updates')

const report = { date: '2026-10-10', surface: 'Actual App.tsx/components/motion/catalogs under simulated hooks, DOM, WAAPI and clock; not React DOM or browser rendering', count: checks.length, checks, notVerified: ['Browser visual geometry/zoom/font fallback', 'Native keyboard/focus/assistive technology and Clipboard permissions', 'Real frame scheduling/fps', 'Network loading on a public deployment'] }
// A caller can retain a new run without overwriting historical evidence.
if (process.argv[2]) report.date = process.argv[3] ?? new Date().toISOString().slice(0, 10)
fs.writeFileSync(process.argv[2] ? path.resolve(root, process.argv[2]) : path.join(directory, 'react-motion-checks-2026-10-10.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
