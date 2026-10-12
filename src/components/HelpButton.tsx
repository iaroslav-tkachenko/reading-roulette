import { useLocale } from '../i18n/LocaleContext'
import type { RefObject } from 'react'

interface HelpButtonProps {
  buttonRef: RefObject<HTMLButtonElement | null>
  expanded: boolean
  onClick: () => void
}

export function HelpButton({ buttonRef, expanded, onClick }: HelpButtonProps) {
  const { t } = useLocale()
  return (
    <button
      ref={buttonRef}
      id="help-button"
      className="help-button"
      data-layer="help-button"
      type="button"
      aria-label={t('help.open')}
      aria-haspopup="dialog"
      aria-controls="reading-help-dialog"
      aria-expanded={expanded}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M9 8.5a3 3 0 1 1 4.7 2.5c-1.3.8-1.7 1.2-1.7 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/>
      </svg><span>{t('help.open')}</span>
    </button>
  )
}
