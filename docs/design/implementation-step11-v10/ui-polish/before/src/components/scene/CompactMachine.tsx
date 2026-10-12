import { useLocale } from '../../i18n/LocaleContext'
import { artwork } from './artwork'
import { MachineSettings } from './MachineSettings'
import { DrumTypography } from './DrumTypography'
import { compactDrumGeometry as drum } from './compactDrumGeometry'
import { useSpinPress } from '../../motion/useSpinPress'
import type { ReadingCombination, ReadingSettings } from '../../types/reading'
import type { DrumSpinRun } from '../../motion/drumSpinController'

interface CompactMachineProps {
  settings: ReadingSettings
  combination: ReadingCombination | null
  onSettingsChange: (settings: ReadingSettings) => void
  onSpin: () => void
  run?: DrumSpinRun | null
  onSpinComplete?: (id: number) => void
}

// One set of live controls and the same prepared strips, arranged for a narrow screen.
export function CompactMachine({ settings, combination, onSettingsChange, onSpin, run, onSpinComplete }: CompactMachineProps) {
  const { t } = useLocale()
  const { pressed, handlers } = useSpinPress(onSpin, !!run)
  return (
    <div className="compact-machine">
      <header className="compact-heading">
        <h2>Reading Roulette</h2>
        <p>{t('brand.tagline')}</p>
      </header>
      <div className="compact-housing">
        <MachineSettings compact settings={settings} combination={combination} onChange={onSettingsChange} disabled={!!run} />
        <svg className="compact-drums" xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${drum.width} ${drum.step * 3}`} role="group" aria-label={t('reel.group')}>
          <defs>
            <pattern id="compact-parchment" width="360" height="120" patternUnits="userSpaceOnUse">
              <svg width="360" height="120" viewBox="600 250 1000 250" preserveAspectRatio="none">
                <image href={artwork['paper-v1.png']} width="2132" height="738" />
              </svg>
            </pattern>
            <linearGradient id="compact-cylinder" x2="0" y2="1">
              <stop stopColor="#39200f" stopOpacity=".3" /><stop offset=".32" stopColor="#fff6e2" stopOpacity="0" />
              <stop offset=".65" stopColor="#fff6e2" stopOpacity="0" /><stop offset="1" stopColor="#39200f" stopOpacity=".3" />
            </linearGradient>
          </defs>
          {[t('reel.topic').toUpperCase(), t('reel.format').toUpperCase(), t('reel.angle').toUpperCase()].map((title, index) => (
            <g key={title} transform={`translate(0 ${index * drum.step})`}>
              <rect x="6" y="3" width="348" height={drum.frameHeight} rx="12" fill="#552421" stroke="#c39554" strokeWidth="2" />
              <rect x="12" y={drum.windowY} width="336" height={drum.windowHeight} rx="8" fill="url(#compact-parchment)" />
              <rect x="12" y={drum.windowY} width="336" height={drum.windowHeight} rx="8" fill="url(#compact-cylinder)" />
              <text x="180" y={drum.titleY} textAnchor="middle" className="compact-column-title">{title}</text>
            </g>
          ))}
          <DrumTypography compact settings={settings} combination={combination} run={run} onComplete={onSpinComplete} />
        </svg>
        <button id="spin-control" className="compact-spin" type="button" aria-label={t(run ? 'spin.busy' : 'spin.action')} aria-controls="reading-prompt" aria-disabled={!!run} aria-busy={!!run} data-pressed={pressed} {...handlers}>
          <span aria-hidden="true">↻ </span>{t(run ? 'spin.busy' : 'spin.action')}
        </button>
      </div>
    </div>
  )
}
