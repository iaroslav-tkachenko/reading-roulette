import { artwork } from './artwork'

// Geometry and layer order preserved from the accepted v10 reference.
export function RoomBackdrop() {
  return (
<div className="room-backdrop" data-layer="study-background" aria-hidden="true">
<svg xmlns="http://www.w3.org/2000/svg" className="desk-continuation" width="100%" height="100%" data-layer="desk-continuation">
<defs>
<pattern id="desk-grain" width="2000" height="784" patternUnits="userSpaceOnUse">
<svg width="1000" height="392" viewBox="350 600 1000 392">
<image href={artwork['study-shell-v7.png']} width="1584" height="993"/>
</svg>
<g transform="translate(2000 0) scale(-1 1)">
<svg width="1000" height="392" viewBox="350 600 1000 392">
<image href={artwork['study-shell-v7.png']} width="1584" height="993"/>
</svg>
</g>
<g transform="translate(0 784) scale(1 -1)">
<svg width="1000" height="392" viewBox="350 600 1000 392">
<image href={artwork['study-shell-v7.png']} width="1584" height="993"/>
</svg>
<g transform="translate(2000 0) scale(-1 1)">
<svg width="1000" height="392" viewBox="350 600 1000 392">
<image href={artwork['study-shell-v7.png']} width="1584" height="993"/>
</svg>
</g>
</g>
</pattern>
</defs>
<rect width="100%" height="100%" fill="url(#desk-grain)"/>
</svg>
<svg xmlns="http://www.w3.org/2000/svg" className="room-wall-base" data-layer="study-wall-base">
<defs>
<pattern id="wall-grain" width="1244" height="594" patternUnits="userSpaceOnUse">
<svg width="622" height="594" viewBox="350 0 600 573">
<image href={artwork['study-shell-v7.png']} width="1584" height="993"/>
</svg>
<g transform="translate(1244 0) scale(-1 1)">
<svg width="622" height="594" viewBox="350 0 600 573">
<image href={artwork['study-shell-v7.png']} width="1584" height="993"/>
</svg>
</g>
</pattern>
</defs>
<rect width="100%" height="100%" fill="url(#wall-grain)"/>
</svg>
<svg xmlns="http://www.w3.org/2000/svg" className="room-desk" viewBox="0 573 1584 420" data-layer="study-desk">
<defs>
<linearGradient id="room-edge-fade">
<stop stopColor="black"/>
<stop offset=".045" stopColor="white"/>
<stop offset=".955" stopColor="white"/>
<stop offset="1" stopColor="black"/>
</linearGradient>
<mask id="room-edge-mask" maskContentUnits="objectBoundingBox">
<rect width="1" height="1" fill="url(#room-edge-fade)"/>
</mask>
</defs>
<defs>
<linearGradient id="desk-fade" x2="0" y2="1">
<stop offset=".72" stopColor="white"/>
<stop offset="1" stopColor="black"/>
</linearGradient>
<mask id="desk-continuation-mask" maskContentUnits="objectBoundingBox">
<rect width="1" height="1" fill="url(#desk-fade)"/>
</mask>
</defs>
<g mask="url(#room-edge-mask)">
<g mask="url(#desk-continuation-mask)">
<image href={artwork['study-shell-v7.png']} width="1584" height="993"/>
</g>
</g>
</svg>
<svg xmlns="http://www.w3.org/2000/svg" className="room-architecture" viewBox="0 0 1536 1000" overflow="visible" data-layer="complete-wall-architecture">
<svg x="-118.60384615384618" y="0" width="328.6038461538462" height="594" viewBox="64 36 863 1560" data-layer="study-window-wide">
<image href={artwork['study-window-wide-v8.png']} width="972" height="1619"/>
</svg>
<svg x="1364" y="0" width="364.85694915254237" height="594" viewBox="54 53 906 1475" data-layer="study-bookcase-wide">
<image href={artwork['study-bookcase-wide-v8.png']} width="988" height="1592"/>
</svg>
</svg>
<svg xmlns="http://www.w3.org/2000/svg" className="room-props" viewBox="0 0 1536 1000" overflow="visible" data-layer="complete-tabletop-props">
<svg x="-30" y="189.4011834319527" width="258" height="458.5988165680473" viewBox="45 67 845 1502" data-layer="desk-lamp-books">
<image href={artwork['desk-lamp-books-v7.png']} width="930" height="1692"/>
</svg>
<svg x="-360" y="900.339593114241" width="620" height="402.660406885759" viewBox="135 112 1278 830" data-layer="desk-books">
<image href={artwork['desk-books-v7.png']} width="1536" height="1024"/>
</svg>
<svg x="1370" y="531.0338389731622" width="164" height="248.9661610268378" viewBox="101 139 857 1301" data-layer="desk-pen-cup">
<image href={artwork['desk-pen-cup-v7.png']} width="1024" height="1536"/>
</svg>
</svg>
</div>
  )
}
