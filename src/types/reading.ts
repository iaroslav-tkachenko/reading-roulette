export type CefrLevel =
  | 'A1' | 'A1+' | 'A2-' | 'A2' | 'A2+'
  | 'B1-' | 'B1' | 'B1+' | 'B2-' | 'B2' | 'B2+'
  | 'C1-' | 'C1' | 'C1+' | 'C2'

export type TextLength = 'short' | 'medium' | 'long'

export interface Language {
  code: string
  name: string
}

export interface ContentOption {
  id: string
  label: string
  promptHint: string
}

export interface ReadingSettings {
  language: Language
  cefrLevel: CefrLevel
  textLength: TextLength
}

export interface ReadingCombination {
  topic: ContentOption
  format: ContentOption
  tone: ContentOption
}
