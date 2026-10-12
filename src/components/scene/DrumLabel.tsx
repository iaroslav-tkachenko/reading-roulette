import { selectedLines } from './drumData'
import { useLayoutEffect, useRef } from 'react'

// Shared by resting and moving strips: complete labels, centered in the same window.
export function DrumLabel({ label, x, y, selected = false, angle = false, compact = false }: { label: string; x: number; y: number; selected?: boolean; angle?: boolean; compact?: boolean }) {
  // The pointers project into the desktop windows. Wrap before that inset,
  // leaving the wider compact layout and quiet neighboring rows unchanged.
  const lines = selectedLines(label, compact ? 21 : selected ? 16 : 22)
  const longest = Math.max(...lines.map(line => line.length))
  const size = compact ? 20 : selected ? (longest > 12 ? 20 : angle ? 22 : 24) : 16
  const step = compact ? 21 : selected ? 25 : 18
  const text = useRef<SVGTextElement>(null)
  useLayoutEffect(() => {
    let active = true
    const fit = () => {
      if (!active || !text.current) return
      const element = text.current
      element.style.fontSize = `${size}px`
      const width = element.getBBox().width
      // Reserve space for the pointer tips, especially the inset right tip in Angle.
      const available = compact ? 312 : selected ? angle ? 164 : 184 : 210
      // A small extra inset accounts for glyph hinting at fractional font sizes.
      if (width > available) element.style.fontSize = `${Math.floor(size * (available - 2) / width * 10) / 10}px`
    }
    fit()
    void document.fonts.ready.then(fit)
    return () => { active = false }
  }, [label, size, selected, angle, compact])
  return <text ref={text} x={x} y={y - (lines.length - 1) * step / 2} className={selected ? 'selected' : 'neighbor'} textAnchor="middle" aria-label={label} style={{ fontSize: `${size}px` }}>
    {lines.map((line, index) => <tspan key={index} x={x} dy={index === 0 ? 0 : step}>{line}</tspan>)}
  </text>
}
