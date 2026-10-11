import { topics } from '../data/topics'
import { formats } from '../data/formats'
import { angles } from '../data/angles'
import { languages } from '../data/languages'
import { cefrLevels } from '../data/cefrLevels'
import { contentProfiles, textLengths } from '../data/textLengths'
import { familyWeights, readingFamilies } from '../data/readingFamilies'
import type { ContentProfile, ReadingAngle, ReadingCombination, ReadingFamily, ReadingFormat, ReadingSettings, ReadingTopic } from '../types/reading'

export const profileRank: Record<ContentProfile, number> = { A1: 0, A2: 1, B1: 2, B2: 3, 'C1+': 4 }
export interface ReadingCatalogs {
  topics: readonly ReadingTopic[]
  formats: readonly ReadingFormat[]
  angles: readonly ReadingAngle[]
}
export const readingCatalogs: ReadingCatalogs = { topics, formats, angles }

export function validateSettings(settings: ReadingSettings) {
  if (!Object.hasOwn(cefrLevels, settings.cefrLevel)) throw new Error(`Unknown difficulty "${settings.cefrLevel}".`)
  if (!Object.hasOwn(textLengths, settings.textLength)) throw new Error(`Unknown text length "${settings.textLength}".`)
  const language = languages.find(item => item.code === settings.language?.code)
  if (!language) throw new Error('Unknown reading language.')
  return { ...settings, language }
}

export function validateCatalogs(catalogs: ReadingCatalogs = readingCatalogs) {
  for (const [name, catalog] of Object.entries(catalogs)) {
    if (new Set(catalog.map((entry: { id: string }) => entry.id)).size !== catalog.length) throw new Error(`Duplicate ID in ${name}.`)
    for (const item of catalog) {
      if (!item.id || !item.label || !item.promptHint || !Object.hasOwn(profileRank, item.minProfile)) throw new Error(`Invalid entry in ${name}.`)
    }
  }
  const references = (ids: readonly string[], options: readonly { id: string }[], name: string) => {
    if (new Set(ids).size !== ids.length) throw new Error(`Duplicate reference in ${name}.`)
    for (const id of ids) if (!options.some(item => item.id === id)) throw new Error(`Unknown ${name} "${id}".`)
  }
  for (const format of catalogs.formats) {
    if (!readingFamilies.includes(format.family)) throw new Error(`Unknown family in "${format.id}".`)
    if (!['prose','compact-message','form-fields','brief-prose','list-items','visual-caption','visual-sequence','visual-report'].includes(format.volumeModel)) throw new Error(`Unknown volume model in "${format.id}".`)
    if (!['fiction','training','factual','sourced'].includes(format.contentStatus)) throw new Error(`Unknown content status in "${format.id}".`)
    if (!format.registerHint || !format.lengths.length || new Set(format.lengths).size !== format.lengths.length || format.lengths.some(length => !Object.hasOwn(textLengths, length))) throw new Error(`Invalid length or register in "${format.id}".`)
    references(format.topicIds, catalogs.topics, `topic in ${format.id}`)
    references(format.angleIds, catalogs.angles, `angle in ${format.id}`)
    references(format.shortAngleIds, format.angleIds.map(id => ({ id })), `short angle in ${format.id}`)
  }
  for (const angle of catalogs.angles) {
    if (!angle.simpleAction?.includes('{focus}')) throw new Error(`Missing concrete action in "${angle.id}".`)
    references(angle.topicIds, catalogs.topics, `topic in ${angle.id}`)
  }
  for (const topic of catalogs.topics) if (!topic.simpleFocus || !topic.disclosures) throw new Error(`Missing disclosure in "${topic.id}".`)
}

// Single semantic predicate shared by selection, settings changes and buildPrompt.
function incompatibility(settings: ReadingSettings, combination: ReadingCombination): string {
  const { topic, format, angle } = combination
  const profile = contentProfiles[settings.cefrLevel]
  if ([topic, format, angle].some(item => profileRank[item.minProfile] > profileRank[profile])) return `This combination needs a higher content profile than ${profile}. Press SPIN to find another text.`
  if (!topic.disclosures[profile]) return `This topic has no approved disclosure for ${profile}. Press SPIN to find another text.`
  if (!format.lengths.includes(settings.textLength)) return `This format is unavailable for ${textLengths[settings.textLength].label}. Press SPIN to find another text.`
  if (familyWeights(settings.cefrLevel)[format.family] <= 0) return 'This reading family is unavailable at this level. Press SPIN to find another text.'
  if (!format.topicIds.includes(topic.id) || !format.angleIds.includes(angle.id) || !angle.topicIds.includes(topic.id)) return 'This topic, format and angle do not have an approved shared scenario. Press SPIN to find another text.'
  if (settings.textLength === 'short' && !format.shortAngleIds.includes(angle.id)) return 'The required structure does not fit Short for this angle. Press SPIN to find another text.'
  return ''
}

let validated = false
function ensureCatalogs(catalogs: ReadingCatalogs) {
  if (catalogs !== readingCatalogs || !validated) {
    validateCatalogs(catalogs)
    if (catalogs === readingCatalogs) validated = true
  }
}

export function checkCombination(settings: ReadingSettings, combination: ReadingCombination, catalogs = readingCatalogs) {
  const normalized = validateSettings(settings)
  ensureCatalogs(catalogs)
  // Resolve canonical objects by ID; callers cannot inject altered prompt hints.
  const topic = catalogs.topics.find(item => item.id === combination.topic?.id)
  const format = catalogs.formats.find(item => item.id === combination.format?.id)
  const angle = catalogs.angles.find(item => item.id === combination.angle?.id)
  if (!topic || !format || !angle) return { valid: false as const, reason: 'Unknown catalog ID. Press SPIN to find another text.' }
  const canonical = { topic, format, angle }
  const reason = incompatibility(normalized, canonical)
  return reason ? { valid: false as const, reason } : { valid: true as const, reason: '', combination: canonical, settings: normalized, profile: contentProfiles[normalized.cefrLevel] }
}

export interface FamilyPool {
  family: ReadingFamily
  weight: number
  probability: number
  formats: { format: ReadingFormat; topics: { topic: ReadingTopic; angles: ReadingAngle[] }[] }[]
}
const poolCache = new Map<string, FamilyPool[]>()
export function getSelectionPool(settings: ReadingSettings, catalogs = readingCatalogs): FamilyPool[] {
  settings = validateSettings(settings)
  ensureCatalogs(catalogs)
  const key = `${settings.cefrLevel}:${settings.textLength}`
  const cached = catalogs === readingCatalogs ? poolCache.get(key) : undefined
  if (cached) return cached
  const weights = familyWeights(settings.cefrLevel)
  const pools: FamilyPool[] = []
  for (const family of readingFamilies) {
    if (weights[family] <= 0) continue
    const candidates: FamilyPool['formats'] = []
    for (const format of catalogs.formats.filter(item => item.family === family)) {
      const candidatesByTopic: FamilyPool['formats'][number]['topics'] = []
      for (const topic of catalogs.topics) {
        const compatibleAngles = catalogs.angles.filter(angle => !incompatibility(settings, { topic, format, angle }))
        if (compatibleAngles.length) candidatesByTopic.push({ topic, angles: compatibleAngles })
      }
      if (candidatesByTopic.length) candidates.push({ format, topics: candidatesByTopic })
    }
    if (candidates.length) pools.push({ family, formats: candidates, weight: weights[family], probability: 0 })
  }
  const total = pools.reduce((sum, pool) => sum + pool.weight, 0)
  if (!total) throw new Error('No compatible reading combinations for these settings. Please change the settings and press SPIN.')
  for (const pool of pools) pool.probability = pool.weight / total
  if (catalogs === readingCatalogs) poolCache.set(key, pools)
  return pools
}

export function enumerateCombinations(settings: ReadingSettings, catalogs = readingCatalogs): ReadingCombination[] {
  return getSelectionPool(settings, catalogs).flatMap(pool => pool.formats.flatMap(({ format, topics }) => topics.flatMap(({ topic, angles }) => angles.map(angle => ({ topic, format, angle })))))
}
