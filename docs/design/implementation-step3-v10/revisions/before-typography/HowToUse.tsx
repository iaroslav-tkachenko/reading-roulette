import { useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent, RefObject } from 'react'

interface HowToUseProps {
  open: boolean
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

export function HowToUse({ open, onClose, returnFocusRef }: HowToUseProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const backdropPressed = useRef(false)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return

    // Preserve the scene's content width when its scrollbar is removed.
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousPadding = root.style.paddingRight
    const scrollbarWidth = window.innerWidth - root.clientWidth
    const padding = Number.parseFloat(getComputedStyle(root).paddingRight) || 0
    root.style.overflow = 'hidden'
    root.style.paddingRight = `${padding + scrollbarWidth}px`

    // Native modal semantics make the rest of the page inert, including SPIN.
    dialog.showModal()
    closeRef.current?.focus({ preventScroll: true })

    return () => {
      dialog.close()
      root.style.overflow = previousOverflow
      root.style.paddingRight = previousPadding
      backdropPressed.current = false
      returnFocusRef.current?.focus({ preventScroll: true })
    }
  }, [open, returnFocusRef])

  function keepFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return
    const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')
    const first = controls[0]
    const last = controls[controls.length - 1]
    const active = document.activeElement
    if ((event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
      event.preventDefault()
      const target = event.shiftKey ? last : first
      target?.focus({ preventScroll: true })
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id="reading-help-dialog"
      className="how-to-dialog"
      aria-labelledby="how-to-title"
      aria-modal="true"
      onCancel={event => {
        event.preventDefault()
        onClose()
      }}
      onClose={() => {
        if (!dialogRef.current?.open) onClose()
      }}
      onKeyDown={keepFocus}
      onPointerDown={event => {
        backdropPressed.current = event.target === event.currentTarget
      }}
      onClick={event => {
        if (event.target === event.currentTarget && backdropPressed.current) onClose()
        backdropPressed.current = false
      }}
    >
      <section className="how-to-card">
        <header className="how-to-header">
          <h2 id="how-to-title">How to use</h2>
          <button ref={closeRef} className="how-to-close" type="button" aria-label="Close instructions" onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="how-to-content" tabIndex={0} role="region" aria-label="Instructions">
          <p className="how-to-lead">Preparing for a language exam like IELTS, Goethe-Zertifikat, DELE or DELF? Or just want to read more confidently in the language you’re learning?</p>
          <p>Reading Roulette helps you find ideas for reading practice at your level. Explore stories, articles, letters and dialogues to practise understanding the main idea, noticing details and learning words in context.</p>
          <p className="how-to-facts">
            <span>11 languages</span><span>A1 to C2</span><span>Over 4,300 reading ideas</span>
          </p>
          <ol className="how-to-steps">
            <li>Choose your language, level and text length.</li>
            <li>Press <strong>SPIN</strong> to get a reading idea.</li>
            <li>Press <strong>Copy prompt</strong> and paste the prompt into an AI chat. It will create a text for your reading practice.</li>
          </ol>
        </div>
      </section>
    </dialog>
  )
}
