import type { CefrLevel } from '../types/reading'

// Plus/minus variants are product tuning labels, not separate official CEFR levels.
export const cefrLevels = {
  A1: 'Use very common concrete words and very short sentences. Focus on basic present-tense patterns and familiar situations.',
  'A1+': 'Keep A1 vocabulary and short sentences, with a few simple connectors and slightly more detail.',
  'A2-': 'Use mostly A1 language with a small amount of A2 vocabulary and simple descriptions.',
  A2: 'Use common everyday vocabulary, short connected sentences, and simple present, past, or future forms. Avoid idioms.',
  'A2+': 'Use A2 language with more detail, varied everyday vocabulary, and simple explanations of reasons.',
  'B1-': 'Use mostly A2 language, introducing connected paragraphs, familiar opinions, and straightforward narration.',
  B1: 'Use clear connected paragraphs about familiar topics. Include reasons, opinions, and a manageable variety of grammatical structures.',
  'B1+': 'Use B1 language with richer descriptions, more varied connectors, and occasional complex sentences.',
  'B2-': 'Use mostly B1 language with some abstract vocabulary and moderately complex sentences. Keep arguments easy to follow.',
  B2: 'Use varied vocabulary, complex sentences, clear argumentation, and some abstract ideas. Keep uncommon expressions understandable in context.',
  'B2+': 'Use B2 language with finer distinctions, varied sentence structures, and a few contextualized idiomatic expressions.',
  'C1-': 'Use mostly B2 language with some nuanced ideas and advanced vocabulary. Keep the structure explicit.',
  C1: 'Use precise, flexible language, nuanced meaning, complex syntax, and natural idiomatic expressions suited to the format.',
  'C1+': 'Use C1 language with greater stylistic variety, subtle implications, and sophisticated vocabulary appropriate to the topic.',
  C2: 'Use highly nuanced, natural language with sophisticated vocabulary and flexible syntax. Match the register to the format and tone.',
} as const satisfies Record<CefrLevel, string>
