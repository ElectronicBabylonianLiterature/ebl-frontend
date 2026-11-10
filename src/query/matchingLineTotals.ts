import type { QueryItem } from 'query/QueryResult'
import type { FragmentSearchCriteria } from 'query/FragmentQuery'
import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'

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
  if (query.transliteration?.trim().includes('\n')) return undefined
  if (!query.transliteration && query.lemmaOperator === 'phrase') {
    if ((query.lemmas?.split('+').length ?? 0) > 1) return undefined
  }
  return query.transliteration || query.lemmas ? item.matchCount : undefined
}
