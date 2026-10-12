import { getTextLength } from '../data/textLengths'
import { languageName, translate } from './locale'
import type { InterfaceLocale } from './locale'
import type { ReadingFormat, ReadingSettings } from '../types/reading'
export function localizedTextLength(settings: ReadingSettings, format: ReadingFormat | null | undefined, locale: InterfaceLocale) {
 const computed = getTextLength(settings, format)
 if (locale === 'en') return computed
 const length = translate(locale, ('length.' + settings.textLength) as 'length.short' | 'length.medium' | 'length.long')
 const t = (key: Parameters<typeof translate>[1], params = {}) => translate(locale, key, params)
 const model = format?.volumeModel ?? 'prose'
 if (format && !format.lengths.includes(settings.textLength)) return { ...computed, description: t('length.unavailable', { length }), instruction: '' }
 if (model === 'form-fields') return { ...computed, description: t('length.fields'), instruction: 'Длина: 4–8 содержательных полей с заполненными значениями. Не применяйте целевое число слов и не дополняйте анкету связным текстом ради объёма.' }
 if (model === 'list-items') {
  const range = { short: '4–6', medium: '8–12', long: '16–24' }[settings.textLength]
  return { ...computed, description: t('length.items', { length, range }), instruction: 'Длина: ' + range + ' позиций меню или расписания. Используйте краткие подписи и необходимые детали; не применяйте норму слов для связного текста и не раздувайте позиции.' }
 }
 if (model === 'compact-message') return { ...computed,
  description: t(settings.language.lengthUnit === 'structure' ? 'length.compact' : 'length.compactWords'),
  instruction: settings.language.lengthUnit === 'structure'
   ? 'Длина: одно краткое сообщение. Язык: ' + languageName(settings.language, locale) + '. Только необходимые подробности, относительная длина без численной цели по словам или знакам. Не растягивайте записку, объявление или уведомление до статьи.'
   : 'Длина: примерно 20–60 слов, независимо от уровня. Не растягивайте записку, объявление или уведомление до объёма связного текста.' }
 const scope = model.startsWith('visual-')
  ? ' Применяйте эту длину к ' + (model === 'visual-report' ? 'сопровождающему анализу' : 'всему сопровождающему тексту вместе') + ', а не к каждому изображению, кадру или шагу. Подписи внутри изображения должны быть краткими; выбор длинного текста не должен сам по себе повышать сложность визуального материала.'
  : ''
 const structure = { short: 'Одна основная мысль и только детали, нужные для её понимания.', medium: 'Развивайте одну основную мысль с ясным ходом изложения и несколькими деталями.', long: 'Развивайте основную мысль в нескольких связанных частях с дополнительными подробностями, без повторений.' }[settings.textLength]
 return { ...computed,
  description: computed.wordRange ? t('length.words', { length, range: computed.wordRange }) : t('length.structure', { length, level: settings.cefrLevel }),
  instruction: computed.wordRange ? 'Длина: примерно ' + computed.wordRange + ' слов.' + scope
   : 'Длина: ' + length + ', уровень ' + settings.cefrLevel + '. ' + structure + ' Сохраняйте лексику, грамматику и количество деталей в пределах выбранной сложности. Для языка «' + languageName(settings.language, locale) + '» используйте структуру и относительную длину чтения вместо численной цели по словам или знакам.' + scope,
 }
}
