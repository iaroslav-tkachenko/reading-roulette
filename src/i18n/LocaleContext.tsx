import { createContext, useContext } from 'react'
import { translate } from './locale'
import type { InterfaceLocale, MessageKey, MessageParams } from './locale'
export const LocaleContext = createContext<InterfaceLocale>('en')
export function useLocale() {
  const locale = useContext(LocaleContext)
  return { locale, t: (key: MessageKey, params?: MessageParams) => translate(locale, key, params) }
}
