import type { Language } from '../types/reading'

// Original eight languages plus the user's Russian, Portuguese and Serbian additions.
// Canonical list and language-length conventions: docs/LANGUAGES.md.
export const languages: readonly Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese', lengthUnit: 'structure' },
  { code: 'de', name: 'German' },
  { code: 'ko', name: 'Korean' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese (Mandarin)', displayName: 'Chinese', lengthUnit: 'structure' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'sr', name: 'Serbian' },
]
