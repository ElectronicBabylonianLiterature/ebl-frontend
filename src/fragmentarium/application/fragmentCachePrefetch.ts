import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryResult } from 'query/QueryResult'
import { hasPrefetchableFullFragment } from 'query/queryItemRenderReady'
import { fragmentKey } from 'fragmentarium/application/fragmentCacheKeys'

export function storePrefetchedFragment(
  prefetchedFragments: Map<string, Fragment>,
  queryItem: QueryResult['items'][number],
): void {
  if (!hasPrefetchableFullFragment(queryItem)) {
    return
  }

  const prefetchedFragment = queryItem.fragment
  const lines = _.take(queryItem.matchingLines, 3)
  const excludeLines = _.isEmpty(queryItem.matchingLines)

  prefetchedFragments.set(
    fragmentKey(queryItem.museumNumber, lines, excludeLines),
    prefetchedFragment,
  )
  prefetchedFragments.set(
    fragmentKey(queryItem.museumNumber),
    prefetchedFragment,
  )
}
