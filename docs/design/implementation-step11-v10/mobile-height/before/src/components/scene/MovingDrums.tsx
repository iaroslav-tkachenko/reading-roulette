import { catalogLabel } from '../../i18n/catalogs.ru'
import { useLayoutEffect, useRef } from 'react'
import { DrumLabel } from './DrumLabel'
import { drumStep, playSvgDrums } from '../../motion/svgDrumMotion'
import { decorativeKeyOrder } from '../../motion/keyWaves'
import { pointerDefinitions } from './pointerGeometry'
import type { DrumSpinRun } from '../../motion/drumSpinController'

export function MovingDrums({ run, onComplete, compact = false }: { run: DrumSpinRun; onComplete: (id: number) => void; compact?: boolean }) {
  const tracks = useRef<(SVGGElement | null)[]>([])
  useLayoutEffect(() => {
    const svg = tracks.current[0]?.ownerSVGElement
    const keys = decorativeKeyOrder.map(letter => svg?.querySelector<SVGGElement>(`g[data-layer="key-${letter}"]`) ?? null)
    const wheels = ['left', 'right'].map(side => svg?.querySelector<SVGGElement>(`g[data-wheel-tread="${side}"]`) ?? null)
    const pointers = pointerDefinitions.map(pointer => svg?.querySelector<SVGGElement>(`g[data-drum-pointer="${pointer.id}"]`) ?? null)
    const playback = playSvgDrums(tracks.current, run.drums, () => onComplete(run.id), undefined, keys, run.id, wheels, pointers)
    return () => playback.cancel()
  }, [run, onComplete, compact])

  return (
    <g data-layer="moving-drums" aria-hidden="true">
      <defs>
        {run.drums.map(drum => <clipPath key={drum.field} id={`drum-window-${drum.field}`}><rect x={drum.x - (compact ? 156 : 117)} y={compact ? 455 : 403} width={compact ? 312 : 234} height={compact ? 74 : 164} rx={compact ? 12 : 22} /></clipPath>)}
      </defs>
      {run.drums.map((drum, index) => (
        <g key={drum.field} transform={compact ? `translate(${180 - drum.x} ${73 - 489 + index * 120})` : undefined}>
        <g clipPath={`url(#drum-window-${drum.field})`} data-moving-drum={drum.field}>
          <g className="drum-track" ref={node => { tracks.current[index] = node }} data-target-value={run.to.combination ? catalogLabel(run.to.combination[drum.field], run.to.interfaceLocale ?? 'en') : ''}>
            {drum.rows.map((row, rowIndex) => {
              const selected = row.role === 'selected'
              const y = selected ? 489 : row.role === 'previous' ? 487 : 486
              return (
                <g key={rowIndex} transform={`translate(0 ${(rowIndex - 1) * drumStep})`} data-reel-row={rowIndex}>
                  <DrumLabel label={row.label} x={drum.x} y={y} selected={selected} angle={drum.field === 'angle'} />
                </g>
              )
            })}
          </g>
        </g>
        </g>
      ))}
    </g>
  )
}
