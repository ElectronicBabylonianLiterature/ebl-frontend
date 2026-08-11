import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryItem } from 'query/QueryResult'

export function hasLatestTransliterationRecord(fragment: Fragment): boolean {
  return _(fragment.uniqueRecord).some(
    (entry) => entry.type === 'Transliteration' && !entry.isHistorical,
  )
}

export function hasRenderReadyFragment(
  queryItem: QueryItem,
  options: { includeLatestRecord?: boolean } = {},
): queryItem is QueryItem & { fragment: Fragment } {
  return Boolean(
    queryItem.fragment &&
    (!options.includeLatestRecord ||
      hasLatestTransliterationRecord(queryItem.fragment)),
  )
}
