import type { FragmentSearchCriteria } from 'query/FragmentQuery'

export function isMultilineTransliteration(
  query: FragmentSearchCriteria,
): boolean {
  return query.transliteration?.trim().includes('\n') ?? false
}

export function isMultiLemmaPhrase(query: FragmentSearchCriteria): boolean {
  return (
    !query.transliteration &&
    query.lemmaOperator === 'phrase' &&
    (query.lemmas?.split('+').length ?? 0) > 1
  )
}
