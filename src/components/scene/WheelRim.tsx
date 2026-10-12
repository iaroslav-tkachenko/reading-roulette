import { artwork } from './artwork'

// Only the tread moves. The PNG underneath retains the silhouette, face and axle.
// Reuse a central tread sample, including its worn brass texture, rather than
// rotating the side-view photograph in the plane of the screen.
export function WheelRim({ side }: { side: 'left' | 'right' }) {
  const id = `wheel-rim-${side}`
  return (
    <g id={id} data-layer={id} aria-hidden="true" pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset=".18" stopColor="white" />
          <stop offset=".82" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="125" y="190" width="325" height="1240">
          <path d="M310 190 L445 190 C360 460 375 1130 430 1430 L310 1430 C100 1270 100 410 310 190Z" fill={`url(#${id}-fade)`} />
        </mask>
        <pattern id={`${id}-texture`} patternUnits="userSpaceOnUse" width="971" height="108" overflow="hidden">
          <image href={artwork['wheel-v1.png']} width="971" height="1619" y="-649" />
        </pattern>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <g data-wheel-tread={side}>
          <rect x="125" y="-1600" width="325" height="4800" fill={`url(#${id}-texture)`} />
        </g>
      </g>
    </g>
  )
}
