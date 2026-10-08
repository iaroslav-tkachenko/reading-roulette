import { formats } from '../data/formats'
import { tones } from '../data/tones'
import { topics } from '../data/topics'
import type { ContentOption, ReadingCombination } from '../types/reading'

function pickOption(
  catalog: readonly ContentOption[],
  name: string,
  random: () => number,
): ContentOption {
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

// Each catalog gets its own draw. Repeats are allowed; no browser APIs are needed.
export function selectReadingCombination(random: () => number = Math.random): ReadingCombination {
  return {
    topic: pickOption(topics, 'topic', random),
    format: pickOption(formats, 'format', random),
    tone: pickOption(tones, 'tone', random),
  }
}
