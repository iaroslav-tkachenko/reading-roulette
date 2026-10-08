import { cefrLevels } from '../data/cefrLevels'
import { textLengths } from '../data/textLengths'
import type { ReadingCombination, ReadingSettings } from '../types/reading'

// Pure string composition: no network, model, storage, or browser API required.
export function buildPrompt(settings: ReadingSettings, combination: ReadingCombination): string {
  return [
    `Write an original reading text in ${settings.language.name} for a language learner.`,
    `Target level: ${settings.cefrLevel}. ${cefrLevels[settings.cefrLevel]}`,
    `Length: approximately ${textLengths[settings.textLength].wordRange} words.`,
    `Topic: ${combination.topic.label}. ${combination.topic.promptHint}`,
    `Format: ${combination.format.label}. ${combination.format.promptHint}`,
    `Tone: ${combination.tone.label}. ${combination.tone.promptHint}`,
    'Keep vocabulary and grammar at the target level even when the topic or tone is more complex.',
    'Return only the reading text, without translations, exercises, or commentary.',
  ].join('\n\n')
}
