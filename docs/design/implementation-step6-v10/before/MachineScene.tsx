import { artwork } from './artwork'
import { MachineSettings } from './MachineSettings'
import { DrumTypography } from './DrumTypography'
import { SpinControl } from './SpinControl'
import type { ReadingCombination, ReadingSettings } from '../../types/reading'

interface MachineSceneProps {
  settings: ReadingSettings
  combination: ReadingCombination
  onSettingsChange: (settings: ReadingSettings) => void
  onSpin: () => void
}

// Geometry and layer order preserved from the accepted v10 reference.
export function MachineScene({ settings, combination, onSettingsChange, onSpin }: MachineSceneProps) {
  return (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 64 1536 754" width="1536" height="754" role="group" aria-labelledby="scene-title" aria-describedby="scene-desc">
<title id="scene-title">Reading Roulette</title>
<desc id="scene-desc">Choose a language, CEFR level and text length, then press SPIN for a random result. Current combination: {combination.topic.label}, {combination.format.label}, {combination.angle.label}.</desc>
<defs>
  <linearGradient id="field" x2="0" y2="1">
<stop stopColor="#fff8ed" stopOpacity=".92"/>
<stop offset="1" stopColor="#fff1da" stopOpacity=".7"/>
</linearGradient>
  <linearGradient id="card" x2="0" y2="1">
<stop stopColor="#ffefd8"/>
<stop offset="1" stopColor="#f3dab9"/>
</linearGradient>
  <filter id="shadow" x="-20%" y="-50%" width="140%" height="210%">
<feGaussianBlur stdDeviation="15"/>
</filter>
  <clipPath id="drum-area">
<rect x="360" y="400" width="840" height="184" rx="20"/>
</clipPath>
  <style>{"text{font-family:Georgia,'Times New Roman',serif;fill:#10262b}.label{font-size:15px;font-weight:700;letter-spacing:.6px}.value{font-size:24px}.neighbor{font-size:22px;fill:#987a65}.selected{font-size:29px;font-weight:700}.column-title{font-size:19px;font-weight:700;fill:#ffe29a;letter-spacing:3px}.key-letter{font-size:23px;font-weight:700;fill:#302015;text-anchor:middle}.paper-copy{font-family:Consolas,'Courier New',monospace;font-size:18px}"}</style>
</defs>
<g id="contact-shadow" data-layer="contact-shadow">
<title>Contact shadow beneath the assembled machine</title>
<ellipse cx="770" cy="812" rx="572" ry="38" fill="#160b08" opacity=".68" filter="url(#shadow)"/>
</g>
<g id="chassis" data-layer="chassis">
<title>chassis</title>
<svg x="195" y="523" width="1145" height="294.444" viewBox="18 117 2061 530" overflow="hidden">
<image href={artwork['chassis-v3.png']} width="2100" height="749"/>
</svg>
</g>
<g id="settings-panel" data-layer="settings-panel">
<title>settings-panel</title>
<svg x="313" y="258" width="910" height="151.978" viewBox="114 202 1946 325" overflow="hidden">
<image href={artwork['settings-v2.png']} width="2172" height="724"/>
</svg>
</g>
<MachineSettings settings={settings} onChange={onSettingsChange} />
<g id="drum-paper" data-layer="drum-paper">
<title>Three independent parchment cylinders behind the metal cradle</title>
<g clipPath="url(#drum-area)">
<g id="drum-1" data-layer="drum-1">
<title>drum-1</title>
<svg x="365" y="395" width="282" height="171.94" viewBox="97 172 1235 753" overflow="hidden">
<image href={artwork['drum-v1.png']} width="1429" height="1100"/>
</svg>
</g>
<g id="drum-2" data-layer="drum-2">
<title>drum-2</title>
<svg x="638" y="395" width="282" height="171.94" viewBox="97 172 1235 753" overflow="hidden">
<image href={artwork['drum-v1.png']} width="1429" height="1100"/>
</svg>
</g>
<g id="drum-3" data-layer="drum-3">
<title>drum-3</title>
<svg x="910" y="395" width="282" height="171.94" viewBox="97 172 1235 753" overflow="hidden">
<image href={artwork['drum-v1.png']} width="1429" height="1100"/>
</svg>
</g>
</g>
</g>
<DrumTypography combination={combination} />
<g id="left-wheel" data-layer="left-wheel">
<title>left-wheel</title>
<svg x="250" y="343" width="62" height="107.129" viewBox="125 170 746 1289" overflow="hidden">
<image href={artwork['wheel-v1.png']} width="971" height="1619"/>
</svg>
</g>
<g id="right-wheel" data-layer="right-wheel">
<title>right-wheel</title>
<g transform="translate(2510 0) scale(-1 1)">
<svg x="1224" y="343" width="62" height="107.129" viewBox="125 170 746 1289" overflow="hidden">
<image href={artwork['wheel-v1.png']} width="971" height="1619"/>
</svg>
</g>
</g>
<g id="mechanical-cradle" data-layer="mechanical-cradle">
<title>mechanical-cradle</title>
<svg x="294" y="333" width="950" height="256.202" viewBox="106 90 1943 524" overflow="hidden">
<image href={artwork['mechanism-v2.png']} width="2157" height="729"/>
</svg>
</g>
<g id="column-titles" data-layer="column-titles">
<title>Live text on the burgundy label strip</title>
<text x="505" y="390" className="column-title" textAnchor="middle">TOPIC</text>
<text x="777" y="390" className="column-title" textAnchor="middle">FORMAT</text>
<text x="1048" y="390" className="column-title" textAnchor="middle">ANGLE</text>
</g>
<g id="keyboard" data-layer="keyboard">
<title>Nineteen separate keycap instances, each with its own text</title>
<g id="key-Q" data-layer="key-Q">
<title>Key Q</title>
<g id="key-art-Q" data-layer="key-art-Q">
<title>key-art-Q</title>
<svg x="302" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="325.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>Q</text>
</g>
<g id="key-W" data-layer="key-W">
<title>Key W</title>
<g id="key-art-W" data-layer="key-art-W">
<title>key-art-W</title>
<svg x="365" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="388.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>W</text>
</g>
<g id="key-E" data-layer="key-E">
<title>Key E</title>
<g id="key-art-E" data-layer="key-art-E">
<title>key-art-E</title>
<svg x="428" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="451.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>E</text>
</g>
<g id="key-R" data-layer="key-R">
<title>Key R</title>
<g id="key-art-R" data-layer="key-art-R">
<title>key-art-R</title>
<svg x="491" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="514.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>R</text>
</g>
<g id="key-T" data-layer="key-T">
<title>Key T</title>
<g id="key-art-T" data-layer="key-art-T">
<title>key-art-T</title>
<svg x="554" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="577.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>T</text>
</g>
<g id="key-A" data-layer="key-A">
<title>Key A</title>
<g id="key-art-A" data-layer="key-art-A">
<title>key-art-A</title>
<svg x="324" y="643" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="347.5" y="668" className="key-letter" style={{"fontSize":"21px"}}>A</text>
</g>
<g id="key-S" data-layer="key-S">
<title>Key S</title>
<g id="key-art-S" data-layer="key-art-S">
<title>key-art-S</title>
<svg x="387" y="643" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="410.5" y="668" className="key-letter" style={{"fontSize":"21px"}}>S</text>
</g>
<g id="key-D" data-layer="key-D">
<title>Key D</title>
<g id="key-art-D" data-layer="key-art-D">
<title>key-art-D</title>
<svg x="450" y="643" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="473.5" y="668" className="key-letter" style={{"fontSize":"21px"}}>D</text>
</g>
<g id="key-F" data-layer="key-F">
<title>Key F</title>
<g id="key-art-F" data-layer="key-art-F">
<title>key-art-F</title>
<svg x="513" y="643" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="536.5" y="668" className="key-letter" style={{"fontSize":"21px"}}>F</text>
</g>
<g id="key-G" data-layer="key-G">
<title>Key G</title>
<g id="key-art-G" data-layer="key-art-G">
<title>key-art-G</title>
<svg x="576" y="643" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="599.5" y="668" className="key-letter" style={{"fontSize":"21px"}}>G</text>
</g>
<g id="key-Y" data-layer="key-Y">
<title>Key Y</title>
<g id="key-art-Y" data-layer="key-art-Y">
<title>key-art-Y</title>
<svg x="951" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="974.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>Y</text>
</g>
<g id="key-U" data-layer="key-U">
<title>Key U</title>
<g id="key-art-U" data-layer="key-art-U">
<title>key-art-U</title>
<svg x="1014" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="1037.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>U</text>
</g>
<g id="key-I" data-layer="key-I">
<title>Key I</title>
<g id="key-art-I" data-layer="key-art-I">
<title>key-art-I</title>
<svg x="1077" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="1100.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>I</text>
</g>
<g id="key-O" data-layer="key-O">
<title>Key O</title>
<g id="key-art-O" data-layer="key-art-O">
<title>key-art-O</title>
<svg x="1140" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="1163.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>O</text>
</g>
<g id="key-P" data-layer="key-P">
<title>Key P</title>
<g id="key-art-P" data-layer="key-art-P">
<title>key-art-P</title>
<svg x="1203" y="603" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="1226.5" y="628" className="key-letter" style={{"fontSize":"21px"}}>P</text>
</g>
<g id="key-H" data-layer="key-H">
<title>Key H</title>
<g id="key-art-H" data-layer="key-art-H">
<title>key-art-H</title>
<svg x="982" y="643" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="1005.5" y="668" className="key-letter" style={{"fontSize":"21px"}}>H</text>
</g>
<g id="key-J" data-layer="key-J">
<title>Key J</title>
<g id="key-art-J" data-layer="key-art-J">
<title>key-art-J</title>
<svg x="1045" y="643" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="1068.5" y="668" className="key-letter" style={{"fontSize":"21px"}}>J</text>
</g>
<g id="key-K" data-layer="key-K">
<title>Key K</title>
<g id="key-art-K" data-layer="key-art-K">
<title>key-art-K</title>
<svg x="1108" y="643" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="1131.5" y="668" className="key-letter" style={{"fontSize":"21px"}}>K</text>
</g>
<g id="key-L" data-layer="key-L">
<title>Key L</title>
<g id="key-art-L" data-layer="key-art-L">
<title>key-art-L</title>
<svg x="1171" y="643" width="47" height="50.84" viewBox="171 121 918 993" overflow="hidden">
<image href={artwork['key-v1.png']} width="1261" height="1247"/>
</svg>
</g>
<text x="1194.5" y="668" className="key-letter" style={{"fontSize":"21px"}}>L</text>
</g>
</g>
<g id="spin-button" data-layer="spin-button">
<title>spin-button</title>
<svg x="635" y="605" width="298" height="87.638" viewBox="88 77 1962 577" overflow="hidden">
<image href={artwork['spin-button-v3.png']} width="2140" height="735"/>
</svg>
</g>
<g id="spin-caption" data-layer="spin-caption">
<title>Separate SPIN lettering and refresh arrow</title>
<g transform="translate(710 644) scale(.8) translate(-710 -664)">
<path d="M725 652a17 17 0 1 0 2 17 M725 644v10h-11" fill="none" stroke="#ffe7ba" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
</g>
<text x="756" y="655" style={{"fontSize":"40px","fontWeight":"700","fill":"#ffe7ba","letterSpacing":"3px"}}>SPIN</text>
</g>
<SpinControl onSpin={onSpin} />
<g id="page-heading" data-layer="page-heading">
<title>Independent heading, ornament and subtitle</title>
<text x="784" y="162" textAnchor="middle" style={{"fontFamily":"'EB Garamond',Georgia,serif","fontSize":"90px","fontWeight":"700","fill":"#fff0d9"}}>Reading Roulette</text>
<g stroke="#e4c492" fill="none">
<path d="M647 185h128 M815 185h127"/>
<path d="m782 184 9-5 9 5-9 5z M777 178l-4-3 M777 190l-4 3 M805 178l4-3 M805 190l4 3"/>
</g>
<text x="784" y="225" textAnchor="middle" style={{"fontSize":"26px","fontStyle":"italic","fill":"#ffebca"}}>Try your luck. Find your next great read.</text>
</g>
<g id="help-button" data-layer="help-button">
<title>Static help button illustration</title>
<rect x="1361" y="80" width="153" height="41" rx="10" fill="#182629" stroke="#f4dfc0" strokeWidth="2"/>
<circle cx="1387" cy="100" r="9" fill="none" stroke="#f4dfc0" strokeWidth="2"/>
<text x="1387" y="106" textAnchor="middle" style={{"fontSize":"16px","fill":"#fff0d9"}}>?</text>
<text x="1408" y="107" style={{"fontSize":"19px","fill":"#fff0d9"}}>How to use</text>
</g>
</svg>
  )
}
