import { formats } from '../data/formats'
import { angles } from '../data/angles'
import { topics } from '../data/topics'
import type { ContentOption, ReadingCombination } from '../types/reading'

function pickOption<T extends ContentOption>(
  catalog: readonly T[],
  name: string,
  random: () => number,
): T {
  if (catalog.length === 0) {
    throw new Error(`Cannot select from the empty ${name} catalog.`)
  }

  const sample = random()
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new Error('Random source must return a finite number in [0, 1).')
  }

  const option = catalog[Math.floor(sample * catalog.length)]
  if (!option) {
    throw new Error(`The ${name} catalog contains a missing option.`)
  }

  return option
}

// Three draws: topic, format, then an angle compatible with that format.
// Repeats are allowed; decorative animation must not affect these draws.
export function selectReadingCombination(random: () => number = Math.random): ReadingCombination {
  const topic = pickOption(topics, 'topic', random)
  const format = pickOption(formats, 'format', random)
  // Resolve every allowed ID before drawing, so broken catalog references fail explicitly.
  const compatibleAngles = format.angleIds.map((id) => {
    const angle = angles.find((option) => option.id === id)
    if (!angle) throw new Error(`Unknown angle "${id}" in format "${format.id}".`)
    return angle
  })

  return {
    topic,
    format,
    angle: pickOption(compatibleAngles, 'compatible angle', random),
  }
}
