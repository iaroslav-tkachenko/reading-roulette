import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import type { InterfaceLocale } from '../i18n/locale'

function Flag({ locale }: { locale: InterfaceLocale }) {
 return locale === 'ru' ? <svg className="locale-flag" viewBox="0 0 30 20" aria-hidden="true"><path fill="#fff" d="M0 0h30v7H0z"/><path fill="#2454a5" d="M0 7h30v6H0z"/><path fill="#d23b40" d="M0 13h30v7H0z"/></svg>
  : <svg className="locale-flag" viewBox="0 0 30 20" aria-hidden="true"><path fill="#15366b" d="M0 0h30v20H0z"/><path stroke="#fff" strokeWidth="5" d="m0 0 30 20M30 0 0 20"/><path stroke="#c83c48" strokeWidth="2" d="m0 0 30 20M30 0 0 20"/><path stroke="#fff" strokeWidth="7" d="M15 0v20M0 10h30"/><path stroke="#c83c48" strokeWidth="4" d="M15 0v20M0 10h30"/></svg>
}
export function InterfaceLanguageSelect({ busy, closeSignal, onChange }: { busy: boolean; closeSignal: string; onChange: (locale: InterfaceLocale) => void }) {
 const { locale, t } = useLocale()
 const [open, setOpen] = useState(false)
 const root = useRef<HTMLDivElement>(null)
 const trigger = useRef<HTMLButtonElement>(null)
 const options = useRef<(HTMLButtonElement | null)[]>([])
 const visible = open && !busy
 useEffect(() => { setOpen(false) }, [busy, closeSignal])
 useLayoutEffect(() => { if (visible) options.current[locale === 'en' ? 0 : 1]?.focus() }, [visible, locale])
 useEffect(() => {
  if (!visible) return
  const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false) }
  document.addEventListener('pointerdown', outside)
  return () => document.removeEventListener('pointerdown', outside)
 }, [visible])
 const close = () => { setOpen(false); trigger.current?.focus() }
 return <div className="interface-language" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
  <button ref={trigger} className="locale-trigger" type="button" disabled={busy} aria-haspopup="listbox" aria-expanded={visible} aria-controls="interface-languages" aria-label={t('locale.trigger', { language: locale === 'en' ? 'English' : 'Русский' })} title={busy ? t('locale.busy') : t('locale.label')} onClick={() => setOpen(value => !value)} onKeyDown={event => {
   if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true) }
   if (event.key === 'Escape' && visible) { event.preventDefault(); close() }
  }}><Flag locale={locale}/><span>{locale.toUpperCase()}</span><span aria-hidden="true">▾</span></button>
  {visible && <div id="interface-languages" className="locale-options" role="listbox" aria-label={t('locale.label')} onKeyDown={event => {
   if (event.key === 'Tab') setTimeout(() => setOpen(false), 0)
   const index = options.current.findIndex(option => option === document.activeElement)
   const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : event.key === 'ArrowDown' ? (index + 1) % 2 : event.key === 'ArrowUp' ? (index + 1) % 2 : -1
   if (next >= 0) { event.preventDefault(); options.current[next]?.focus() }
   if (event.key === 'Escape') { event.preventDefault(); close() }
  }}>
   {(['en', 'ru'] as const).map((value, index) => <button key={value} ref={node => { options.current[index] = node }} type="button" role="option" tabIndex={-1} aria-selected={value === locale} onClick={() => { onChange(value); close() }}><Flag locale={value}/><span lang={value}>{value === 'en' ? 'English' : 'Русский'}</span><span className="locale-check" aria-hidden="true">{value === locale ? '✓' : ''}</span></button>)}
  </div>}
 </div>
}
