import { useLocale } from '../../i18n/LocaleContext'
import { languageName } from '../../i18n/locale'
import { localizedTextLength } from '../../i18n/textLength'
import { cefrLevels } from '../../data/cefrLevels'
import { languages } from '../../data/languages'
import { textLengths } from '../../data/textLengths'
import type { ReadingCombination, ReadingSettings } from '../../types/reading'

interface MachineSettingsProps {
  compact?: boolean
  settings: ReadingSettings
  onChange: (settings: ReadingSettings) => void
  disabled?: boolean
  combination?: ReadingCombination | null
}

// HTML controls share the machine's SVG coordinates and scale with its artwork.
export function MachineSettings({ settings, combination, onChange, disabled = false, compact = false }: MachineSettingsProps) {
  const { locale, t } = useLocale()
  const lengthLabel = (value: ReadingSettings['textLength']) => t(('length.' + value) as 'length.short' | 'length.medium' | 'length.long')
  const describe = (value = settings.textLength) => combination ? localizedTextLength({ ...settings, textLength: value }, combination.format, locale).description : t('length.needsSpin', { length: lengthLabel(value) })
  const lengthDescription = describe()

  const languageSelect = <select
          id="reading-language"
          disabled={disabled}
          aria-labelledby="language-label"
          title={languageName(settings.language, locale)}
          value={settings.language.code}
          onChange={event => {
            if (disabled) return
            const language = languages.find(item => item.code === event.target.value)
            if (language) onChange({ ...settings, language })
          }}
        >
          {languages.map(language => <option key={language.code} value={language.code} title={languageName(language, locale)}>{languageName(language, locale, true)}</option>)}
        </select>
  const levelSelect = <select
          id="reading-cefr"
          disabled={disabled}
          aria-labelledby="cefr-label"
          value={settings.cefrLevel}
          onChange={event => {
            if (disabled) return
            const cefrLevel = Object.keys(cefrLevels).find(level => level === event.target.value) as ReadingSettings['cefrLevel'] | undefined
            if (cefrLevel) onChange({ ...settings, cefrLevel })
          }}
        >
          {Object.keys(cefrLevels).map(level => <option key={level} value={level}>{level}</option>)}
        </select>
  const lengthSelect = <select
          id="reading-length"
          disabled={disabled}
          aria-labelledby="length-label"
          aria-describedby="reading-word-range"
          title={lengthDescription}
          value={settings.textLength}
          onChange={event => {
            if (disabled) return
            const textLength = Object.keys(textLengths).find(length => length === event.target.value) as ReadingSettings['textLength'] | undefined
            if (textLength) onChange({ ...settings, textLength })
          }}
        >
          {Object.keys(textLengths).map(value => <option key={value} value={value} title={describe(value as ReadingSettings['textLength'])}>{lengthLabel(value as ReadingSettings['textLength'])}</option>)}
        </select>
  const helper = <span id="reading-word-range" className="sr-only">{lengthDescription}</span>

  if (compact) return (
    <fieldset className="compact-settings" disabled={disabled}>
      <legend className="sr-only">{t('settings.legend')}</legend>
      <div className="compact-language"><label id="language-label" htmlFor="reading-language">{t('settings.language')}</label>{languageSelect}</div>
      <div><label id="cefr-label" htmlFor="reading-cefr">{t('settings.level')}</label>{levelSelect}</div>
      <div><label id="length-label" htmlFor="reading-length">{t('settings.length')}</label>{lengthSelect}{helper}</div>
    </fieldset>
  )

  return (
    <g id="settings-fields" data-layer="settings-fields">
      <text id="language-label" x="402" y="296" className="label">{t('settings.language').toUpperCase()}</text>
      <rect x="390" y="310" width="228" height="40" rx="11" fill="url(#field)" stroke="#c99e79" />
      <foreignObject x="390" y="310" width="228" height="40" className="machine-setting">{languageSelect}</foreignObject>
      <path d="M589 326h14l-7 10z" fill="#12343a" pointerEvents="none" aria-hidden="true" />
      <text id="cefr-label" x="692" y="296" className="label">{t('settings.level').toUpperCase()}</text>
      <rect x="680" y="310" width="211" height="40" rx="11" fill="url(#field)" stroke="#c99e79" />
      <foreignObject x="680" y="310" width="211" height="40" className="machine-setting">{levelSelect}</foreignObject>
      <path d="M862 326h14l-7 10z" fill="#12343a" pointerEvents="none" aria-hidden="true" />
      <text id="length-label" x="969" y="296" className="label">{t('settings.length').toUpperCase()}</text>
      <rect x="957" y="310" width="202" height="40" rx="11" fill="url(#field)" stroke="#c99e79" />
      <foreignObject x="957" y="310" width="202" height="40" className="machine-setting">
        {lengthSelect}{helper}
      </foreignObject>
      <path d="M1130 326h14l-7 10z" fill="#12343a" pointerEvents="none" aria-hidden="true" />
      <path d="M648 277v74 M924 277v74" stroke="#b88b68" opacity=".65" />
    </g>
  )
}
