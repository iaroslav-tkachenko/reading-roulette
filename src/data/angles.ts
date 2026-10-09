import type { ContentOption } from '../types/reading'

// Starter ideas only. Format entries explicitly list their compatible angle IDs.
export const angles = [
  { id: 'unexpected-discovery', label: 'Unexpected discovery', promptHint: 'Focus on discovering something surprising that changes how the topic is understood.' },
  { id: 'change-of-plans', label: 'A change of plans', promptHint: 'Focus on a plan that needs to change, why it changes, and how people respond.' },
  { id: 'overlooked-detail', label: 'An overlooked detail', promptHint: 'Focus on a small, often overlooked detail and show why it matters.' },
  { id: 'common-misconception', label: 'A common misconception', promptHint: 'Explain and correct one common misconception about the topic using established facts; do not invent evidence.' },
] as const satisfies readonly ContentOption[]
