import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/FragmentQuery'
import { FragmentAfoRegisterQueryResult, QueryResult } from 'query/QueryResult'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import FragmentCache, {
  latestQueryCacheKey,
  maximumCachedFragments,
  maximumCachedQueryResults,
} from 'fragmentarium/application/FragmentCache'
import {
  FragmentRepository,
  onError,
} from 'fragmentarium/application/FragmentRepositoryTypes'
import injectFragmentReferences from 'fragmentarium/application/injectFragmentReferences'

export default class FragmentQueryLoader {
  constructor(
    private readonly fragmentRepository: FragmentRepository,
    private readonly referenceInjector: ReferenceInjector,
    private readonly cache: FragmentCache,
  ) {}

  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): Promise<Fragment> {
    const cacheKey = this.cache.createFragmentCacheKey(
      number,
      lines,
      excludeLines,
    )
    return this.cache.getOrFetch(
      this.cache.fragments,
      this.cache.fragmentRequests,
      cacheKey,
      maximumCachedFragments,
      () =>
        this.cache.fragmentFetchLimiter.run(() =>
          this.findAndInjectFragment(number, lines, excludeLines, cacheKey),
        ),
    )
  }

  query(fragmentQuery: FragmentQuery): Promise<QueryResult> {
    const cacheKey = this.cache.createQueryCacheKey(fragmentQuery)
    const queryResultRequest = this.cache.getOrFetch(
      this.cache.queryResults,
      this.cache.queryResultRequests,
      cacheKey,
      maximumCachedQueryResults,
      () => this.fragmentRepository.query(fragmentQuery),
    )
    const queryGeneration = this.cache.cacheGeneration

    return queryResultRequest.then((queryResult) => {
      if (queryGeneration === this.cache.cacheGeneration) {
        this.cache.storePrefetchedFragments(queryResult)
      }
      return queryResult
    })
  }

  queryLatest(): Promise<QueryResult> {
    const queryResultRequest = this.cache.getOrFetch(
      this.cache.queryResults,
      this.cache.queryResultRequests,
      latestQueryCacheKey,
      maximumCachedQueryResults,
      () => this.fragmentRepository.queryLatest(),
    )
    const queryGeneration = this.cache.cacheGeneration

    return queryResultRequest.then((queryResult) => {
      if (queryGeneration === this.cache.cacheGeneration) {
        this.cache.storePrefetchedFragments(queryResult)
      }
      return queryResult
    })
  }

  queryByTraditionalReferences(
    traditionalReferences: string[],
  ): Promise<FragmentAfoRegisterQueryResult> {
    return this.fragmentRepository.queryByTraditionalReferences(
      traditionalReferences,
    )
  }

  private findAndInjectFragment(
    number: string,
    lines: readonly number[] | undefined,
    excludeLines: boolean | undefined,
    cacheKey: string,
  ): Promise<Fragment> {
    const prefetchedFragment = this.cache.takePrefetchedFragment(cacheKey)

    if (prefetchedFragment) {
      return this.injectReferences(prefetchedFragment).catch(onError)
    }

    return this.fragmentRepository
      .find(number, lines, excludeLines)
      .then((fragment: Fragment) => this.injectReferences(fragment))
      .catch(onError)
  }

  private injectReferences(fragment: Fragment): Promise<Fragment> {
    return injectFragmentReferences(this.referenceInjector, fragment)
  }
}
