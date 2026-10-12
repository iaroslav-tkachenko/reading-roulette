import type { TextLength } from '../types/reading'

export const textLengths = {
  short: { label: 'Short', wordRange: '100–150' },
  medium: { label: 'Medium', wordRange: '250–350' },
  long: { label: 'Long', wordRange: '500–700' },
} as const satisfies Record<TextLength, { label: string; wordRange: string }>
