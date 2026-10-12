import { useLayoutEffect, useRef } from 'react'
import { DrumLabel } from './DrumLabel'
import { drumStep, playSvgDrums } from '../../motion/svgDrumMotion'
import { decorativeKeyOrder } from '../../motion/keyWaves'
import { pointerDefinitions } from './pointerGeometry'
import type { DrumSpinRun } from '../../motion/drumSpinController'

export function MovingDrums({ run, onComplete }: { run: DrumSpinRun; onComplete: (id: number) => void }) {
  const tracks = useRef<(SVGGElement | null)[]>([])
  useLayoutEffect(() => {
    const svg = tracks.current[0]?.ownerSVGElement
    const keys = decorativeKeyOrder.map(letter => svg?.querySelector<SVGGElement>(`g[data-layer="key-${letter}"]`) ?? null)
    const wheels = ['left', 'right'].map(side => svg?.querySelector<SVGGElement>(`g[data-wheel-tread="${side}"]`) ?? null)
    const pointers = pointerDefinitions.map(pointer => svg?.querySelector<SVGGElement>(`g[data-drum-pointer="${pointer.id}"]`) ?? null)
    const playback = playSvgDrums(tracks.current, run.drums, () => onComplete(run.id), undefined, keys, run.id, wheels, pointers)
    return () => playback.cancel()
  }, [run, onComplete])

  return (
    <g data-layer="moving-drums" aria-hidden="true">
      <defs>
        {run.drums.map(drum => <clipPath key={drum.field} id={`drum-window-${drum.field}`}><rect x={drum.x - 117} y="403" width="234" height="164" rx="22" /></clipPath>)}
      </defs>
      {run.drums.map((drum, index) => (
        <g key={drum.field} clipPath={`url(#drum-window-${drum.field})`} data-moving-drum={drum.field}>
          <g className="drum-track" ref={node => { tracks.current[index] = node }} data-target-value={run.to.combination?.[drum.field].label}>
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
      ))}
    </g>
  )
}
