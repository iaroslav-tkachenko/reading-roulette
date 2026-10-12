import { useLocale } from '../../i18n/LocaleContext'
import { drumDefinitions, neighborLabels } from './drumData'
import { DrumLabel } from './DrumLabel'
import { MovingDrums } from './MovingDrums'
import { compactDrumGeometry as drum } from './compactDrumGeometry'
import type { ReadingCombination, ReadingSettings } from '../../types/reading'
import type { DrumSpinRun } from '../../motion/drumSpinController'

export function DrumTypography({ combination, settings, run, onComplete, compact = false }: { combination: ReadingCombination | null; settings?: ReadingSettings; run?: DrumSpinRun | null; onComplete?: (id: number) => void; compact?: boolean }) {

  const { locale, t } = useLocale()
  if (run && onComplete) return (
    <g id="drum-typography" data-layer="drum-typography" aria-hidden="true">
      <MovingDrums run={run} onComplete={onComplete} compact={compact} />
    </g>
  )

  const drums = drumDefinitions(combination, settings, locale)

  return (
    <g id="drum-typography" data-layer="drum-typography">
      <title>{t('reel.description')}</title>
      {drums.map(({ field, x, selected, options }, index) => {
        const neighbors = neighborLabels(options, selected)
        return (
          <g key={field} data-drum-field={field} data-selected-value={selected.label} transform={compact ? `translate(${180 - x} ${drum.baselineY - 489 + index * drum.step})` : undefined}>
            {!compact && <DrumLabel label={neighbors.previous} x={x} y={427} />}
            <DrumLabel label={selected.label} x={x} y={489} selected angle={field === 'angle'} compact={compact} />
            {!compact && <DrumLabel label={neighbors.next} x={x} y={546} />}
          </g>
        )
      })}
    </g>
  )
}
