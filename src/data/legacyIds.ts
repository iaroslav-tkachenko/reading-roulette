// Migration only; aliases are never additional catalog entries.
export const legacyTopicIds: Readonly<Record<string, string>> = { 'daily-life': 'home-household', nature: 'nature-wildlife' }
export const legacyFormatIds: Readonly<Record<string, string>> = { 'short-story': 'everyday-story', dialogue: 'everyday-conversation', article: 'explainer' }
