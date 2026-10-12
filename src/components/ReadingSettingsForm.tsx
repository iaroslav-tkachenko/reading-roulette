import { cefrLevels } from '../data/cefrLevels'
import { languages } from '../data/languages'
import { getTextLength, textLengths } from '../data/textLengths'
import type { CefrLevel, ReadingSettings, TextLength } from '../types/reading'

interface ReadingSettingsFormProps {
  settings: ReadingSettings
  onChange: (settings: ReadingSettings) => void
}

export function ReadingSettingsForm({ settings, onChange }: ReadingSettingsFormProps) {
  return (
    <div className="settings-grid">
      <label className="language-field">
        Language
        <select
          value={settings.language.code}
          onChange={(event) => {
            const language = languages.find((item) => item.code === event.target.value)
            if (language) onChange({ ...settings, language })
          }}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>{language.name}</option>
          ))}
        </select>
        <span className="helper" aria-hidden="true">&nbsp;</span>
      </label>
      <label>
        CEFR Level
        <select
          value={settings.cefrLevel}
          onChange={(event) => onChange({ ...settings, cefrLevel: event.target.value as CefrLevel })}
        >
          {Object.keys(cefrLevels).map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <span className="helper" aria-hidden="true">&nbsp;</span>
      </label>
      <label>
        Text Length
        <select
          aria-describedby="word-range"
          value={settings.textLength}
          onChange={(event) => onChange({ ...settings, textLength: event.target.value as TextLength })}
        >
          {Object.entries(textLengths).map(([value, length]) => (
            <option key={value} value={value}>{length.label}</option>
          ))}
        </select>
        <span className="helper" id="word-range">{getTextLength(settings).description}</span>
      </label>
    </div>
  )
}
