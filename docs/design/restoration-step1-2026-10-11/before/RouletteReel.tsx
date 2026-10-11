import type { RefCallback } from 'react'

interface Props {
  title: string
  value: string
  labels: readonly string[]
  neighbors: readonly string[]
  moving: boolean
  trackRef: RefCallback<HTMLDivElement>
  windowRef: RefCallback<HTMLDivElement>
}

export function RouletteReel({ title, value, labels, neighbors, moving, trackRef, windowRef }: Props) {
  return (
    <article className={`reel${moving ? ' moving' : ''}`} data-state={moving ? 'moving' : 'settled'}>
      <h3>{title}</h3>
      <div className="reel-window" ref={windowRef}>
        <div className="neighbor">{neighbors[0]}</div>
        <div className="reel-center">
          <div className="reel-sizer">{[...new Set(labels)].map(label => <span key={label}>{label}</span>)}</div>
          <div className="reel-still">{value}</div>
          <div className="reel-track" ref={trackRef} hidden={!moving} style={{ height: `${labels.length * 100}%` }}>
            {labels.map((label, index) => <div className="reel-cell" key={index}>{label}</div>)}
          </div>
        </div>
        <div className="neighbor">{neighbors.at(-1)}</div>
      </div>
    </article>
  )
}
