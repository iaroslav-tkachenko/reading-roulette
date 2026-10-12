import { selectedLines } from './drumData'

// Shared by resting and moving strips: complete labels, centered in the same window.
export function DrumLabel({ label, x, y, selected = false, angle = false, compact = false }: { label: string; x: number; y: number; selected?: boolean; angle?: boolean; compact?: boolean }) {
  const lines = selectedLines(label, compact ? 21 : selected ? 18 : 22)
  const longest = Math.max(...lines.map(line => line.length))
  const wideCyrillic = /[А-Яа-яЁё]/.test(label) && longest >= 13
  const size = compact ? 22 : selected ? (longest > 14 || wideCyrillic ? 20 : angle ? 22 : 24) : 16
  const step = compact ? 22 : selected ? 25 : 18
  return <text x={x} y={y - (lines.length - 1) * step / 2} className={selected ? 'selected' : 'neighbor'} textAnchor="middle" aria-label={label} style={{ fontSize: `${size}px` }}>
    {lines.map((line, index) => <tspan key={index} x={x} dy={index === 0 ? 0 : step}>{line}</tspan>)}
  </text>
}
