import { languages } from '../../data/languages'
import { topics } from '../../data/topics'
import { formats } from '../../data/formats'
import { angles } from '../../data/angles'
import { buildPrompt } from '../../prompt/buildPrompt'
import type { ReadingCombination, ReadingSettings } from '../../types/reading'

const language = languages.find(item => item.code === 'en')
const topic = topics.find(item => item.id === 'travel')
const format = formats.find(item => item.id === 'short-story')
const angle = angles.find(item => item.id === 'unexpected-discovery')

if (!language || !topic || !format || !angle) {
  throw new Error('The accepted initial reading is missing from the catalogs.')
}

export const initialSettings: ReadingSettings = { language, cefrLevel: 'B1+', textLength: 'medium' }
export const initialCombination: ReadingCombination = { topic, format, angle }
export const initialPrompt = buildPrompt(initialSettings, initialCombination)
