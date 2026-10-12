import { artwork } from './artwork'
import { pointerDefinitions, pointerMounts, pointerBackgroundPatches } from './pointerGeometry'

export function MechanicalCradle() {
  const image = <image href={artwork['mechanism-v2.png']} width="2157" height="729" />
  return (
    <svg x="294" y="333" width="950" height="256.202" viewBox="106 90 1943 524" overflow="hidden">
      <defs>
        {(['black', 'white'] as const).map(color => (
          <linearGradient key={color} id={`pointer-patch-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={color} stopOpacity="0" />
            <stop offset=".1" stopColor={color} />
            <stop offset=".9" stopColor={color} />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        ))}
        <linearGradient id="pointer-arm-brass" gradientUnits="userSpaceOnUse" x1="0" y1="-8" x2="0" y2="8">
          <stop stopColor="#473019" />
          <stop offset=".35" stopColor="#d8ad69" />
          <stop offset=".6" stopColor="#926032" />
          <stop offset="1" stopColor="#36220f" />
        </linearGradient>
        <radialGradient id="pointer-pin-brass" cx=".35" cy=".28" r=".8">
          <stop stopColor="#f3d194" />
          <stop offset=".45" stopColor="#b58648" />
          <stop offset="1" stopColor="#49301a" />
        </radialGradient>
        <mask id="cradle-without-pointers" maskUnits="userSpaceOnUse" x="0" y="0" width="2157" height="729">
          <rect width="2157" height="729" fill="white" />
          {pointerBackgroundPatches.map(patch => <rect key={patch.id} x={patch.x} y={patch.y} width={patch.width} height={patch.height} fill="url(#pointer-patch-black)" />)}
        </mask>
        <mask id="pointer-background-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="2157" height="729">
          {pointerBackgroundPatches.map(patch => <rect key={patch.id} x={patch.x} y={patch.y} width={patch.width} height={patch.height} fill="url(#pointer-patch-white)" />)}
        </mask>
        {pointerDefinitions.map(pointer => (
          <clipPath key={pointer.id} id={`pointer-cut-${pointer.id}`}><path d={pointer.path} /></clipPath>
        ))}
      </defs>
      {/* A stationary continuation of every arc/post, feathered into the PNG.
          The paper remains underneath its transparent drum-window sections. */}
      <g data-layer="pointer-background" mask="url(#pointer-background-mask)" pointerEvents="none" aria-hidden="true">
        {pointerBackgroundPatches.map(patch => (
          <svg key={patch.id} data-pointer-background={patch.id} x={patch.x} y={patch.y} width={patch.width} height={patch.height}
            viewBox={`${patch.x} ${patch.donorY} ${patch.width} ${patch.donorHeight}`} preserveAspectRatio="none" overflow="hidden">
            {image}
          </svg>
        ))}
      </g>
      <g mask="url(#cradle-without-pointers)">{image}</g>
      <g data-layer="drum-pointers" pointerEvents="none" aria-hidden="true">
        {pointerDefinitions.map(pointer => (
          <g key={pointer.id} transform={`translate(${pointer.x} ${pointer.y})`}>
            <g data-drum-pointer={pointer.id}>
              <path d={`M0 0 H${pointer.side * 24}`} stroke="#28190d" strokeWidth="16" strokeLinecap="round" />
              <path d={`M0 0 H${pointer.side * 24}`} stroke="url(#pointer-arm-brass)" strokeWidth="11" strokeLinecap="round" />
              <g transform={`translate(${-pointer.x} ${-pointer.y})`} clipPath={`url(#pointer-cut-${pointer.id})`}>
                {image}
              </g>
            </g>
          </g>
        ))}
      </g>
      <g data-layer="pointer-pins" pointerEvents="none" aria-hidden="true">
        {pointerMounts.map(mount => (
          <g key={mount.id} data-pointer-pin={mount.id} transform={`translate(${mount.x} ${mount.y})`}>
            <circle r="12" fill="#1a1009" opacity=".8" />
            <circle r="9" fill="url(#pointer-pin-brass)" stroke="#5c3a1c" strokeWidth="1.5" />
            <path d="M-3.5 3.5 L3.5 -3.5" stroke="#3a2513" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  )
}
