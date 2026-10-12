import { useLocale } from '../i18n/LocaleContext'
import { readingIdeaCount } from '../data/catalogStats'
import { languages } from '../data/languages'
import { useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent, RefObject } from 'react'

interface HowToUseProps {
  open: boolean
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

export function HowToUse({ open, onClose, returnFocusRef }: HowToUseProps) {
  const { locale, t } = useLocale()
  const ideas = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US').format(Math.floor(readingIdeaCount / 100) * 100) + '+'
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
          <h2 id="how-to-title">{t('help.title')}</h2>
          <button ref={closeRef} className="how-to-close" type="button" aria-label={t('help.close')} onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="how-to-content" tabIndex={0} role="region" aria-label={t('help.region')}>
          <p className="how-to-lead">{t('help.lead')}</p>
          <p>{t('help.body')}</p>
          <dl className="how-to-facts">
            <div className="how-to-ideas"><dt>{t('help.factIdeas')}</dt><dd>{t('help.factIdeasValue', { readingIdeaCount: ideas })}</dd></div>
            <div><dt>{t('help.factLanguages')}</dt><dd>{languages.length}</dd></div>
            <div><dt>{t('help.factLevels')}</dt><dd>{t('help.factLevelsValue')}</dd></div>
          </dl>
          <h3 className="how-to-steps-title">{t('help.stepsTitle')}</h3>
          <ol className="how-to-steps">
            <li>{t('help.step1')}</li>
            <li>{t('help.step2')}</li>
            <li>{t('help.step3')}</li>
          </ol>
          <p className="help-locale-note">{t('help.localeNote')}</p>
        </div>
      </section>
    </dialog>
  )
}
