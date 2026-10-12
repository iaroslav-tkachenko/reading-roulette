import { topics } from '../data/topics'
import { formats } from '../data/formats'
import { angles } from '../data/angles'
import type { ReadingCombination } from '../types/reading'

export const reelDefinitions = [
  { key: 'topic', title: 'Topic', n: 16, cruise: 900, duration: 1380 },
  { key: 'format', title: 'Format', n: 23, cruise: 1380, duration: 1860 },
  { key: 'angle', title: 'Angle', n: 30, cruise: 1860, duration: 2340 },
] as const

export function labelPool(key: typeof reelDefinitions[number]['key'], next: ReadingCombination): string[] {
  if (key === 'topic') return topics.map(item => item.label)
  if (key === 'format') return formats.map(item => item.label)
  return angles.filter(item => next.format.angleIds.includes(item.id)).map(item => item.label)
}

export function prepareReels(current: ReadingCombination, next: ReadingCombination, spin: number) {
  return reelDefinitions.map(({ key, n }) => {
    const allowed = labelPool(key, next)
    // Layout fixtures or future locally-filtered catalogs can supply one label.
    const pool = allowed.length ? allowed : [next[key].label]
    const middle: string[] = []
    for (let i = 0; i < n - 1; i++) {
      const previous = middle.at(-1) ?? current[key].label
      let index = (i + spin) % pool.length
      if (pool.length > 1 && pool[index] === previous) index = (index + 1) % pool.length
      middle.push(pool[index])
    }
    return [pool.at(-1)!, current[key].label, ...middle, next[key].label, pool[0]]
  })
}

interface MotionTargets {
  tracks: HTMLElement[]
  windows: HTMLElement[]
  face: HTMLElement
  wheels: HTMLElement[]
  keys: HTMLElement[]
  tab: HTMLElement
  held: boolean
  onStop: (index: number) => void
  onComplete: () => void
}

export interface MotionPlayback { finish: () => void; cancel: () => void }

// WAAPI owns transforms. React updates only at preparation, three stops and commit.
export function playRouletteMotion(targets: MotionTargets): MotionPlayback {
  const animations: Animation[] = []
  const clock = document.timeline.currentTime
  let ended = false
  let watchdog: ReturnType<typeof setTimeout> | undefined
  const wheelTurns: { node: HTMLElement; end: number }[] = []
  const cancel = () => {
    ended = true
    clearTimeout(watchdog)
    for (const animation of animations) animation.cancel()
  }
  const complete = (natural = false) => {
    if (ended) return
    ended = true
    clearTimeout(watchdog)
    // Preserve the final orientation: a 540° wheel must not snap back 180°.
    if (natural) for (const { node, end } of wheelTurns) {
      node.dataset.turn = String(end)
      node.style.transform = `rotate(${end}deg)`
    }
    targets.onComplete()
    if (!natural) for (const animation of animations) animation.cancel()
    // Filled transforms are removed by the React layout-effect cleanup, after
    // the static result is committed. No backward frame between track/still.
  }
  const animate = (node: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = node.animate(frames, options)
    animations.push(animation)
    if (typeof clock === 'number') animation.startTime = clock
    void animation.finished.catch(() => {})
    return animation
  }
  try {
    const mobile = window.innerWidth < 640
    const desktopDetails = window.innerWidth >= 768
    const depth = mobile ? 3 : 4
    animate(targets.face, [
      { transform: `translateY(${targets.held ? depth : 0}px)`, offset: 0 },
      { transform: `translateY(${depth}px)`, offset: 60 / 220 },
      { transform: 'translateY(0)', offset: 1 },
    ], { duration: 220, easing: 'cubic-bezier(.2,0,0,1)' })

    if (desktopDetails) {
      ;[0, 2].forEach((index, wheelIndex) => {
        const definition = reelDefinitions[index]
        const denominator = 70 + definition.cruise + 260 / 3
        const a = 70 / denominator, c = definition.cruise / denominator
        const node = targets.wheels[wheelIndex]
        const start = Number(node.dataset.turn ?? 0)
        const degrees = wheelIndex === 0 ? 540 : 900
        wheelTurns.push({ node, end: start + degrees })
        animate(node, [
          { transform: `rotate(${start}deg)`, offset: 0, easing: 'cubic-bezier(.333333,0,.666667,.333333)' },
          { transform: `rotate(${start + degrees * a}deg)`, offset: 140 / definition.duration, easing: 'linear' },
          { transform: `rotate(${start + degrees * (a + c)}deg)`, offset: (140 + definition.cruise) / definition.duration, easing: 'cubic-bezier(.333333,1,.666667,1)' },
          { transform: `rotate(${start + degrees}deg)`, offset: (definition.duration - 80) / definition.duration },
          { transform: `rotate(${start + degrees}deg)`, offset: 1 },
        ], { delay: 100, duration: definition.duration, fill: 'forwards' })
      })
      const wave: Keyframe[] = []
      for (let start = 0; start <= 1560; start += 520) wave.push(
        { transform: 'translateY(0)', offset: start / 1720 },
        { transform: 'translateY(1.5px)', offset: (start + 80) / 1720 },
        { transform: 'translateY(0)', offset: (start + 160) / 1720 },
      )
      targets.keys.forEach((node, i) => animate(node, wave, { delay: 240 + i * 90, duration: 1720, easing: 'ease-in-out' }))
    } else {
      animate(targets.tab, [
        { transform: 'translateY(0)', offset: 0 }, { transform: 'translateY(1px)', offset: .25 },
        { transform: 'translateY(-1px)', offset: .75 }, { transform: 'translateY(0)', offset: 1 },
      ], { delay: 240, duration: 260, iterations: 7 })
    }
    for (const node of targets.windows) animate(node, [
      { borderColor: '#756354', offset: 0 }, { borderColor: '#619d94', offset: .4 }, { borderColor: '#756354', offset: 1 },
    ], { delay: 2140, duration: 300 })

    const finishes = reelDefinitions.map((definition, i) => {
      const count = definition.n + 3
      const denominator = 70 + definition.cruise + 260 / 3
      const a = 70 / denominator, c = definition.cruise / denominator
      const overshoot = mobile ? 2 : 3
      const position = (fraction: number, extra = true) => `translateY(calc(${-definition.n * 100 / count * fraction}% - ${extra ? overshoot * fraction : 0}px))`
      const animation = animate(targets.tracks[i], [
        { transform: 'translateY(0)', offset: 0, easing: 'cubic-bezier(.333333,0,.666667,.333333)' },
        { transform: position(a), offset: 140 / definition.duration, easing: 'linear' },
        { transform: position(a + c), offset: (140 + definition.cruise) / definition.duration, easing: 'cubic-bezier(.333333,1,.666667,1)' },
        { transform: position(1), offset: (definition.duration - 80) / definition.duration, easing: 'cubic-bezier(.4,0,.2,1)' },
        { transform: position(1, false), offset: 1 },
      ], { delay: 100, duration: definition.duration, fill: 'forwards' })
      return animation.finished.then(() => { if (!ended) targets.onStop(i) })
    })
    watchdog = setTimeout(() => complete(), 3200)
    void Promise.all(finishes).then(() => complete(true)).catch(() => complete())
  } catch {
    complete()
  }
  return { finish: () => complete(), cancel }
}
