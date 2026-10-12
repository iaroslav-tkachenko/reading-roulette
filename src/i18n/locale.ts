import { en, ru } from './messages'
export type InterfaceLocale = 'en' | 'ru'
export type MessageKey = keyof typeof en
export type MessageParams = Record<string, string | number>
export function isLocale(value: unknown): value is InterfaceLocale { return value === 'en' || value === 'ru' }
export function translate(locale: InterfaceLocale, key: MessageKey, params: MessageParams = {}) {
  return (locale === 'ru' ? ru[key] : en[key]).replace(/\{(\w+)\}/g, (_, name: string) => {
    if (!(name in params)) throw new Error('Missing message parameter: ' + name)
    return String(params[name])
  })
}
export const localePreferenceKey = 'reading-roulette.interface-locale.v1'
export function readLocalePreference(storage?: Pick<Storage, 'getItem'>): InterfaceLocale {
  try { const value = (storage ?? window.localStorage).getItem(localePreferenceKey); return isLocale(value) ? value : 'en' } catch { return 'en' }
}
export function saveLocalePreference(locale: InterfaceLocale, storage?: Pick<Storage, 'setItem'>) {
  try { (storage ?? window.localStorage).setItem(localePreferenceKey, locale) } catch { /* The current tab still works without persistence. */ }
}
const namesRu: Record<string, string> = { en: 'Английский', es: 'Испанский', fr: 'Французский', ja: 'Японский', de: 'Немецкий', ko: 'Корейский', it: 'Итальянский', zh: 'Китайский (мандаринский)', ru: 'Русский', pt: 'Португальский', sr: 'Сербский' }
const phrasesRu: Record<string, string> = { en: 'на английском языке', es: 'на испанском языке', fr: 'на французском языке', ja: 'на японском языке', de: 'на немецком языке', ko: 'на корейском языке', it: 'на итальянском языке', zh: 'на китайском языке (мандаринском)', ru: 'на русском языке', pt: 'на португальском языке', sr: 'на сербском языке' }
export function languageName(language: { code: string; name: string; displayName?: string }, locale: InterfaceLocale, compact = false) {
  if (locale === 'en') return compact ? language.displayName ?? language.name : language.name
  const name = namesRu[language.code]
  if (!name) throw new Error('Missing reading-language translation: ' + language.code)
  return compact && language.code === 'zh' ? 'Китайский' : name
}
export function readingLanguagePhrase(code: string) {
  const phrase = phrasesRu[code]
  if (!phrase) throw new Error('Missing reading-language phrase: ' + code)
  return phrase
}
