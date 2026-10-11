import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ReadingSettingsForm } from './components/ReadingSettingsForm'
import { RouletteReel } from './components/RouletteReel'
import { DecorativeKeys, MachineWheel } from './components/MachineArtwork'
import { formats } from './data/formats'
import { languages } from './data/languages'
import { angles } from './data/angles'
import { topics } from './data/topics'
import { buildPrompt } from './prompt/buildPrompt'
import { selectReadingCombination } from './random/selectReadingCombination'
import { labelPool, playRouletteMotion, prepareReels, reelDefinitions } from './motion/rouletteMotion'
import type { MotionPlayback } from './motion/rouletteMotion'
import type { ReadingCombination, ReadingSettings } from './types/reading'
import spinFaceArtwork from '../docs/design/assets/spin-face-display.svg'
import './App.css'

const initialCombination: ReadingCombination = { topic: topics[0], format: formats[0], angle: angles[0] }
const initialSettings: ReadingSettings = { language: languages[0], cefrLevel: 'A2', textLength: 'short' }
const initial = { combination: initialCombination, settings: initialSettings, prompt: buildPrompt(initialSettings, initialCombination) }
type Status = { kind: 'ready' | 'spinning' | 'copying' | 'success' | 'error' | 'updated'; message: string; spoken?: string }
type Spin = { id: number; next: typeof initial; sequences: string[][]; held: boolean }
const ready: Status = { kind: 'ready', message: 'Prompt ready. Copy it to your AI chat.' }

function Instructions() {
  return <ol><li>Choose your language, level and length.</li><li>Spin to get a ready-to-use prompt.</li><li>Paste it into any AI chat to create a text for reading practice.</li></ol>
}

function App() {
  const [current, setCurrent] = useState(initial)
  const [plan, setPlan] = useState<Spin | null>(null)
  const [settled, setSettled] = useState<number[]>([])
  const [envelope, setEnvelope] = useState<string[][]>(() => reelDefinitions.map(({ key }) => [initialCombination[key].label]))
  const [status, setStatus] = useState<Status>(ready)
  const [copyPending, setCopyPending] = useState(false)
  const currentRef = useRef(initial)
  const active = useRef<Spin | null>(null)
  const playback = useRef<MotionPlayback | null>(null)
  const spinId = useRef(0)
  const revision = useRef(0)
  const copyAttempt = useRef(0)
  const pendingCopy = useRef(false)
  const mounted = useRef(true)
  const preference = useRef<MediaQueryList | null>(null)
  const tracks = useRef<(HTMLDivElement | null)[]>([])
  const windows = useRef<(HTMLDivElement | null)[]>([])
  const wheels = useRef<(HTMLSpanElement | null)[]>([])
  const keys = useRef(new Map<string, HTMLSpanElement>())
  const face = useRef<HTMLSpanElement>(null)
  const tab = useRef<HTMLSpanElement>(null)
  const preview = useRef<HTMLTextAreaElement>(null)
  const help = useRef<HTMLDialogElement>(null)
  const helpDetails = useRef<HTMLDetailsElement>(null)
  const held = useRef(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const feedbackAnimation = useRef<Animation | null>(null)
  const busy = plan !== null
  const dense = envelope.flat().some(label => label.length > 28)

  function reduced() { return (preference.current ?? window.matchMedia('(prefers-reduced-motion: reduce)')).matches }
  function releasePress() {
    clearTimeout(pressTimer.current)
    held.current = false
    face.current?.classList.remove('held')
  }
  function clearFeedback() {
    clearTimeout(feedbackTimer.current)
    feedbackAnimation.current?.cancel()
    feedbackAnimation.current = null
  }
  function invalidateCopy() {
    copyAttempt.current++
    pendingCopy.current = false
    setCopyPending(false)
  }
  function commit(run: Spin) {
    if (!mounted.current || active.current?.id !== run.id) return
    active.current = null
    currentRef.current = run.next
    setCurrent(run.next)
    setPlan(null)
    setStatus({ ...ready, spoken: 'New combination: ' + reelDefinitions.map(({ key }) => run.next.combination[key].label).join('. ') + '. Prompt ready.' })
  }

  useLayoutEffect(() => {
    if (!plan || active.current?.id !== plan.id) return
    if (reduced() || document.hidden || typeof tracks.current[0]?.animate !== 'function') {
      releasePress()
      commit(plan)
      return
    }
    const handle = playRouletteMotion({
      tracks: tracks.current as HTMLDivElement[], windows: windows.current as HTMLDivElement[],
      face: face.current!, wheels: wheels.current as HTMLSpanElement[],
      keys: ['Q', 'S', 'O', 'J'].map(letter => keys.current.get(letter)!), tab: tab.current!, held: plan.held,
      onStop: index => { if (active.current?.id === plan.id) setSettled(previous => [...previous, index]) },
      onComplete: () => commit(plan),
    })
    playback.current = handle
    releasePress()
    return () => { handle.cancel(); if (playback.current === handle) playback.current = null }
  }, [plan])

  useLayoutEffect(() => { if (preview.current) preview.current.scrollTop = 0 }, [current.prompt])

  useEffect(() => {
    mounted.current = true
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.current = media
    let width = window.innerWidth
    const finish = () => { if (active.current) playback.current?.finish() }
    const visibility = () => { if (document.hidden) finish() }
    const resize = () => { if (width !== window.innerWidth) finish(); width = window.innerWidth }
    const motionChange = () => { if (media.matches) { releasePress(); clearFeedback(); finish() } }
    const pointerUp = () => { if (held.current) pressTimer.current = setTimeout(releasePress, 80) }
    const pageHide = () => {
      releasePress(); clearFeedback(); copyAttempt.current++; pendingCopy.current = false
      playback.current?.cancel(); playback.current = null; active.current = null
    }
    const pageShow = (event: PageTransitionEvent) => {
      if (event.persisted) { setPlan(null); setCopyPending(false); setStatus(ready) }
    }
    media.addEventListener('change', motionChange)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('resize', resize)
    window.addEventListener('pointerup', pointerUp)
    window.addEventListener('pointercancel', releasePress)
    window.addEventListener('blur', releasePress)
    window.addEventListener('pagehide', pageHide)
    window.addEventListener('pageshow', pageShow)
    return () => {
      mounted.current = false; releasePress(); clearFeedback(); copyAttempt.current++
      playback.current?.cancel(); playback.current = null; active.current = null
      media.removeEventListener('change', motionChange)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerup', pointerUp)
      window.removeEventListener('pointercancel', releasePress)
      window.removeEventListener('blur', releasePress)
      window.removeEventListener('pagehide', pageHide)
      window.removeEventListener('pageshow', pageShow)
    }
  }, [])

  function spin() {
    if (active.current) return
    try {
      const combination = selectReadingCombination()
      const settings = currentRef.current.settings
      const next = { combination, settings, prompt: buildPrompt(settings, combination) }
      const id = ++spinId.current
      const sequences = prepareReels(currentRef.current.combination, combination, id)
      clearFeedback(); invalidateCopy(); revision.current++
      const run: Spin = { id, next, sequences, held: held.current }
      active.current = run
      setEnvelope(sequences)
      setSettled([])
      if (reduced() || document.hidden) { releasePress(); commit(run); return }
      setStatus({ kind: 'spinning', message: 'Spinning… Your current prompt stays below.', spoken: 'Spinning…' })
      setPlan(run)
    } catch {
      releasePress()
      setStatus({ kind: 'error', message: 'Could not spin. Please try again.' })
    }
  }

  function changeSettings(settings: ReadingSettings) {
    if (active.current) return
    const old = currentRef.current
    const prompt = buildPrompt(settings, old.combination)
    const next = { ...old, settings, prompt }
    currentRef.current = next
    setCurrent(next)
    if (old.prompt === prompt) return
    clearFeedback(); invalidateCopy()
    const id = ++revision.current
    setStatus({ kind: 'updated', message: '✓ Prompt updated.' })
    if (!reduced() && typeof preview.current?.animate === 'function') {
      try {
        const animation = preview.current.animate([
          { backgroundColor: '#faf0e0', borderColor: '#756354', offset: 0 },
          { backgroundColor: '#e1e9e0', borderColor: '#245b60', offset: 120 / 360 },
          { backgroundColor: '#faf0e0', borderColor: '#756354', offset: 1 },
        ], { duration: 360 })
        feedbackAnimation.current = animation
        void animation.finished.catch(() => {})
      } catch { /* The updated prompt remains usable without a decorative effect. */ }
    }
    feedbackTimer.current = setTimeout(() => {
      if (mounted.current && id === revision.current && !active.current) setStatus(ready)
    }, 1600)
  }

  async function copyPrompt() {
    if (active.current || pendingCopy.current) return
    clearFeedback()
    const attempt = ++copyAttempt.current, copiedRevision = revision.current
    const copied = currentRef.current.prompt
    pendingCopy.current = true; setCopyPending(true)
    setStatus({ kind: 'copying', message: 'Copying…' })
    const valid = () => mounted.current && attempt === copyAttempt.current && copiedRevision === revision.current && !active.current
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(copied)
      if (valid()) setStatus({ kind: 'success', message: '✓ Prompt copied. Paste it into your AI chat.' })
    } catch {
      if (valid()) setStatus({ kind: 'error', message: 'Could not copy automatically. Select the prompt and copy it manually.' })
    } finally {
      if (valid()) { pendingCopy.current = false; setCopyPending(false) }
    }
  }

  function closeDesktopHelp() {
    if (helpDetails.current) { helpDetails.current.open = false; helpDetails.current.querySelector('summary')?.focus() }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="utility">
          <details className="desktop-help" ref={helpDetails} onKeyDown={event => { if (event.key === 'Escape') closeDesktopHelp() }}>
            <summary><span aria-hidden="true">?</span> How to use</summary>
            <div className="help-paper"><h2>How to use</h2><Instructions /><button type="button" onClick={closeDesktopHelp}>Close</button></div>
          </details>
          <button className="mobile-help" type="button" onClick={() => help.current?.showModal()}><span aria-hidden="true">?</span> How to use</button>
        </div>
        <h1>Reading Roulette</h1>
        <p className="subtitle">Try your luck. Find your next great read.</p>
      </header>

      <section className="machine" aria-label="Reading roulette machine" data-busy={busy}>
        <fieldset className="settings-panel" disabled={busy}>
          <legend className="sr-only">Your reading preferences</legend>
          <ReadingSettingsForm settings={current.settings} onChange={changeSettings} />
        </fieldset>
        <div className="reel-body">
          <MachineWheel side="left" nodeRef={node => { wheels.current[0] = node }} />
          <MachineWheel side="right" nodeRef={node => { wheels.current[1] = node }} />
          <dl className="sr-only" aria-label="Current reading combination" aria-busy={busy}>
            {reelDefinitions.map(({ key, title }) => <div key={key}><dt>{title}</dt><dd>{current.combination[key].label}</dd></div>)}
          </dl>
          <div className={'reels' + (dense ? ' dense' : '')} aria-hidden="true">
            {reelDefinitions.map(({ key, title }, i) => <RouletteReel
              key={key} title={title} value={(plan && settled.includes(i) ? plan.next.combination : current.combination)[key].label}
              labels={envelope[i]} neighbors={labelPool(key, plan?.next.combination ?? current.combination)}
              moving={busy && !settled.includes(i)} trackRef={node => { tracks.current[i] = node }} windowRef={node => { windows.current[i] = node }}
            />)}
          </div>
        </div>
        <div className="keyboard">
          <DecorativeKeys rows={['QWERT', 'ASDFG']} register={(letter, node) => { if (node) keys.current.set(letter, node); else keys.current.delete(letter) }} />
          <button className="spin-button" type="button" aria-disabled={busy} aria-describedby="spin-description" onClick={spin}
            onPointerDown={event => { if (event.button === 0 && !active.current) { clearTimeout(pressTimer.current); held.current = true; face.current?.classList.add('held') } }}>
            <span className="spin-face" ref={face}><img src={spinFaceArtwork} alt="" aria-hidden="true" draggable="false" /><span className="spin-label"><span aria-hidden="true">↻</span>{busy ? 'SPINNING…' : 'SPIN'}</span></span>
          </button>
          <DecorativeKeys rows={['YUIOP', 'HJKL']} register={(letter, node) => { if (node) keys.current.set(letter, node); else keys.current.delete(letter) }} />
          <span className="mobile-tab" ref={tab} aria-hidden="true" />
        </div>
        <p className="sr-only" id="spin-description">Choose a topic, format and compatible angle — the specific idea to explore. Repeats are possible.</p>
      </section>

      <section className="paper" aria-labelledby="prompt-heading">
        <h2 id="prompt-heading">Prompt preview</h2>
        <label className="sr-only" htmlFor="prompt-preview">Generated reading prompt</label>
        <textarea id="prompt-preview" ref={preview} readOnly spellCheck={false} value={current.prompt} className={dense || current.prompt.length > 1000 ? 'spacious' : ''} />
        <div className="copy-row"><button className="copy-button" type="button" disabled={busy || copyPending} onClick={copyPrompt} aria-describedby="visible-status"><span aria-hidden="true">▢</span> {copyPending ? 'Copying…' : 'Copy prompt'}</button></div>
        <p className={'status' + (status.kind === 'error' ? ' error' : '')} id="visible-status">{status.message}</p>
      </section>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{status.spoken ?? status.message}</p>
      <dialog ref={help} aria-labelledby="help-heading" className="help-dialog"><h2 id="help-heading">How to use</h2><Instructions /><form method="dialog"><button>Close</button></form></dialog>
    </main>
  )
}

export default App
