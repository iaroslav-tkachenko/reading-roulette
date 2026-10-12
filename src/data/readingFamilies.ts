import type { CefrLevel, ReadingFamily } from '../types/reading'

export const readingFamilies: readonly ReadingFamily[] = ['fiction', 'information', 'opinion', 'personal', 'practical', 'visual']
const rows = {
  A1: [15, 10, 0, 25, 20, 30],
  A2: [20, 15, 5, 25, 15, 20],
  B1: [25, 20, 10, 20, 15, 10],
  B2: [25, 20, 15, 15, 15, 10],
  C1: [25, 20, 20, 10, 15, 10],
  C2: [25, 20, 20, 10, 15, 10],
} as const

// Deliberately uses the selected level's group, not its content profile.
export function familyWeights(level: CefrLevel): Record<ReadingFamily, number> {
  const row = rows[level.slice(0, 2) as keyof typeof rows]
  if (!row) throw new Error(`Unknown difficulty "${level}".`)
  return Object.fromEntries(readingFamilies.map((family, index) => [family, row[index]])) as Record<ReadingFamily, number>
}
