export type CefrLevel =
  | 'A1' | 'A1+' | 'A2-' | 'A2' | 'A2+'
  | 'B1-' | 'B1' | 'B1+' | 'B2-' | 'B2' | 'B2+'
  | 'C1-' | 'C1' | 'C1+' | 'C2'

export type TextLength = 'short' | 'medium' | 'long'
export type ContentProfile = 'A1' | 'A2' | 'B1' | 'B2' | 'C1+'
export type ReadingFamily = 'fiction' | 'information' | 'opinion' | 'personal' | 'practical' | 'visual'
export type ContentStatus = 'fiction' | 'training' | 'factual' | 'sourced'
export type VolumeModel = 'prose' | 'compact-message' | 'form-fields' | 'brief-prose' | 'list-items' | 'visual-caption' | 'visual-sequence' | 'visual-report'

export interface Language {
  code: string
  name: string
  displayName?: string
  lengthUnit?: 'structure'
}

export interface ContentOption {
  id: string
  label: string
  promptHint: string
}

export interface ReadingFormat extends ContentOption {
  minProfile: ContentProfile
  family: ReadingFamily
  volumeModel: VolumeModel
  lengths: readonly TextLength[]
  contentStatus: ContentStatus
  registerHint: string
  topicIds: readonly string[]
  angleIds: readonly string[]
  shortAngleIds: readonly string[]
}

export interface ReadingTopic extends ContentOption {
  minProfile: ContentProfile
  simpleFocus: string
  disclosures: Partial<Record<ContentProfile, string>>
}

export interface ReadingAngle extends ContentOption {
  minProfile: ContentProfile
  simpleAction: string
  topicIds: readonly string[]
}

export interface ReadingSettings {
  language: Language
  cefrLevel: CefrLevel
  textLength: TextLength
}

export interface ReadingCombination {
  topic: ReadingTopic
  format: ReadingFormat
  angle: ReadingAngle
}
