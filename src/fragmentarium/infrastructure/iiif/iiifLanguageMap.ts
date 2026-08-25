import {
  isRecord,
  normalizeStrictStringArray,
} from 'fragmentarium/infrastructure/iiif/iiifValidation'

export const noLanguageKey = 'none'
export const defaultPreferredLanguages: readonly string[] = ['en']

function primarySubtag(languageTag: string): string {
  return languageTag.toLowerCase().split('-')[0]
}

function entriesFor(
  languageMap: Record<string, unknown>,
  key: string,
): readonly string[] {
  return normalizeStrictStringArray(languageMap[key])
}

function matchExact(
  languageMap: Record<string, unknown>,
  preferredLanguages: readonly string[],
): readonly string[] {
  for (const language of preferredLanguages) {
    const entries = entriesFor(languageMap, language)
    if (entries.length > 0) {
      return entries
    }
  }
  return []
}

function matchPrimarySubtag(
  languageMap: Record<string, unknown>,
  preferredLanguages: readonly string[],
): readonly string[] {
  const preferredSubtags = preferredLanguages.map(primarySubtag)
  for (const key of Object.keys(languageMap)) {
    if (
      key === noLanguageKey ||
      !preferredSubtags.includes(primarySubtag(key))
    ) {
      continue
    }
    const entries = entriesFor(languageMap, key)
    if (entries.length > 0) {
      return entries
    }
  }
  return []
}

function matchFirstAvailable(
  languageMap: Record<string, unknown>,
): readonly string[] {
  for (const key of Object.keys(languageMap)) {
    const entries = entriesFor(languageMap, key)
    if (entries.length > 0) {
      return entries
    }
  }
  return []
}

export function resolveLanguageMapEntries(
  value: unknown,
  preferredLanguages: readonly string[] = defaultPreferredLanguages,
): readonly string[] {
  if (!isRecord(value)) {
    return []
  }
  const exact = matchExact(value, preferredLanguages)
  if (exact.length > 0) {
    return exact
  }
  const bySubtag = matchPrimarySubtag(value, preferredLanguages)
  if (bySubtag.length > 0) {
    return bySubtag
  }
  const none = entriesFor(value, noLanguageKey)
  if (none.length > 0) {
    return none
  }
  return matchFirstAvailable(value)
}

export function resolveLanguageMap(
  value: unknown,
  preferredLanguages: readonly string[] = defaultPreferredLanguages,
): string | undefined {
  return resolveLanguageMapEntries(value, preferredLanguages)[0]
}

export function resolveLanguageMapText(
  value: unknown,
  preferredLanguages: readonly string[] = defaultPreferredLanguages,
): string | undefined {
  const entries = resolveLanguageMapEntries(value, preferredLanguages)
  return entries.length > 0 ? entries.join('\n') : undefined
}

export function hasLanguageMapContent(value: unknown): boolean {
  return (
    isRecord(value) &&
    Object.keys(value).some(
      (key) => normalizeStrictStringArray(value[key]).length > 0,
    )
  )
}
