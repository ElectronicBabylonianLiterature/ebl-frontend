import { QueryResult } from 'query/QueryResult'

interface PrefetchCache {
  readonly currentGeneration: number
  storePrefetchedFragments(queryResult: QueryResult): void
}

export function prefetchFrom(
  cache: PrefetchCache,
  queryResultRequest: Promise<QueryResult>,
): Promise<QueryResult> {
  const queryGeneration = cache.currentGeneration

  return queryResultRequest.then((queryResult) => {
    if (queryGeneration === cache.currentGeneration) {
      cache.storePrefetchedFragments(queryResult)
    }
    return queryResult
  })
}
