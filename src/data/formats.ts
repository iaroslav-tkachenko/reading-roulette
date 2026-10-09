import type { ReadingFormat } from '../types/reading'

export const formats = [
  { id: 'short-story', label: 'Short story', promptHint: 'A self-contained story with a clear beginning and ending. Choose a natural narrative perspective and a tone that suits the angle.', angleIds: ['unexpected-discovery', 'change-of-plans', 'overlooked-detail'] },
  { id: 'dialogue', label: 'Dialogue', promptHint: 'A conversation between two people with named speakers. Use natural conversational language and a tone that suits the situation.', angleIds: ['unexpected-discovery', 'change-of-plans', 'overlooked-detail'] },
  { id: 'article', label: 'Article', promptHint: 'A short informative article with a title and a neutral informative register. Use established facts rather than invented evidence.', angleIds: ['unexpected-discovery', 'overlooked-detail', 'common-misconception'] },
] as const satisfies readonly ReadingFormat[]
