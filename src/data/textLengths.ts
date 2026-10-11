import type { CefrLevel, ReadingSettings, TextLength } from '../types/reading'

export const textLengths = {
  short: { label: 'Short', structureHint: 'Keep one main idea and only the details needed to understand it.' },
  medium: { label: 'Medium', structureHint: 'Develop one main idea with a clear progression and a few supporting details.' },
  long: { label: 'Long', structureHint: 'Develop the main idea through several connected parts with more supporting detail, without repetition.' },
} as const satisfies Record<TextLength, { label: string; structureHint: string }>

export type ContentProfile = 'A1' | 'A2' | 'B1' | 'B2' | 'C1+'

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

// Current formats (story, dialogue, article) all use the prose volume model.
// Special format models will be connected when the full format catalog is migrated.
export function getTextLength(settings: Pick<ReadingSettings, 'language' | 'cefrLevel' | 'textLength'>) {
  const profile = contentProfiles[settings.cefrLevel]
  const length = textLengths[settings.textLength]
  if (settings.language.lengthUnit === 'structure') {
    return {
      profile,
      wordRange: null,
      description: `${length.label} · structured text for ${settings.cefrLevel}`,
      instruction: `Length: ${length.label} for difficulty ${settings.cefrLevel}. ${length.structureHint} Keep vocabulary, grammar and the amount of detail appropriate to the selected difficulty. Use structure and relative reading length rather than a numeric word or character target for ${settings.language.name}.`,
    }
  }
  const wordRange = proseWordRanges[profile][settings.textLength]
  return {
    profile,
    wordRange,
    description: `${length.label} · ${wordRange} words`,
    instruction: `Length: approximately ${wordRange} words.`,
  }
}
