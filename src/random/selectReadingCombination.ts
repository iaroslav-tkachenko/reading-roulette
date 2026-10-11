import { getSelectionPool, readingCatalogs } from './compatibility'
import type { ReadingCatalogs } from './compatibility'
import type { ReadingCombination, ReadingSettings } from '../types/reading'

function pickOption<T>(
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

// Four draws: weighted available family, then uniform format, topic and angle.
// No topic/angle coefficients. Repeats allowed. Animation never consumes these draws.
export function selectReadingCombination(settings: ReadingSettings, random: () => number = Math.random, catalogs: ReadingCatalogs = readingCatalogs): ReadingCombination {
  const pools = getSelectionPool(settings, catalogs)
  const sample = random()
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new Error('Random source must return a finite number in [0, 1).')
  const threshold = sample * pools.reduce((sum, pool) => sum + pool.weight, 0)
  let cumulative = 0
  const pool = pools.find(item => { cumulative += item.weight; return threshold < cumulative })
  if (!pool) throw new Error('Could not resolve a reading family.')
  const { format, topics } = pickOption(pool.formats, 'compatible format', random)
  const { topic, angles } = pickOption(topics, 'compatible topic', random)
  return { topic, format, angle: pickOption(angles, 'compatible angle', random) }
}
