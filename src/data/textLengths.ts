import type { CefrLevel, ContentProfile, ReadingFormat, ReadingSettings, TextLength } from '../types/reading'

export const textLengths = {
  short: { label: 'Short', structureHint: 'Keep one main idea and only the details needed to understand it.' },
  medium: { label: 'Medium', structureHint: 'Develop one main idea with a clear progression and a few supporting details.' },
  long: { label: 'Long', structureHint: 'Develop the main idea through several connected parts with more supporting detail, without repetition.' },
} as const satisfies Record<TextLength, { label: string; structureHint: string }>

export type { ContentProfile } from '../types/reading'

// Content profiles, not family-selection weight profiles. See docs/LEVELS_LENGTH.md.
export const contentProfiles = {
  A1: 'A1', 'A1+': 'A1', 'A2-': 'A1',
  A2: 'A2', 'A2+': 'A2', 'B1-': 'A2',
  B1: 'B1', 'B1+': 'B1', 'B2-': 'B1',
  B2: 'B2', 'B2+': 'B2', 'C1-': 'B2',
  C1: 'C1+', 'C1+': 'C1+', C2: 'C1+',
} as const satisfies Record<CefrLevel, ContentProfile>

export const proseWordRanges = {
  A1: { short: '40–80', medium: '100–150', long: '200–300' },
  A2: { short: '60–100', medium: '150–250', long: '300–450' },
  B1: { short: '100–150', medium: '250–350', long: '500–700' },
  B2: { short: '100–150', medium: '250–350', long: '500–700' },
  'C1+': { short: '100–150', medium: '250–350', long: '500–700' },
} as const satisfies Record<ContentProfile, Record<TextLength, string>>

export function getTextLength(settings: Pick<ReadingSettings, 'language' | 'cefrLevel' | 'textLength'>, format?: ReadingFormat | null) {
  const profile = contentProfiles[settings.cefrLevel]
  const length = textLengths[settings.textLength]
  if (format && !format.lengths.includes(settings.textLength)) return { profile, wordRange: null, description: `${length.label} · unavailable for this format`, instruction: '' }
  const model = format?.volumeModel ?? 'prose'
  if (model === 'form-fields') return { profile, wordRange: null, description: 'Short · 4–8 fields', instruction: 'Length: 4–8 meaningful fields with completed values. Do not apply a word-count target or pad the form with prose.' }
  if (model === 'list-items') {
    const items = { short: '4–6', medium: '8–12', long: '16–24' }[settings.textLength]
    return { profile, wordRange: null, description: `${length.label} · ${items} items`, instruction: `Length: ${items} menu or schedule entries. Use concise labels and necessary details; do not apply a prose word-count target or pad entries.` }
  }
  if (model === 'compact-message') {
    if (settings.language.lengthUnit === 'structure') return { profile, wordRange: null, description: 'Short · one compact message', instruction: `Length: one compact message in ${settings.language.name}, with only essential details. Use relative length without a numeric word or character target; never stretch a note, listing or notice into an article.` }
    return { profile, wordRange: '20–60', description: 'Short · 20–60 words', instruction: 'Length: approximately 20–60 words, independently of the level. Never stretch a note, listing or notice to a prose range.' }
  }
  const scope = model.startsWith('visual-') ? ` Apply this length to ${model === 'visual-report' ? 'the accompanying analysis' : 'all accompanying text together'}, not to each image, frame or step. Keep image labels short and do not increase visual complexity merely because Long was selected.` : ''
  if (settings.language.lengthUnit === 'structure') {
    return {
      profile,
      wordRange: null,
      description: `${length.label} · structured text for ${settings.cefrLevel}`,
      instruction: `Length: ${length.label} for difficulty ${settings.cefrLevel}. ${length.structureHint} Keep vocabulary, grammar and the amount of detail appropriate to the selected difficulty. Use structure and relative reading length rather than a numeric word or character target for ${settings.language.name}.${scope}`,
    }
  }
  const wordRange = proseWordRanges[profile][settings.textLength]
  return {
    profile,
    wordRange,
    description: `${length.label} · ${wordRange} words`,
    instruction: `Length: approximately ${wordRange} words.${scope}`,
  }
}
