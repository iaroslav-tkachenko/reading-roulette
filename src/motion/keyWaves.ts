// Every target is a complete key group, including its letter.
export const decorativeKeyOrder = ['Q', 'W', 'E', 'R', 'T', 'A', 'S', 'D', 'F', 'G', 'Y', 'U', 'I', 'O', 'P', 'H', 'J', 'K', 'L'] as const
export const keyWaveDelay = 240
export const keyWaveStagger = 45
export const keyWaveDuration = 2030
export const keyTravel = 4.5

export function keyWavePlans(spin: number) {
  // A private seeded shuffle changes the choreography without consuming result RNG.
  let seed = (spin ^ 0x9e3779b9) >>> 0
  const shuffle = () => {
    const order = [...decorativeKeyOrder]
    for (let index = order.length - 1; index > 0; index--) {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5
      const other = Math.floor((seed >>> 0) / 0x100000000 * (index + 1))
      ;[order[index], order[other]] = [order[other], order[index]]
    }
    return order
  }
  const first = shuffle()
  const second = shuffle()
  return decorativeKeyOrder.map(letter => ({
    letter,
    starts: [first.indexOf(letter) * keyWaveStagger, 1040 + second.indexOf(letter) * keyWaveStagger],
  }))
}

export function keyWaveFrames(starts: readonly number[]): Keyframe[] {
  const rest = (offset: number): Keyframe => ({ transform: 'translateY(0px)', filter: 'none', offset })
  const pressed = (offset: number): Keyframe => ({ transform: `translateY(${keyTravel}px)`, filter: 'brightness(.88) drop-shadow(0 1px .8px #160b0880)', offset })
  const frames: Keyframe[] = starts[0] === 0 ? [] : [rest(0)]
  for (const start of starts) frames.push(
    { ...rest(start / keyWaveDuration), easing: 'cubic-bezier(.2,0,.3,1)' },
    pressed((start + 45) / keyWaveDuration),
    { ...pressed((start + 85) / keyWaveDuration), easing: 'cubic-bezier(.2,.8,.2,1)' },
    rest((start + 180) / keyWaveDuration),
  )
  if (frames.at(-1)?.offset !== 1) frames.push(rest(1))
  return frames
}

export function playKeyWaves(keys: readonly (SVGGElement | null)[], startTime: number | null, spin = 1) {
  const animations: Animation[] = []
  const plans = keyWavePlans(spin)
  const cancel = () => { for (const animation of animations) animation.cancel() }
  try {
    keys.slice(0, decorativeKeyOrder.length).forEach((node, index) => {
      if (!node?.animate) return
      const animation = node.animate(keyWaveFrames(plans[index].starts), {
        delay: keyWaveDelay,
        duration: keyWaveDuration,
        easing: 'linear',
        fill: 'none',
      })
      animations.push(animation)
      void animation.finished.catch(() => {})
      if (typeof startTime === 'number') animation.startTime = startTime
    })
  } catch {
    // Decorative failure must not prevent the drums from revealing their result.
    cancel()
  }
  return { cancel }
}
