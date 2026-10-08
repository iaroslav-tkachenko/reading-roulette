import type { ContentOption } from '../types/reading'

export const formats = [
  { id: 'short-story', label: 'Short story', promptHint: 'A self-contained story with a clear beginning and ending.' },
  { id: 'dialogue', label: 'Dialogue', promptHint: 'A conversation between two people with named speakers.' },
  { id: 'article', label: 'Article', promptHint: 'A short informative article with a title.' },
] as const satisfies readonly ContentOption[]
