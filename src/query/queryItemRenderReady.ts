import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentCardSummary, QueryItem } from 'query/QueryResult'

export type RenderReadyQueryItem = QueryItem & { fragment: Fragment }
export type CardSummaryQueryItem = QueryItem & {
  cardSummary: FragmentCardSummary
}

export function hasLatestTransliterationRecord(fragment: Fragment): boolean {
  return _(fragment.uniqueRecord).some(
    (entry) => entry.type === 'Transliteration' && !entry.isHistorical,
  )
}

export function hasFragmentCardSummary(
  queryItem: QueryItem,
): queryItem is CardSummaryQueryItem {
  return queryItem.cardSummary?.type === 'FragmentCardSummary'
}

export function hasUnsupportedFragmentCardSummary(
  queryItem: QueryItem,
): boolean {
  return queryItem.cardSummary?.type === 'UnsupportedFragmentCardSummary'
}

export function hasRenderReadyFragment(
  queryItem: QueryItem,
  options: { includeLatestRecord?: boolean } = {},
): queryItem is RenderReadyQueryItem {
  return Boolean(
    queryItem.fragment &&
    (!options.includeLatestRecord ||
      hasLatestTransliterationRecord(queryItem.fragment)),
  )
}
