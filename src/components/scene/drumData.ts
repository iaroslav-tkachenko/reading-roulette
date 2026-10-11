import { topics } from '../../data/topics'
import { formats } from '../../data/formats'
import { angles } from '../../data/angles'
import type { ContentOption, ReadingCombination } from '../../types/reading'

export function selectedLines(label: string) {
  const lines: string[] = []
  for (const word of label.split(' ')) {
    const last = lines.length - 1
    if (last >= 0 && lines[last].length + word.length + 1 <= 14) lines[last] += ` ${word}`
    else lines.push(word)
  }
  return lines
}

export function neighborLabels(options: readonly ContentOption[], selected: ContentOption) {
  const index = options.findIndex(option => option.id === selected.id)
  if (index < 0) throw new Error(`Selected entry "${selected.id}" is missing from its drum catalog.`)
  return {
    previous: options[(index - 1 + options.length) % options.length].label,
    next: options[(index + 1) % options.length].label,
  }
}

export function drumDefinitions(combination: ReadingCombination) {
  const compatibleAngles = combination.format.angleIds.map(id => {
    const angle = angles.find(option => option.id === id)
    if (!angle) throw new Error(`Unknown angle "${id}" in format "${combination.format.id}".`)
    return angle
  })
  return [
    { field: 'topic', x: 505, selected: combination.topic, options: topics.toReversed() },
    { field: 'format', x: 777, selected: combination.format, options: formats.toReversed() },
    { field: 'angle', x: 1048, selected: combination.angle, options: compatibleAngles },
  ] as const
}
