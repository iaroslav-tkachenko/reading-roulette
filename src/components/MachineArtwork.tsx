import type { RefCallback } from 'react'
import wheel from '../../docs/design/assets/wheel-display.svg'
import keycap from '../../docs/design/assets/keycap-display.svg'

export function MachineWheel({ side, nodeRef }: { side: 'left' | 'right'; nodeRef: RefCallback<HTMLSpanElement> }) {
  return (
    <span className={`wheel-mount wheel-mount-${side}`} aria-hidden="true">
      <span className={`wheel wheel-${side}`} ref={nodeRef}><img src={wheel} alt="" draggable="false" /></span>
      <span className="wheel-hub" />
    </span>
  )
}

export function DecorativeKeys({ rows, register }: { rows: string[]; register: (letter: string, node: HTMLSpanElement | null) => void }) {
  return <div className="decor-keys" aria-hidden="true">{rows.map(row => (
    <div className="key-row" key={row}>{[...row].map(letter => (
      <span className="keycap" key={letter} data-letter={letter} ref={node => { register(letter, node) }}>
        <img src={keycap} alt="" draggable="false" /><b>{letter}</b>
      </span>
    ))}</div>
  ))}</div>
}
