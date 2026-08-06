import _ from 'lodash'
import { stringify } from 'query-string'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryResult } from 'query/QueryResult'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import { CacheEntry, setCachedValue, trimCache } from 'common/utils/cache'
import getOrFetchCachedValue from 'common/utils/getOrFetchCachedValue'
import {
  ThumbnailBlob,
  ThumbnailSize,
} from 'fragmentarium/application/FragmentRepositoryTypes'

export const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
export const maximumCachedFragments = 250
export const maximumCachedThumbnails = 250
export const maximumCachedProvenanceRecords = 250
export const maximumCachedProvenanceChildren = 250
export const maximumCachedQueryResults = 250
export const latestQueryCacheKey = 'latest:'
export const provenanceCacheKey = 'provenance:'
export const defaultCacheScope = 'default'

const fragmentFetchConcurrencyLimit = 6
const thumbnailFetchConcurrencyLimit = 8

type QueryItemWithPrefetchedFragment = QueryResult['items'][number]

export default class FragmentCache {
  private cacheScope: string | null = null
  cacheGeneration = 0
  readonly provenances = new Map<
    string,
    CacheEntry<readonly ProvenanceRecord[]>
  >()
  readonly provenanceRequests = new Map<
    string,
    Promise<readonly ProvenanceRecord[]>
  >()
  readonly provenanceById = new Map<string, CacheEntry<ProvenanceRecord>>()
  readonly provenanceByIdRequests = new Map<string, Promise<ProvenanceRecord>>()
  readonly provenanceChildrenById = new Map<
    string,
    CacheEntry<readonly ProvenanceRecord[]>
  >()
  readonly provenanceChildrenByIdRequests = new Map<
    string,
    Promise<readonly ProvenanceRecord[]>
  >()
  readonly fragments = new Map<string, CacheEntry<Fragment>>()
  readonly fragmentRequests = new Map<string, Promise<Fragment>>()
  readonly queryResults = new Map<string, CacheEntry<QueryResult>>()
  readonly queryResultRequests = new Map<string, Promise<QueryResult>>()
  readonly thumbnails = new Map<string, CacheEntry<ThumbnailBlob>>()
  readonly thumbnailRequests = new Map<string, Promise<ThumbnailBlob>>()
  readonly fragmentFetchLimiter = new ConcurrencyLimiter(
    fragmentFetchConcurrencyLimit,
  )
  readonly thumbnailFetchLimiter = new ConcurrencyLimiter(
    thumbnailFetchConcurrencyLimit,
  )
  private readonly prefetchedFragmentsByCacheKey = new Map<string, Fragment>()

  constructor(
    private readonly getCacheScope: () => string = () => defaultCacheScope,
  ) {}

  getOrFetch<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    requests: Map<CacheKey, Promise<CacheValue>>,
    key: CacheKey,
    maximumCacheSize: number,
    fetchValue: () => Promise<CacheValue>,
  ): Promise<CacheValue> {
    this.clearCachesWhenScopeChanges()
    return getOrFetchCachedValue({
      cache,
      requests,
      key,
      maximumCacheSize,
      cacheEntryLifetimeInMilliseconds,
      fetchValue,
    })
  }

  setProvenanceById(provenance: ProvenanceRecord): void {
    setCachedValue({
      cache: this.provenanceById,
      key: provenance.id,
      value: provenance,
      maximumCacheSize: maximumCachedProvenanceRecords,
      cacheEntryLifetimeInMilliseconds,
    })
  }

  cacheUpdatedFragment(fragment: Fragment): Fragment {
    this.clearCachesWhenScopeChanges()
    this.clearCachedFragments(fragment.number)
    this.clearCachedQueryResults()
    setCachedValue({
      cache: this.fragments,
      key: this.createFragmentCacheKey(fragment.number),
      value: fragment,
      maximumCacheSize: maximumCachedFragments,
      cacheEntryLifetimeInMilliseconds,
    })
    return fragment
  }

  trim<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    maximumCacheSize: number,
  ): void {
    trimCache(cache, maximumCacheSize)
  }

  storePrefetchedFragments(queryResult: QueryResult): void {
    this.prefetchedFragmentsByCacheKey.clear()

    queryResult.items.forEach((queryItem) => {
      const prefetchedFragment = this.readPrefetchedFragment(queryItem)

      if (!prefetchedFragment) {
        return
      }

      const lines = _.take(queryItem.matchingLines, 3)
      const excludeLines = _.isEmpty(queryItem.matchingLines)

      this.prefetchedFragmentsByCacheKey.set(
        this.createFragmentCacheKey(
          queryItem.museumNumber,
          lines,
          excludeLines,
        ),
        prefetchedFragment,
      )
      this.prefetchedFragmentsByCacheKey.set(
        this.createFragmentCacheKey(queryItem.museumNumber),
        prefetchedFragment,
      )
    })
  }

  takePrefetchedFragment(cacheKey: string): Fragment | null {
    const prefetchedFragment = this.prefetchedFragmentsByCacheKey.get(cacheKey)

    if (!prefetchedFragment) {
      return null
    }

    this.prefetchedFragmentsByCacheKey.delete(cacheKey)
    return prefetchedFragment
  }

  createFragmentCacheKey(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): string {
    return `${this.createFragmentCacheKeyPrefix(number)}${(lines ?? []).join(
      ',',
    )}:${excludeLines === true}`
  }

  createQueryCacheKey(fragmentQuery: FragmentQuery): string {
    return `query:${stringify(fragmentQuery)}`
  }

  createThumbnailCacheKey(number: string, size: ThumbnailSize): string {
    return `${number.length}:${number}:${size}`
  }

  private readPrefetchedFragment(
    queryItem: QueryItemWithPrefetchedFragment,
  ): Fragment | null {
    return queryItem.fragment ?? null
  }

  private createFragmentCacheKeyPrefix(number: string): string {
    return `${number.length}:${number}:`
  }

  invalidateFragment(number: string): void {
    this.clearCachedFragments(number)
    this.clearCachedQueryResults()
  }

  private clearCachedFragments(number: string): void {
    const cacheKeyPrefix = this.createFragmentCacheKeyPrefix(number)
    for (const cacheKey of this.fragments.keys()) {
      if (cacheKey.startsWith(cacheKeyPrefix)) {
        this.fragments.delete(cacheKey)
      }
    }
    for (const cacheKey of this.fragmentRequests.keys()) {
      if (cacheKey.startsWith(cacheKeyPrefix)) {
        this.fragmentRequests.delete(cacheKey)
      }
    }
  }

  clearCachedQueryResults(): void {
    this.queryResults.clear()
    this.queryResultRequests.clear()
    this.prefetchedFragmentsByCacheKey.clear()
    this.cacheGeneration += 1
  }

  private clearAllCaches(): void {
    this.provenances.clear()
    this.provenanceRequests.clear()
    this.provenanceById.clear()
    this.provenanceByIdRequests.clear()
    this.provenanceChildrenById.clear()
    this.provenanceChildrenByIdRequests.clear()
    this.fragments.clear()
    this.fragmentRequests.clear()
    this.queryResults.clear()
    this.queryResultRequests.clear()
    this.prefetchedFragmentsByCacheKey.clear()
    this.thumbnails.clear()
    this.thumbnailRequests.clear()
    this.cacheGeneration += 1
  }

  private clearCachesWhenScopeChanges(): void {
    const nextScope = this.resolveCacheScope()
    if (this.cacheScope === null) {
      this.cacheScope = nextScope
      return
    }
    if (this.cacheScope !== nextScope) {
      this.cacheScope = nextScope
      this.clearAllCaches()
    }
  }

  private resolveCacheScope(): string {
    try {
      return this.getCacheScope()
    } catch {
      return defaultCacheScope
    }
  }
}
