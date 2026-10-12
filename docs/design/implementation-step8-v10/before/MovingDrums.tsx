import { useLayoutEffect, useRef } from 'react'
import { selectedLines } from './drumData'
import { drumStep, playSvgDrums } from '../../motion/svgDrumMotion'
import type { DrumSpinRun } from '../../motion/drumSpinController'

export function MovingDrums({ run, onComplete }: { run: DrumSpinRun; onComplete: (id: number) => void }) {
  const tracks = useRef<(SVGGElement | null)[]>([])
  useLayoutEffect(() => {
    const playback = playSvgDrums(tracks.current, run.drums, () => onComplete(run.id))
    return () => playback.cancel()
  }, [run, onComplete])

  return (
    <g data-layer="moving-drums" aria-hidden="true">
      <defs>
        {run.drums.map(drum => <clipPath key={drum.field} id={`drum-window-${drum.field}`}><rect x={drum.x - 117} y="403" width="234" height="164" rx="22" /></clipPath>)}
      </defs>
      {run.drums.map((drum, index) => (
        <g key={drum.field} clipPath={`url(#drum-window-${drum.field})`} data-moving-drum={drum.field}>
          <g className="drum-track" ref={node => { tracks.current[index] = node }} data-target-value={run.to.combination[drum.field].label}>
            {drum.rows.map((row, rowIndex) => {
              const selected = row.role === 'selected'
              const angle = drum.field === 'angle'
              const lines = selected && angle ? selectedLines(row.label) : [row.label]
              const y = selected ? (lines.length > 1 ? 475 : 489) : row.role === 'previous' ? 487 : 486
              return (
                <g key={rowIndex} transform={`translate(0 ${(rowIndex - 1) * drumStep})`} data-reel-row={rowIndex}>
                  <text x={drum.x} y={y} className={selected ? 'selected' : 'neighbor'} textAnchor="middle" style={angle ? { fontSize: selected ? '26px' : row.role === 'previous' ? '17px' : '18px' } : undefined}>
                    {selected ? lines.map((line, lineIndex) => <tspan key={lineIndex} x={drum.x} dy={lineIndex === 0 ? 0 : 30}>{line}</tspan>) : row.label}
                  </text>
                </g>
              )
            })}
          </g>
        </g>
      ))}
    </g>
  )
}
