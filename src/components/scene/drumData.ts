import { topics } from '../../data/topics'
import { formats } from '../../data/formats'
import { angles } from '../../data/angles'
import { getSelectionPool } from '../../random/compatibility'
import type { ContentOption, ReadingCombination, ReadingSettings } from '../../types/reading'

export function selectedLines(label: string, maxLength = 18) {
  const lines: string[] = []
  for (const word of label.split(' ')) {
    const last = lines.length - 1
    if (last >= 0 && lines[last].length + word.length + 1 <= maxLength) lines[last] += ` ${word}`
    else lines.push(word)
  }
  return lines
}

export function neighborLabels(options: readonly ContentOption[], selected: ContentOption) {
  const index = options.findIndex(option => option.id === selected.id)
  if (selected.id === '--') return { previous: options.at(-1)?.label ?? '', next: options[0]?.label ?? '' }
  if (index < 0) throw new Error(`Selected entry "${selected.id}" is missing from its drum catalog.`)
  return {
    previous: options[(index - 1 + options.length) % options.length].label,
    next: options[(index + 1) % options.length].label,
  }
}

export function drumDefinitions(combination: ReadingCombination | null, settings?: ReadingSettings) {
  const pool = settings ? getSelectionPool(settings).flatMap(family => family.formats) : null
  const topicPool = pool ? topics.filter(topic => pool.some(format => format.topics.some(item => item.topic.id === topic.id))) : topics
  const formatPool = pool ? formats.filter(format => pool.some(item => item.format.id === format.id)) : formats
  const compatibleAngles = combination ? (pool ? pool.find(item => item.format.id === combination.format.id)?.topics.find(item => item.topic.id === combination.topic.id)?.angles ?? [] : combination.format.angleIds.map(id => {
    const angle = angles.find(item => item.id === id)
    if (!angle) throw new Error(`Unknown angle "${id}".`)
    return angle
  })) : pool ? angles.filter(angle => pool.some(format => format.topics.some(topic => topic.angles.some(item => item.id === angle.id)))) : angles
  const blank: ContentOption = { id: '--', label: 'Press SPIN', promptHint: '' }
  return [
    { field: 'topic', x: 505, selected: combination?.topic ?? blank, options: topicPool.toReversed() },
    { field: 'format', x: 777, selected: combination?.format ?? blank, options: formatPool.toReversed() },
    { field: 'angle', x: 1048, selected: combination?.angle ?? blank, options: compatibleAngles },
  ] as const
}
