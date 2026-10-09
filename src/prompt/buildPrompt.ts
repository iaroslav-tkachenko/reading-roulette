import { cefrLevels } from '../data/cefrLevels'
import { textLengths } from '../data/textLengths'
import type { ReadingCombination, ReadingSettings } from '../types/reading'

// Pure string composition: no network, model, storage, or browser API required.
export function buildPrompt(settings: ReadingSettings, combination: ReadingCombination): string {
  return [
    `Write an original reading text entirely in ${settings.language.name} for a language learner.`,
    `Difficulty target: ${settings.cefrLevel} (an internal tuning point around the standard CEFR levels, not a separate official CEFR level). ${cefrLevels[settings.cefrLevel]}`,
    `Length: approximately ${textLengths[settings.textLength].wordRange} words.`,
    `Topic: ${combination.topic.label}. ${combination.topic.promptHint}`,
    `Format: ${combination.format.label}. ${combination.format.promptHint}`,
    `Angle: ${combination.angle.label}. ${combination.angle.promptHint}`,
    'Use a register, emotional tone, and narrative perspective appropriate to the format and angle. Keep formal documents neutral.',
    'Keep vocabulary, grammar, and sentence complexity within the selected difficulty target, even when the topic or angle is complex. Prefer simpler language over simplifying or changing the requested topic, format, or angle.',
    'Return only the reading text, without translations, exercises, or commentary.',
  ].join('\n\n')
}
