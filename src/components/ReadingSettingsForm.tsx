import { cefrLevels } from '../data/cefrLevels'
import { languages } from '../data/languages'
import { textLengths } from '../data/textLengths'
import type { CefrLevel, ReadingSettings, TextLength } from '../types/reading'

interface ReadingSettingsFormProps {
  settings: ReadingSettings
  onChange: (settings: ReadingSettings) => void
}

export function ReadingSettingsForm({ settings, onChange }: ReadingSettingsFormProps) {
  return (
    <div className="settings-grid">
      <label>
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
      </label>
      <label>
        Text Length
        <select
          value={settings.textLength}
          onChange={(event) => onChange({ ...settings, textLength: event.target.value as TextLength })}
        >
          {Object.entries(textLengths).map(([value, length]) => (
            <option key={value} value={value}>{length.label} ({length.wordRange} words)</option>
          ))}
        </select>
      </label>
    </div>
  )
}
