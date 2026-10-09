import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Audit approved Markdown metadata and authored review scenarios, not runtime selection.
const root = fileURLToPath(new URL('../../', import.meta.url))
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const cells = line => line.split('|').slice(1, -1).map(cell => cell.trim())
const rows = file => read(file).split(/\r?\n/).filter(line => line.startsWith('| ')).map(cells)
const idPattern = /^[a-z]+(?:-[a-z]+)*$/
const rank = { A1: 0, A2: 1, B1: 2, B2: 3, 'C1+': 4 }
const topicRows = rows('docs/TOPICS.md').filter(row => idPattern.test(row[0]) && row[3] in rank)
const angleRows = rows('docs/ANGLES.md').filter(row => idPattern.test(row[0]) && row[3] in rank)
const topics = new Map(topicRows.map(row => [row[0], { label: row[1], min: row[3] }]))
const angles = new Map(angleRows.map(row => [row[0], { label: row[1], min: row[3] }]))
assert.equal(topicRows.length, 26)
assert.equal(topics.size, 26)
assert.equal(angleRows.length, 30)
assert.equal(angles.size, 30)

const families = []
const formats = new Map()
let family = -1
for (const line of read('docs/FORMATS.md').split(/\r?\n/)) {
  if (/^## .+ — \d+$/.test(line)) { family++; families.push(line.slice(3).replace(/ — \d+$/, '')) }
  if (!line.startsWith('| ')) continue
  const row = cells(line)
  if (!idPattern.test(row[0]) || !(row[3] in rank)) continue
  assert(family >= 0)
  assert(!formats.has(row[0]), `Duplicate format ${row[0]}`)
  formats.set(row[0], { id: row[0], label: row[1], min: row[3], family })
}
assert.equal(formats.size, 44)
assert.equal(families.length, 6)
assert.deepEqual(families.map((_, index) => [...formats.values()].filter(item => item.family === index).length), [6, 8, 6, 6, 11, 7])

const profiles = new Map()
const wordRanges = new Map()
for (const row of rows('docs/LEVELS_LENGTH.md')) {
  if (!(row[0] in rank) || !/\d+–\d+ слов/.test(row[2] ?? '')) continue
  const ranges = row.slice(2).map(cell => cell.match(/(\d+)–(\d+)/).slice(1).map(Number))
  const bounds = ranges.flat()
  assert(bounds.every((value, index) => index === 0 || value > bounds[index - 1]))
  wordRanges.set(row[0], ranges)
  for (const level of row[1].split(/,\s*/)) { assert(!profiles.has(level)); profiles.set(level, row[0]) }
}
const actualLevels = [...read('src/data/cefrLevels.ts').matchAll(/^  '?([ABC][12][+-]?)'?:/gm)].map(match => match[1])
assert.equal(profiles.size, 15)
assert.deepEqual([...profiles.keys()].sort(), actualLevels.sort())
const topicProfiles = new Map()
for (const row of rows('docs/TOPICS.md')) {
  if (!(row[1] in rank)) continue
  for (const level of row[0].split(/,\s*/)) topicProfiles.set(level, row[1])
}
assert.deepEqual([...profiles], [...topicProfiles])

const lengths = ['short', 'medium', 'long']
const matrix = rows('docs/LEVELS_LENGTH.md').filter(row => row.length === 6 && idPattern.test(row[0]))
assert.equal(matrix.length, 44)
assert.deepEqual(matrix.map(row => row[0]).sort(), [...formats.keys()].sort())
for (const row of matrix) {
  assert(row.slice(3).every(value => value === 'Да' || value === 'Нет'))
  Object.assign(formats.get(row[0]), { model: row[2], lengths: row.slice(3).map(value => value === 'Да') })
}
assert.deepEqual(lengths.map((_, index) => [...formats.values()].filter(item => item.lengths[index]).length), [44, 40, 32])
const modelCounts = Object.fromEntries([...new Set(matrix.map(row => row[2]))].map(model => [model, matrix.filter(row => row[2] === model).length]))
assert.deepEqual(modelCounts, { prose: 27, 'brief-prose': 4, 'compact-message': 3, 'list-items': 2, 'form-fields': 1, 'visual-caption': 4, 'visual-sequence': 2, 'visual-report': 1 })

const statusRows = rows('docs/CONTENT_STATUS.md').filter(row => formats.has(row[0]))
assert.equal(statusRows.length, 44)
assert.equal(new Set(statusRows.map(row => row[0])).size, 44)
const statuses = ['fiction', 'training', 'factual', 'sourced']
for (const row of statusRows) { assert(statuses.includes(row[1])); formats.get(row[0]).status = row[1] }
assert.equal(formats.get('news-brief').status, 'sourced')
assert.equal(formats.get('reportage').status, 'sourced')
assert.equal(formats.get('chart-description').status, 'training')
assert.equal(formats.get('visual-report').status, 'training')

const weights = new Map()
for (const row of rows('docs/READING_FAMILIES.md')) {
  if (row.length !== 7 || !row.slice(1).every(cell => /^\d+%$/.test(cell))) continue
  const values = row.slice(1).map(value => Number.parseInt(value))
  assert.equal(values.reduce((sum, value) => sum + value, 0), 100)
  for (const level of row[0].split(/,\s*/)) { assert(!weights.has(level)); weights.set(level, values) }
}
assert.deepEqual([...weights.keys()].sort(), [...profiles.keys()].sort())
function normalized(base, available) {
  const kept = base.map((weight, index) => available[index] ? weight : 0)
  const total = kept.reduce((sum, weight) => sum + weight, 0)
  if (!total) throw new Error('No eligible family')
  const result = kept.map(weight => weight / total * 100)
  assert(Math.abs(result.reduce((sum, weight) => sum + weight, 0) - 100) < 1e-9)
  assert(result.every((weight, index) => base[index] !== 0 || weight === 0))
  return result
}
assert.throws(() => normalized([15, 10, 0, 25, 20, 30], Array(6).fill(false)), /No eligible/)
assert.equal(normalized([15, 10, 0, 25, 20, 30], Array(6).fill(true))[2], 0)

const settings = []
for (const [level, profile] of profiles) for (const [index, length] of lengths.entries()) {
  const eligible = [...formats.values()].filter(item => rank[item.min] <= rank[profile] && item.lengths[index])
  const familyCounts = families.map((_, familyIndex) => eligible.filter(item => item.family === familyIndex).length)
  const finalWeights = normalized(weights.get(level), familyCounts.map(count => count > 0))
  settings.push({ level, profile, length, eligibleFormatsBeforeTopicAngleRules: eligible.length, familyCounts, baseWeights: weights.get(level), normalizedWeights: finalWeights })
}
assert.equal(settings.length, 45)
const lookup = (level, length) => settings.find(item => item.level === level && item.length === length)
assert.equal(lookup('A1', 'long').eligibleFormatsBeforeTopicAngleRules, 10)
assert.equal(lookup('A2', 'long').normalizedWeights[2], 0)
assert.equal(lookup('A2-', 'short').normalizedWeights[2], 0)
assert.equal(lookup('B1-', 'long').normalizedWeights[2], 0)
assert.equal(lookup('B2-', 'short').eligibleFormatsBeforeTopicAngleRules, 41)

// One manually reviewed content scenario for each approved format.
// These are audit witnesses, not the complete production compatibility allowlist.
const witnesses = [
  ['everyday-story', 'home-household', 'everyday-routine', 'Утро взрослого героя дома'],
  ['adventure-story', 'travel', 'problem-and-solution', 'Герои находят путь к месту ночлега'],
  ['detective-story', 'city-life', 'overlooked-detail', 'Деталь помогает объяснить исчезновение ключа'],
  ['science-fiction-story', 'technology-digital-life', 'unexpected-outcome', 'Одна вымышленная технология меняет рабочую задачу'],
  ['fantasy-story', 'nature-wildlife', 'unexpected-discovery', 'Находка раскрывает одно правило волшебного леса'],
  ['fable', 'family-relationships', 'problem-and-solution', 'Притча о помощи и понятном результате'],
  ['description', 'home-household', 'spatial-orientation', 'Расположение предметов в явно учебной комнате'],
  ['explainer', 'transport', 'how-it-works', 'Общий понятный процесс пересадки, без выдуманного действующего расписания'],
  ['fact-file', 'space-astronomy', 'first-introduction', 'Устойчивые базовые сведения о Луне'],
  ['faq', 'shopping-services', 'clarifying-details', 'Учебные вопросы покупателя о явно условных условиях заказа'],
  ['informational-interview', 'hobbies-leisure', 'first-introduction', 'Вымышленный собеседник рассказывает о своём хобби'],
  ['informational-report', 'environment', 'what-changed', 'Обзор реально подтверждённых изменений, без мнимого собственного исследования'],
  ['news-brief', 'city-life', 'what-changed', 'Новость о городской услуге при наличии найденной публикации'],
  ['reportage', 'culture-traditions', 'what-changed', 'Ход культурного события по реально прочитанным материалам'],
  ['short-review', 'arts-entertainment', 'feedback', 'Учебный отзыв о вымышленной книге'],
  ['comparative-review', 'technology-digital-life', 'comparing-two-options', 'Сравнение двух явно вымышленных устройств по одинаковым критериям'],
  ['opinion-column', 'learning-education', 'different-viewpoints', 'Учебная позиция о способах организации обучения'],
  ['argumentative-essay', 'philosophy-ethics', 'difficult-choice', 'Понятная этическая ситуация с тезисом и контраргументом'],
  ['written-debate', 'society-public-life', 'different-viewpoints', 'Учебные позиции об использовании общественного пространства'],
  ['speech', 'learning-education', 'first-introduction', 'Приветствие вымышленных участников учебного курса'],
  ['personal-note', 'home-household', 'request-for-help', 'Короткая просьба вымышленному соседу по дому'],
  ['message-exchange', 'travel', 'upcoming-plans', 'Учебная переписка о ближайшей поездке'],
  ['personal-letter', 'family-relationships', 'invitation', 'Учебное приглашение на семейную встречу'],
  ['diary-entry', 'sports', 'everyday-routine', 'День вымышленного автора с простой спортивной активностью'],
  ['everyday-conversation', 'shopping-services', 'clarifying-details', 'Уточнение деталей вымышленного заказа'],
  ['personal-blog-post', 'hobbies-leisure', 'unsuccessful-attempt', 'Учебный личный опыт освоения хобби'],
  ['notice', 'city-life', 'special-occasion', 'Учебное объявление о встрече соседей'],
  ['listing', 'shopping-services', 'first-introduction', 'Учебное объявление о продаже предмета'],
  ['menu', 'food-cooking', 'special-occasion', 'Учебное праздничное меню с вымышленными ценами'],
  ['schedule', 'learning-education', 'upcoming-plans', 'Учебное расписание занятий'],
  ['sample-form', 'learning-education', 'first-introduction', 'Анкета вымышленного участника курса'],
  ['instructions', 'food-cooking', 'how-it-works', 'Понятная последовательность обычных действий приготовления'],
  ['practical-guide', 'travel', 'problem-and-solution', 'Общие действия для организации вещей в поездке'],
  ['business-email', 'work-careers', 'request-for-help', 'Учебная просьба коллегам помочь с задачей'],
  ['formal-notice', 'city-life', 'change-of-plans', 'Учебное уведомление об изменении времени работы'],
  ['progress-report', 'work-careers', 'what-changed', 'Учебные выполненные задачи и следующие действия'],
  ['it-meeting-follow-up', 'work-careers', 'decisions-and-next-steps', 'Учебные решения, задачи, ответственные, сроки и открытые вопросы'],
  ['picture-description', 'home-household', 'spatial-orientation', 'Изображение комнаты и соответствующий текст'],
  ['picture-story', 'family-relationships', 'everyday-routine', 'Вымышленная последовательность простых домашних сцен'],
  ['illustrated-instructions', 'food-cooking', 'how-it-works', 'Изображения последовательных действий и пояснения'],
  ['map-guide', 'city-life', 'spatial-orientation', 'План вымышленного района и пояснение расположения'],
  ['infographic-explanation', 'environment', 'comparing-two-options', 'Простое сравнение двух действий с ресурсами, без неподтверждённых чисел'],
  ['chart-description', 'money-personal-finance', 'noticeable-pattern', 'График и описание явно учебных расходов'],
  ['visual-report', 'business-entrepreneurship', 'noticeable-pattern', 'Учебные заказы: таблица/график, анализ, ограничения'],
]
assert.equal(witnesses.length, 44)
assert.deepEqual(witnesses.map(item => item[0]).sort(), [...formats.keys()].sort())
function allowed(level, length, topicId, formatId, angleId) {
  const profile = profiles.get(level)
  const topic = topics.get(topicId), format = formats.get(formatId), angle = angles.get(angleId)
  assert(profile && topic && format && angle, 'Unknown metadata reference')
  return [topic, format, angle].every(item => rank[item.min] <= rank[profile]) &&
    format.lengths[lengths.indexOf(length)] && weights.get(level)[format.family] > 0
}
const scenarioChecks = witnesses.map(([formatId, topicId, angleId, scenario]) => {
  const format = formats.get(formatId)
  assert(allowed(format.min, 'short', topicId, formatId, angleId), `Unavailable witness ${formatId}`)
  for (const length of lengths) assert.equal(allowed(format.min, length, topicId, formatId, angleId), format.lengths[lengths.indexOf(length)])
  const effectiveStatus = ['description', 'faq'].includes(formatId) ? 'training' : format.status
  return { formatId, topicId, angleId, level: format.min, scenario, defaultStatus: format.status, effectiveStatus, condition: format.status === 'sourced' ? 'Requires actual external source discovery; not executed in this audit' : 'Authored scenario; not generated by an external model' }
})
const boundaryCases = [
  ['A1', 'long', 'philosophy-ethics', 'argumentative-essay', 'difficult-choice', false],
  ['A2', 'long', 'city-life', 'news-brief', 'what-changed', false],
  ['A2', 'short', 'culture-traditions', 'reportage', 'what-changed', false],
  ['A1', 'short', 'city-life', 'map-guide', 'spatial-orientation', false],
  ['A2', 'short', 'city-life', 'map-guide', 'spatial-orientation', true],
  ['A1', 'long', 'learning-education', 'sample-form', 'first-introduction', false],
  ['B1', 'short', 'philosophy-ethics', 'argumentative-essay', 'difficult-choice', false],
  ['A2-', 'short', 'work-careers', 'business-email', 'request-for-help', false],
  ['B1-', 'short', 'money-personal-finance', 'chart-description', 'noticeable-pattern', false],
  ['B2-', 'short', 'business-entrepreneurship', 'visual-report', 'noticeable-pattern', false],
  ['A1', 'short', 'home-household', 'description', 'common-misconception', false],
  ['A1', 'long', 'learning-education', 'schedule', 'upcoming-plans', true],
]
for (const test of boundaryCases) assert.equal(allowed(...test.slice(0, 5)), test[5], test.join(' / '))

const documents = ['PROJECT.md', 'README.md']
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) visit(file)
    else if (file.endsWith('.md')) documents.push(path.relative(root, file))
  }
}
visit(path.join(root, 'docs'))
let localLinks = 0
for (const file of documents) {
  const content = read(file)
  assert(!/[\t ]+$/m.test(content), `Trailing whitespace in ${file}`)
  for (const match of content.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    const target = match[1]
    if (/^[a-z][a-z\d+.-]*:|^#/i.test(target)) continue
    assert(fs.existsSync(path.resolve(root, path.dirname(file), target.split('#')[0])), `Broken link: ${file} -> ${target}`)
    localLinks++
  }
}
const evidence = {
  date: '2026-10-09', scope: 'Approved document metadata and authored review scenarios; not full runtime compatibility',
  counts: { topics: topics.size, formats: formats.size, angles: angles.size, families: families.length, levels: profiles.size, lengths: lengths.length },
  familyNames: families, modelCounts,
  statusCounts: Object.fromEntries(statuses.map(status => [status, [...formats.values()].filter(item => item.status === status).length])),
  formatLevelLengthChecks: settings.length * formats.size, settings,
  authoredScenarios: scenarioChecks, boundaryCases,
  documents: documents.length, localLinks,
  notVerified: ['Complete production Topic/Format/Angle allowlist and per-profile wording', 'Generated external reading texts, actual news sources, and image output', 'Browser interaction, clipboard, screen reader, and animation rendering'],
}
fs.writeFileSync(path.join(root, 'docs/validation/catalog-audit-2026-10-09.json'), `${JSON.stringify(evidence, null, 2)}\n`)
console.log(JSON.stringify({ ...evidence.counts, formatLevelLengthChecks: evidence.formatLevelLengthChecks, settingsCases: settings.length, authoredScenarios: scenarioChecks.length, boundaryCases: boundaryCases.length, documents: documents.length, localLinks, statusCounts: evidence.statusCounts, normalizedA2Long: lookup('A2', 'long').normalizedWeights, normalizedB1MinusLong: lookup('B1-', 'long').normalizedWeights }, null, 2))
