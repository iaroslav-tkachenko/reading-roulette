import { drumDefinitions, neighborLabels } from './drumData'
import { DrumLabel } from './DrumLabel'
import { MovingDrums } from './MovingDrums'
import type { ReadingCombination, ReadingSettings } from '../../types/reading'
import type { DrumSpinRun } from '../../motion/drumSpinController'

export function DrumTypography({ combination, settings, run, onComplete }: { combination: ReadingCombination | null; settings?: ReadingSettings; run?: DrumSpinRun | null; onComplete?: (id: number) => void }) {

  if (run && onComplete) return (
    <g id="drum-typography" data-layer="drum-typography" aria-hidden="true">
      <MovingDrums run={run} onComplete={onComplete} />
    </g>
  )

  const drums = drumDefinitions(combination, settings)

  return (
    <g id="drum-typography" data-layer="drum-typography">
      <title>Current result and neighboring entries from the real catalogs</title>
      {drums.map(({ field, x, selected, options }) => {
        const neighbors = neighborLabels(options, selected)
        return (
          <g key={field} data-drum-field={field} data-selected-value={selected.label}>
            <DrumLabel label={neighbors.previous} x={x} y={427} />
            <DrumLabel label={selected.label} x={x} y={489} selected angle={field === 'angle'} />
            <DrumLabel label={neighbors.next} x={x} y={546} />
          </g>
        )
      })}
    </g>
  )
}
