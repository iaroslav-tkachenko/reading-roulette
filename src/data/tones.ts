import type { ContentOption } from '../types/reading'

export const tones = [
  { id: 'warm', label: 'Warm', promptHint: 'Friendly and encouraging.' },
  { id: 'curious', label: 'Curious', promptHint: 'Exploratory and inquisitive.' },
  { id: 'humorous', label: 'Humorous', promptHint: 'Light and gently funny; keep the humor accessible at the requested level.' },
] as const satisfies readonly ContentOption[]
