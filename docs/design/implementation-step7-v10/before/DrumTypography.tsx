import { topics } from '../../data/topics'
import { formats } from '../../data/formats'
import { angles } from '../../data/angles'
import type { ContentOption, ReadingCombination } from '../../types/reading'

// The current angle catalog fits in two lines without abbreviation or clipping.
function selectedLines(label: string) {
  const lines: string[] = []
  for (const word of label.split(' ')) {
    const last = lines.length - 1
    if (last >= 0 && lines[last].length + word.length + 1 <= 14) {
      lines[last] += ` ${word}`
    } else {
      lines.push(word)
    }
  }
  return lines
}

function neighborLabels(options: readonly ContentOption[], selected: ContentOption) {
  const index = options.findIndex(option => option.id === selected.id)
  if (index < 0) throw new Error(`Selected entry "${selected.id}" is missing from its drum catalog.`)
  return {
    previous: options[(index - 1 + options.length) % options.length].label,
    next: options[(index + 1) % options.length].label,
  }
}

export function DrumTypography({ combination }: { combination: ReadingCombination }) {
  const compatibleAngles = combination.format.angleIds.map(id => {
    const angle = angles.find(option => option.id === id)
    if (!angle) throw new Error(`Unknown angle "${id}" in format "${combination.format.id}".`)
    return angle
  })
  const drums = [
    { field: 'topic', x: 505, selected: combination.topic, options: topics.toReversed() },
    { field: 'format', x: 777, selected: combination.format, options: formats.toReversed() },
    { field: 'angle', x: 1048, selected: combination.angle, options: compatibleAngles },
  ]

  return (
    <g id="drum-typography" data-layer="drum-typography">
      <title>Current result and neighboring entries from the real catalogs</title>
      {drums.map(({ field, x, selected, options }) => {
        const neighbors = neighborLabels(options, selected)
        const isAngle = field === 'angle'
        const lines = isAngle ? selectedLines(selected.label) : [selected.label]
        return (
          <g key={field} data-drum-field={field} data-selected-value={selected.label}>
            <text x={x} y="427" className="neighbor" textAnchor="middle" style={isAngle ? { fontSize: '17px' } : undefined}>{neighbors.previous}</text>
            <text x={x} y={lines.length > 1 ? 475 : 489} className="selected" textAnchor="middle" aria-label={selected.label} style={isAngle ? { fontSize: '26px' } : undefined}>
              {lines.map((line, index) => <tspan key={index} x={x} dy={index === 0 ? 0 : 30}>{line}</tspan>)}
            </text>
            <text x={x} y="546" className="neighbor" textAnchor="middle" style={isAngle ? { fontSize: '18px' } : undefined}>{neighbors.next}</text>
          </g>
        )
      })}
    </g>
  )
}
