import { translate } from '../i18n/locale'
import type { InterfaceLocale, MessageKey, MessageParams } from '../i18n/locale'
export interface ReadingFailure { key: Extract<MessageKey, `error.${string}`>; params?: MessageParams }
export class ReadingError extends Error {
  readonly failure: ReadingFailure
  constructor(failure: ReadingFailure, diagnostic?: string) {
    super(diagnostic ?? translate('en', failure.key, failure.params))
    this.name = 'ReadingError'
    this.failure = failure
  }
}
export function failureMessage(failure: ReadingFailure, locale: InterfaceLocale) {
  const params = { ...failure.params }
  if (failure.key === 'error.unsupported-length' && ['short', 'medium', 'long'].includes(String(params.length))) params.length = translate(locale, ('length.' + params.length) as 'length.short' | 'length.medium' | 'length.long')
  return translate(locale, failure.key, params)
}
