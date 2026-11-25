import type { QueryItem } from 'query/QueryResult'
import type { FragmentSearchCriteria } from 'query/FragmentQuery'
import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'
import {
  isMultilineTransliteration,
  isMultiLemmaPhrase,
} from 'query/queryShape'

export function countUniqueMatchingLines(
  lineIndexes: readonly number[],
): number | undefined {
  const count = takeUniqueMatchingLineIndexes(
    lineIndexes,
    Number.MAX_SAFE_INTEGER,
  ).length
  return count > 0 ? count : undefined
}

export function matchingLineTotal(
  item: QueryItem,
  query: FragmentSearchCriteria,
): number | null | undefined {
  if (item.totalMatchingLines != null) return item.totalMatchingLines
  if (isMultilineTransliteration(query) || isMultiLemmaPhrase(query))
    return undefined
  return query.transliteration || query.lemmas ? item.matchCount : undefined
}
