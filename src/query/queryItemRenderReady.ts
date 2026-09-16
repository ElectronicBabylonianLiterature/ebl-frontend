import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import { QueryItem } from 'query/QueryResult'

export type RenderReadyQueryItem = QueryItem & { fragment: Fragment }

export function getLatestTransliterationRecord(
  fragment: Fragment,
): RecordEntry | undefined {
  return _(fragment.uniqueRecord)
    .filter((entry) => entry.type === 'Transliteration' && !entry.isHistorical)
    .first()
}

export function hasLatestTransliterationRecord(fragment: Fragment): boolean {
  return getLatestTransliterationRecord(fragment) !== undefined
}

export function hasUnsupportedFragmentCardSummary(
  queryItem: QueryItem,
): boolean {
  return queryItem.cardSummary?.type === 'UnsupportedFragmentCardSummary'
}

export function hasPrefetchableFullFragment(
  queryItem: QueryItem,
): queryItem is RenderReadyQueryItem {
  return Boolean(queryItem.fragment) && queryItem.cardSummary === undefined
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
