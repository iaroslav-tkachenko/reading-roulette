import type { ContentOption } from '../types/reading'

export const topics = [
  { id: 'daily-life', label: 'Daily life', promptHint: 'Everyday routines and small discoveries.' },
  { id: 'travel', label: 'Travel', promptHint: 'Exploring a new place and its local culture.' },
  { id: 'nature', label: 'Nature', promptHint: 'The natural world and time spent outdoors.' },
] as const satisfies readonly ContentOption[]
