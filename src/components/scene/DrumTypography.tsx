import { drumDefinitions, neighborLabels, selectedLines } from './drumData'
import { MovingDrums } from './MovingDrums'
import type { ReadingCombination } from '../../types/reading'
import type { DrumSpinRun } from '../../motion/drumSpinController'

export function DrumTypography({ combination, run, onComplete }: { combination: ReadingCombination; run?: DrumSpinRun | null; onComplete?: (id: number) => void }) {
  const drums = drumDefinitions(combination)

  if (run && onComplete) return (
    <g id="drum-typography" data-layer="drum-typography" aria-hidden="true">
      <MovingDrums run={run} onComplete={onComplete} />
    </g>
  )

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
