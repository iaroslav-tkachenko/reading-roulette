import { pointerDefinitions } from '../components/scene/pointerGeometry'
import type { PreparedDrum } from './svgDrumMotion'

export const pointerAngle = 18
export const pointerRowsPerCycle = 5
export const pointerLiftFraction = .7
// Visual trial: one finger per drum. All six layers and animation frames remain.
// Add other pointer IDs here to restore their motion.
export const animatedPointerIds: readonly string[] = ['left', 'middle-left-format', 'right']

// The paper drags a hinged finger, then the spring returns it. Coarse cycles
// replace the 48 ms row ticks; the drum curve stretches startup and braking.
function travelTime(fraction: number, drum: PreparedDrum): number {
  if (fraction <= 0) return 0
  if (fraction >= 1) return drum.duration - 80
  const denominator = 70 + drum.cruise + 260 / 3
  const a = 70 / denominator
  const c = drum.cruise / denominator
  if (fraction < a) return 140 * Math.sqrt(fraction / a)
  if (fraction < a + c) return 140 + drum.cruise * (fraction - a) / c
  return 140 + drum.cruise + 260 * (1 - Math.cbrt(1 - (fraction - a - c) / (1 - a - c)))
}

export function pointerCycles(drum: PreparedDrum) {
  const count = Math.max(1, Math.round(drum.n / pointerRowsPerCycle))
  return Array.from({ length: count }, (_, index) => ({
    start: travelTime(index / count, drum),
    lifted: travelTime((index + pointerLiftFraction) / count, drum),
    end: travelTime((index + 1) / count, drum),
  }))
}

export function pointerFrames(drum: PreparedDrum, index: number): Keyframe[] {
  const pointer = pointerDefinitions[index]
  const frame = (time: number, angle = 0, easing = 'cubic-bezier(.4,0,.6,1)'): Keyframe => ({
    offset: time / drum.duration,
    transform: `rotate(${angle}deg)`,
    easing,
  })
  const frames: Keyframe[] = [frame(0)]
  for (const cycle of pointerCycles(drum)) {
    // Mirror angles so both tips follow the upward-moving paper.
    frames.push(frame(cycle.lifted, -pointer.side * pointerAngle, 'cubic-bezier(.3,0,.5,1)'), frame(cycle.end))
  }
  // Hold at rest during final strip settlement, with no extra impact.
  frames.push(frame(drum.duration))
  return frames
}

export function playDrumPointers(nodes: readonly (SVGGElement | null)[], drums: readonly PreparedDrum[], startTime: number | null) {
  const animations: Animation[] = []
  const cancel = () => { for (const animation of animations) animation.cancel() }
  pointerDefinitions.forEach((pointer, index) => {
    if (!animatedPointerIds.includes(pointer.id)) return
    const node = nodes[index]
    const drum = drums[pointer.drum]
    if (!node?.animate || !drum) return
    try {
      const animation = node.animate(pointerFrames(drum, index), { delay: 100, duration: drum.duration, fill: 'none' })
      animations.push(animation)
      void animation.finished.catch(() => {})
      if (typeof startTime === 'number') animation.startTime = startTime
    } catch {
      // Decorative failure must not affect the prepared result or other tracks.
    }
  })
  return { cancel }
}
