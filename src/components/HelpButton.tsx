import type { RefObject } from 'react'

interface HelpButtonProps {
  buttonRef: RefObject<HTMLButtonElement | null>
  expanded: boolean
  onClick: () => void
}

export function HelpButton({ buttonRef, expanded, onClick }: HelpButtonProps) {
  return (
    <button
      ref={buttonRef}
      id="help-button"
      className="help-button"
      data-layer="help-button"
      type="button"
      aria-label="How to use"
      aria-haspopup="dialog"
      aria-controls="reading-help-dialog"
      aria-expanded={expanded}
      onClick={onClick}
    >
      <svg viewBox="0 0 153 41" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="151" height="39" rx="10" fill="#182629" stroke="#f4dfc0" strokeWidth="2" />
        <circle cx="26" cy="20" r="9" fill="none" stroke="#f4dfc0" strokeWidth="2" />
        <text x="26" y="26" textAnchor="middle" style={{ fontSize: '16px', fill: '#fff0d9' }}>?</text>
        <text x="47" y="27" style={{ fontSize: '19px', fill: '#fff0d9' }}>How to use</text>
      </svg>
    </button>
  )
}
