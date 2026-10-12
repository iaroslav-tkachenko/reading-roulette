export const wheelPitch = 108
export const wheelStartDelay = 100
const periods = 12

interface WheelProfile { duration: number; cruise: number }

// Match the last drum's start, acceleration and final stop. No overshoot or
// reverse correction: a tread continues forward throughout braking.
export function wheelProgress(time: number, profile: WheelProfile): number {
  const acceleration = 140
  const brake = profile.duration - acceleration - profile.cruise
  const denominator = acceleration / 2 + profile.cruise + brake / 3
  const a = acceleration / 2 / denominator
  const c = profile.cruise / denominator
  if (time <= 0) return 0
  if (time < acceleration) return a * (time / acceleration) ** 2
  if (time < acceleration + profile.cruise) return a + c * (time - acceleration) / profile.cruise
  if (time < profile.duration) return a + c + (1 - a - c) * (1 - (1 - (time - acceleration - profile.cruise) / brake) ** 3)
  return 1
}

export function wheelFrames(phase: number, profile: WheelProfile): Keyframe[] {
  const position = (time: number) => `translateY(${phase + periods * wheelPitch * wheelProgress(time, profile)}px)`
  return [
    { transform: position(0), offset: 0, easing: 'cubic-bezier(.333333,0,.666667,.333333)' },
    { transform: position(140), offset: 140 / profile.duration, easing: 'linear' },
    { transform: position(140 + profile.cruise), offset: (140 + profile.cruise) / profile.duration, easing: 'cubic-bezier(.333333,1,.666667,1)' },
    { transform: position(profile.duration), offset: 1 },
  ]
}

const phases = new WeakMap<SVGGElement, number>()

export function playWheelRims(nodes: readonly (SVGGElement | null)[], startTime: number | null, profile: WheelProfile) {
  const active: { node: SVGGElement; animation: Animation; phase: number; done: boolean }[] = []
  let stopped = false
  const cancel = () => {
    if (stopped) return
    stopped = true
    for (const entry of active) {
      const localTime = entry.done ? profile.duration : Number(entry.animation.currentTime ?? 0) - wheelStartDelay
      const phase = (entry.phase + periods * wheelPitch * wheelProgress(localTime, profile)) % wheelPitch
      phases.set(entry.node, phase)
      // Persist the current periodic texture offset before removing the effect.
      // Reducing by whole pitches is visually identical, including on interrupt.
      entry.node.style.transform = `translateY(${phase}px)`
      entry.node.dataset.wheelPhase = String(phase)
      entry.animation.cancel()
    }
  }
  for (const node of nodes) {
    if (!node?.animate) continue
    try {
      const phase = phases.get(node) ?? 0
      const animation = node.animate(wheelFrames(phase, profile), {
        delay: wheelStartDelay, duration: profile.duration, fill: 'both',
      })
      const entry = { node, animation, phase, done: false }
      active.push(entry)
      void animation.finished.then(() => { entry.done = true }, () => {})
      if (typeof startTime === 'number') animation.startTime = startTime
    } catch {
      // A failed decorative wheel must not interrupt the drums or result commit.
    }
  }
  return { cancel }
}
