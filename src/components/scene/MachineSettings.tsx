import { cefrLevels } from '../../data/cefrLevels'
import { languages } from '../../data/languages'
import { getTextLength, textLengths } from '../../data/textLengths'
import type { ReadingSettings } from '../../types/reading'

interface MachineSettingsProps {
  settings: ReadingSettings
  onChange: (settings: ReadingSettings) => void
  disabled?: boolean
}

// HTML controls share the machine's SVG coordinates and scale with its artwork.
export function MachineSettings({ settings, onChange, disabled = false }: MachineSettingsProps) {
  const lengthDescription = getTextLength(settings).description

  return (
    <g id="settings-fields" data-layer="settings-fields">
      <text id="language-label" x="402" y="296" className="label">LANGUAGE</text>
      <rect x="390" y="310" width="228" height="40" rx="11" fill="url(#field)" stroke="#c99e79" />
      <foreignObject x="390" y="310" width="228" height="40" className="machine-setting">
        <select
          id="reading-language"
          disabled={disabled}
          aria-labelledby="language-label"
          title={settings.language.name}
          value={settings.language.code}
          onChange={event => {
            if (disabled) return
            const language = languages.find(item => item.code === event.target.value)
            if (language) onChange({ ...settings, language })
          }}
        >
          {languages.map(language => <option key={language.code} value={language.code} title={language.name}>{language.displayName ?? language.name}</option>)}
        </select>
      </foreignObject>
      <path d="M589 326h14l-7 10z" fill="#12343a" pointerEvents="none" aria-hidden="true" />

      <text id="cefr-label" x="692" y="296" className="label">CEFR LEVEL</text>
      <rect x="680" y="310" width="211" height="40" rx="11" fill="url(#field)" stroke="#c99e79" />
      <foreignObject x="680" y="310" width="211" height="40" className="machine-setting">
        <select
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
      </foreignObject>
      <path d="M862 326h14l-7 10z" fill="#12343a" pointerEvents="none" aria-hidden="true" />

      <text id="length-label" x="969" y="296" className="label">TEXT LENGTH</text>
      <rect x="957" y="310" width="202" height="40" rx="11" fill="url(#field)" stroke="#c99e79" />
      <foreignObject x="957" y="310" width="202" height="40" className="machine-setting">
        <select
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
          {Object.entries(textLengths).map(([value, length]) => <option key={value} value={value} title={getTextLength({ ...settings, textLength: value as ReadingSettings['textLength'] }).description}>{length.label}</option>)}
        </select>
        <span id="reading-word-range" className="sr-only">{lengthDescription}</span>
      </foreignObject>
      <path d="M1130 326h14l-7 10z" fill="#12343a" pointerEvents="none" aria-hidden="true" />
      <path d="M648 277v74 M924 277v74" stroke="#b88b68" opacity=".65" />
    </g>
  )
}
