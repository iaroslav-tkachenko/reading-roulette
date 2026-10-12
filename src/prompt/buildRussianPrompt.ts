import { topicsRu, formatsRu, anglesRu } from '../i18n/catalogs.ru'
import { promptResourcesRu as resources } from '../i18n/promptResources.ru'
import { readingLanguagePhrase } from '../i18n/locale'
import { localizedTextLength } from '../i18n/textLength'
import type { ContentProfile, ReadingCombination, ReadingSettings } from '../types/reading'

// Called only after canonical validation by buildPrompt.
export function buildRussianPrompt(settings: ReadingSettings, combination: ReadingCombination, profile: ContentProfile) {
 const topic = topicsRu[combination.topic.id], format = formatsRu[combination.format.id], angle = anglesRu[combination.angle.id]
 const sourced = combination.format.contentStatus === 'sourced', visual = combination.format.family === 'visual'
 const status = resources.statuses[combination.format.contentStatus]
 const returns = sourced
  ? 'Верните адаптированный учебный текст и отдельный блок источников с реальными прямыми ссылками, датами публикаций и датой проверки. Связывайте источники с утверждениями, особенно спорными. Заголовок и пояснения блока — на выбранном языке чтения; исходные названия источников сохраняйте.' + (visual ? ' Также верните обязательный визуальный материал или явно обозначенный частичный результат.' : '')
  : visual ? 'Верните визуальный материал и отдельный сопровождающий учебный текст либо явно обозначенный частичный результат по правилам выше.'
  : 'Верните учебный текст с предусмотренной краткой пометкой об учебном примере, если она требуется.'
 const values: Record<string, string> = {
  readingLanguagePhrase: readingLanguagePhrase(settings.language.code),
  cefrLevel: settings.cefrLevel, cefrInstruction: resources.levels[settings.cefrLevel],
  lengthInstruction: localizedTextLength(settings, combination.format, 'ru').instruction,
  topicLabel: topic.label, topicPromptHint: topic.promptHint, formatLabel: format.label, formatPromptHint: format.promptHint,
  angleLabel: angle.label, anglePromptHint: angle.promptHint, contentProfile: profile,
  topicDisclosure: topic.disclosures[profile]!,
  concreteTaskOrAngleInstruction: profile === 'A1' || profile === 'A2'
   ? 'Конкретное действие: ' + angle.simpleAction.replace('{focus}', topic.simpleFocus)
   : 'В рамках указанной границы раскройте ракурс «' + angle.label + '».',
  registerInstruction: format.registerHint, contentStatusLabel: status[0], contentStatusInstruction: status[1],
  sourcedInstructionIfRequired: sourced ? resources.sourced : '', visualInstructionIfRequired: visual ? resources.visual : '',
  returnInstruction: returns,
  vocabularyMeaningInstruction: settings.language.code === 'ru'
   ? 'краткое простое определение значения в этом контексте на русском; знакомый синоним добавляйте только при необходимости, не повторяйте само исходное слово вместо объяснения'
   : 'краткий перевод значения в этом контексте на русский',
 }
 return resources.main.replace(/\{(\w+)\}/g, (_, key: string) => {
  if (typeof values[key] !== 'string') throw new Error('Missing Russian prompt value: ' + key)
  return values[key]
 }).split(/\n\s*\n/).map(part => part.trim()).filter(Boolean).join('\n\n')
}
