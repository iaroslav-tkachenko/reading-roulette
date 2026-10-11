import { cefrLevels } from '../data/cefrLevels'
import { getTextLength } from '../data/textLengths'
import { checkCombination } from '../random/compatibility'
import type { ReadingCombination, ReadingSettings } from '../types/reading'

// The prompt is currently authored in English; this is separate from the learning language.
const promptLanguage = { code: 'en', name: 'English' } as const

// Pure string composition: no network, model, storage, or browser API required.
export function buildPrompt(settings: ReadingSettings, combination: ReadingCombination): string {
  const checked = checkCombination(settings, combination)
  if (!checked.valid) throw new Error(checked.reason)
  settings = checked.settings
  combination = checked.combination
  const { topic, format, angle } = combination
  const visual = format.family === 'visual'
  const sourced = format.contentStatus === 'sourced'
  const vocabularyMeaning = settings.language.code === promptLanguage.code
    ? `a brief, simple ${promptLanguage.name} definition of its meaning in this context; add a familiar synonym only when helpful, rather than repeating the original word as its own meaning`
    : `a concise ${promptLanguage.name} translation of its meaning in this context`
  const statusInstructions = {
    fiction: 'You may invent characters, events, dialogue and fictional world rules. Do not present fiction as real events, authentic quotations or established science. An ordinary story needs no extra fiction notice.',
    training: 'Use an explicitly fictional educational scenario. When a document, interview, personal experience or dataset could be mistaken for authentic material, include a brief notice in the selected language: "Training example; people and circumstances are fictional" or "Training data". Do not attribute invented experience or words to real people. A review may use a fictional object; real characteristics need evidence, and simulated use is not testimony.',
    factual: 'Explain real objects, phenomena or correct practical steps using stable grounded knowledge. Do not invent facts, research, statistics, quotations or sources. Check uncertain, precise or changing claims against accessible real materials; omit optional unsupported details. If unsupported information is essential to the angle, state that the task cannot be completed faithfully.',
    sourced: 'Use only real publications that you have actually found and read, or accessible originals supplied by the user. Search and source reading are mandatory; memory, search snippets and headlines alone do not suffice.',
  }
  return [
    `Write an original reading text entirely in ${settings.language.name} for a language learner.`,
    `Difficulty target: ${settings.cefrLevel} (an internal tuning point around the standard CEFR levels, not a separate official CEFR level). ${cefrLevels[settings.cefrLevel]}`,
    getTextLength(settings, format).instruction,
    `Topic: ${topic.label}. ${topic.promptHint}`,
    `Format: ${format.label}. ${format.promptHint}`,
    `Angle: ${angle.label}. ${angle.promptHint}`,
    `Approved scenario for content profile ${checked.profile}: ${topic.disclosures[checked.profile]} ${checked.profile === 'A1' || checked.profile === 'A2' ? `Concrete task: ${angle.simpleAction.replace('{focus}', topic.simpleFocus)}` : `Within this boundary, realize "${angle.label}".`} Express this task through the mandatory structure of ${format.label}. Keep one main subject; do not change the topic to make the format easier.`,
    format.registerHint,
    `Content status: ${format.contentStatus}. ${statusInstructions[format.contentStatus]}`,
    'Educational circumstances do not permit incorrect subject knowledge. Opinions do not permit invented evidence. Verify uncertain or changing factual claims even inside fiction or training scenarios. Keep invented data clearly labeled and consistent across values, units, categories and periods; conclusions must follow from the data and correlation must not be presented as causation.',
    'The selected CEFR tuning controls language; the content profile above separately limits subject depth. Length, genre, illustrations or expressive tone never raise either limit. Do not add repetition, unsupported details or forced jargon to reach the volume target.',
    sourced ? 'Before writing, find and read real materials on an event matching the topic, angle and content profile. Prefer primary documents and reliable editorial reporting; cross-check important disputed claims independently when possible, without inventing extra sources. Preserve each title, publisher, publication date and direct URL. Distinguish event date from publication date, and check freshness at execution time when the angle requires it. Preserve facts and uncertainty; attribute conflicting claims. Never invent events, numbers, roles, sources, links, quotes, gestures, conversations, atmosphere or eyewitness presence. Verified quotes need an accessible original; label paraphrases and translations. If the required angle is unsupported, or search/materials are unavailable, explain the inability and request source text or suggest another format; never substitute a fictional event.' : '',
    visual ? 'Create and display the required image, scene sequence, plan, infographic, chart or table in this external chat, and place the main reading text separately. Short necessary labels inside the visual must use the selected language. Objects, actions, routes and data must agree with the text; a decorative illustration does not satisfy the format. A generated scene is an educational construction, not a documentary photograph. If a suitable diagram can be displayed by another method, use it; undisplayed code is not a finished image. If creating or displaying the visual is unavailable, explicitly label the result as partial in the selected language, state that the image is missing, provide a visual-generation brief and text for the planned scene. Do not claim that a missing image is visible or replace the format with an ordinary article.' : '',
    `Return ${sourced ? 'the adapted reading text and a separate Sources block with real direct links, publication dates and the date you checked them; connect sources to claims, especially disputed information. The Sources block is excluded from the reading volume' : visual ? 'the visual and its separate accompanying reading text, or the explicitly labeled partial result described above' : 'the reading text with any required brief training notice'}. Headings, notices, captions and dialogue count toward reading volume; field/item models retain their structural measure. The separate vocabulary section is excluded from reading volume and field/item counts, including for visual formats. Do not translate the whole reading text or add exercises or unrelated commentary. A short inability message does not have to reach the requested volume.`,
    `Vocabulary support: After the reading material and any required Sources block, add a final section titled "Useful vocabulary". Select useful words and short expressions that actually appear in the reading material and that a ${settings.cefrLevel} learner may find unfamiliar because of the topic or their contextual usage. Do not make the reading text harder just to populate this section. Keep the list proportionate to the actual material: usually 3–8 entries, fewer for very short or simple material and up to 12 for longer, vocabulary-rich material. Avoid duplicates and filler. For each entry, show the original ${settings.language.name} word or expression as used in the text, followed by ${vocabularyMeaning}. Write these meanings in ${promptLanguage.name}, the language of this prompt, using the format "original — meaning". If no reading material can be produced, omit this section; never invent vocabulary entries.`,
  ].filter(Boolean).join('\n\n')
}
