// A native button overlays the accepted artwork; its face is still drawn by SVG.
export function SpinControl({ onSpin }: { onSpin: () => void }) {
  return (
    <foreignObject x="635" y="605" width="298" height="87.638" className="spin-control" data-layer="spin-control">
      <button id="spin-control" type="button" aria-label="SPIN" aria-controls="reading-prompt" onClick={onSpin} />
    </foreignObject>
  )
}
