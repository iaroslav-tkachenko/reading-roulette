import { drumDefinitions, neighborLabels } from '../components/scene/drumData'
import { reelDefinitions } from './rouletteMotion'
import { playKeyWaves } from './keyWaves'
import { playWheelRims } from './wheelMotion'
import { playDrumPointers } from './pointerMotion'
import type { ReadingCombination, ReadingSettings } from '../types/reading'

export const drumStep = 60
export const drumStartDelay = 100
export const drumWatchdog = 3200

export interface DrumRow { label: string; role: 'previous' | 'selected' | 'next' }
export interface PreparedDrum {
  field: 'topic' | 'format' | 'angle'
  x: number
  n: number
  cruise: number
  duration: number
  rows: DrumRow[]
}

export function prepareSvgDrums(from: ReadingCombination | null, to: ReadingCombination, spin: number, settings?: ReadingSettings): PreparedDrum[] {
  const before = drumDefinitions(from, settings)
  return drumDefinitions(to, settings).map((drum, index) => {
    const definition = reelDefinitions[index]
    const start = neighborLabels(before[index].options, before[index].selected)
    const end = neighborLabels(drum.options, drum.selected)
    const rows: DrumRow[] = Array.from({ length: definition.n + 3 }, (_, row) => ({
      label: drum.options[(row + spin) % drum.options.length].label,
      role: 'selected',
    }))
    rows[0] = { label: start.previous, role: 'previous' }
    rows[1] = { label: before[index].selected.label, role: 'selected' }
    rows[2] = { label: start.next, role: 'next' }
    rows[definition.n] = { label: end.previous, role: 'previous' }
    rows[definition.n + 1] = { label: drum.selected.label, role: 'selected' }
    rows[definition.n + 2] = { label: end.next, role: 'next' }
    return { ...definition, field: drum.field, x: drum.x, rows }
  })
}

export function svgDrumFrames(drum: PreparedDrum): Keyframe[] {
  const distance = drum.n * drumStep
  const overshoot = 3
  const denominator = 70 + drum.cruise + 260 / 3
  const a = 70 / denominator
  const c = drum.cruise / denominator
  const position = (fraction: number) => `translateY(${-(distance + overshoot) * fraction}px)`
  return [
    { transform: 'translateY(0px)', offset: 0, easing: 'cubic-bezier(.333333,0,.666667,.333333)' },
    { transform: position(a), offset: 140 / drum.duration, easing: 'linear' },
    { transform: position(a + c), offset: (140 + drum.cruise) / drum.duration, easing: 'cubic-bezier(.333333,1,.666667,1)' },
    { transform: position(1), offset: (drum.duration - 80) / drum.duration, easing: 'cubic-bezier(.4,0,.2,1)' },
    { transform: `translateY(${-distance}px)`, offset: 1 },
  ]
}

interface MotionEnvironment {
  now: () => number | null
  schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>
  clear: (timer: ReturnType<typeof setTimeout>) => void
}

// Drums, key waves and wheel treads share one clock and cleanup boundary.
export function playSvgDrums(
  tracks: readonly (SVGGElement | null)[],
  drums: readonly PreparedDrum[],
  onComplete: () => void,
  env: MotionEnvironment = {
    now: () => document.timeline.currentTime as number | null,
    schedule: (callback, delay) => setTimeout(callback, delay),
    clear: timer => clearTimeout(timer),
  },
  keys: readonly (SVGGElement | null)[] = [],
  keyWaveSeed = 1,
  wheels: readonly (SVGGElement | null)[] = [],
  pointers: readonly (SVGGElement | null)[] = [],
) {
  const animations: Animation[] = []
  let keyPlayback: ReturnType<typeof playKeyWaves> | undefined
  let wheelPlayback: ReturnType<typeof playWheelRims> | undefined
  let pointerPlayback: ReturnType<typeof playDrumPointers> | undefined
  let ended = false
  let watchdog: ReturnType<typeof setTimeout> | undefined
  const complete = () => {
    if (ended) return
    ended = true
    if (watchdog !== undefined) env.clear(watchdog)
    keyPlayback?.cancel()
    wheelPlayback?.cancel()
    pointerPlayback?.cancel()
    // Keep filled positions until React commits the static target, then cleanup.
    onComplete()
  }
  const cancel = () => {
    ended = true
    if (watchdog !== undefined) env.clear(watchdog)
    keyPlayback?.cancel()
    wheelPlayback?.cancel()
    pointerPlayback?.cancel()
    for (const animation of animations) animation.cancel()
  }
  try {
    if (tracks.length !== 3 || drums.length !== 3) throw new Error('Three drum tracks required')
    const startTime = env.now()
    const finishes = drums.map((drum, index) => {
      const node = tracks[index]
      if (!node?.animate) throw new Error('SVG animation unavailable')
      const animation = node.animate(svgDrumFrames(drum), {
        delay: drumStartDelay, duration: drum.duration, fill: 'both',
      })
      animations.push(animation)
      // Handle cancellation even if creation of a later track throws.
      void animation.finished.catch(() => {})
      if (typeof startTime === 'number') animation.startTime = startTime
      return animation.finished
    })
    keyPlayback = playKeyWaves(keys, startTime, keyWaveSeed)
    wheelPlayback = playWheelRims(wheels, startTime, drums[2])
    pointerPlayback = playDrumPointers(pointers, drums, startTime)
    watchdog = env.schedule(complete, drumWatchdog)
    void Promise.all(finishes).then(complete, complete)
  } catch {
    complete()
  }
  return { finish: complete, cancel }
}
