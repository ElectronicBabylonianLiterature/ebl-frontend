import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { QueryResult } from 'query/QueryResult'
import { CacheEntry, setCachedValue } from 'common/utils/cache'
import { ThumbnailBlob } from 'fragmentarium/application/fragmentServicePorts'
import {
  cacheEntryLifetimeInMilliseconds,
  defaultCacheScope,
  ScopedCache,
} from 'fragmentarium/application/scopedCache'
import {
  deleteByPrefix,
  fragmentKey,
  fragmentKeyPrefix,
  provenanceCacheKey,
} from 'fragmentarium/application/fragmentCacheKeys'

export { defaultCacheScope }

export const maximumCachedFragments = 250
export const maximumCachedThumbnails = 250
export const maximumCachedProvenanceRecords = 250
export const maximumCachedProvenanceChildren = 250
export const maximumCachedQueryResults = 250

type QueryItemWithPrefetchedFragment = QueryResult['items'][number]

export class FragmentCache {
  private readonly scoped: ScopedCache
  private readonly provenances: Map<
    string,
    CacheEntry<readonly ProvenanceRecord[]>
  >
  private readonly provenanceRequests: Map<
    string,
    Promise<readonly ProvenanceRecord[]>
  >
  private readonly provenancesById: Map<string, CacheEntry<ProvenanceRecord>>
  private readonly provenanceByIdRequests: Map<
    string,
    Promise<ProvenanceRecord>
  >
  private readonly provenanceChildrenById: Map<
    string,
    CacheEntry<readonly ProvenanceRecord[]>
  >
  private readonly provenanceChildrenByIdRequests: Map<
    string,
    Promise<readonly ProvenanceRecord[]>
  >
  private readonly fragments: Map<string, CacheEntry<Fragment>>
  private readonly fragmentRequests: Map<string, Promise<Fragment>>
  private readonly queryResults: Map<string, CacheEntry<QueryResult>>
  private readonly queryResultRequests: Map<string, Promise<QueryResult>>
  private readonly prefetchedFragments: Map<string, Fragment>
  private readonly thumbnails: Map<string, CacheEntry<ThumbnailBlob>>
  private readonly thumbnailRequests: Map<string, Promise<ThumbnailBlob>>

  constructor(getCacheScope: () => string) {
    this.scoped = new ScopedCache(getCacheScope)
    this.provenances = this.scoped.register(new Map())
    this.provenanceRequests = this.scoped.register(new Map())
    this.provenancesById = this.scoped.register(new Map())
    this.provenanceByIdRequests = this.scoped.register(new Map())
    this.provenanceChildrenById = this.scoped.register(new Map())
    this.provenanceChildrenByIdRequests = this.scoped.register(new Map())
    this.fragments = this.scoped.register(new Map())
    this.fragmentRequests = this.scoped.register(new Map())
    this.queryResults = this.scoped.register(new Map())
    this.queryResultRequests = this.scoped.register(new Map())
    this.prefetchedFragments = this.scoped.register(new Map())
    this.thumbnails = this.scoped.register(new Map())
    this.thumbnailRequests = this.scoped.register(new Map())
  }

  get currentGeneration(): number {
    return this.scoped.currentGeneration
  }

  fragment(
    key: string,
    fetchValue: () => Promise<Fragment>,
  ): Promise<Fragment> {
    return this.scoped.getOrFetch(
      this.fragments,
      this.fragmentRequests,
      key,
      maximumCachedFragments,
      fetchValue,
    )
  }

  queryResult(
    key: string,
    fetchValue: () => Promise<QueryResult>,
  ): Promise<QueryResult> {
    return this.scoped.getOrFetch(
      this.queryResults,
      this.queryResultRequests,
      key,
      maximumCachedQueryResults,
      fetchValue,
    )
  }

  thumbnail(
    key: string,
    fetchValue: () => Promise<ThumbnailBlob>,
  ): Promise<ThumbnailBlob> {
    return this.scoped.getOrFetch(
      this.thumbnails,
      this.thumbnailRequests,
      key,
      maximumCachedThumbnails,
      fetchValue,
    )
  }

  allProvenances(
    fetchValue: () => Promise<readonly ProvenanceRecord[]>,
  ): Promise<readonly ProvenanceRecord[]> {
    return this.scoped.getOrFetch(
      this.provenances,
      this.provenanceRequests,
      provenanceCacheKey,
      1,
      fetchValue,
    )
  }

  provenance(
    id: string,
    fetchValue: () => Promise<ProvenanceRecord>,
  ): Promise<ProvenanceRecord> {
    return this.scoped.getOrFetch(
      this.provenancesById,
      this.provenanceByIdRequests,
      id,
      maximumCachedProvenanceRecords,
      fetchValue,
    )
  }

  provenanceChildren(
    id: string,
    fetchValue: () => Promise<readonly ProvenanceRecord[]>,
  ): Promise<readonly ProvenanceRecord[]> {
    return this.scoped.getOrFetch(
      this.provenanceChildrenById,
      this.provenanceChildrenByIdRequests,
      id,
      maximumCachedProvenanceChildren,
      fetchValue,
    )
  }

  storeProvenance(provenance: ProvenanceRecord): void {
    setCachedValue({
      cache: this.provenancesById,
      key: provenance.id,
      value: provenance,
      maximumCacheSize: maximumCachedProvenanceRecords,
      cacheEntryLifetimeInMilliseconds,
    })
  }

  storeUpdatedFragment(fragment: Fragment): Fragment {
    this.scoped.clearWhenScopeChanges()
    this.clearFragments(fragment.number)
    this.clearQueryResults()
    setCachedValue({
      cache: this.fragments,
      key: fragmentKey(fragment.number),
      value: fragment,
      maximumCacheSize: maximumCachedFragments,
      cacheEntryLifetimeInMilliseconds,
    })
    return fragment
  }

  clearFragments(number: string): void {
    const prefix = fragmentKeyPrefix(number)
    deleteByPrefix(this.fragments, prefix)
    deleteByPrefix(this.fragmentRequests, prefix)
  }

  clearQueryResults(): void {
    this.queryResults.clear()
    this.queryResultRequests.clear()
    this.prefetchedFragments.clear()
    this.scoped.bumpGeneration()
  }

  storePrefetchedFragments(queryResult: QueryResult): void {
    this.prefetchedFragments.clear()
    queryResult.items.forEach((queryItem) =>
      this.storePrefetchedFragment(queryItem),
    )
  }

  takePrefetchedFragment(key: string): Fragment | null {
    const prefetchedFragment = this.prefetchedFragments.get(key)

    if (!prefetchedFragment) {
      return null
    }

    this.prefetchedFragments.delete(key)
    return prefetchedFragment
  }

  trimCache<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    maximumCacheSize: number,
  ): void {
    this.scoped.trimCache(cache, maximumCacheSize)
  }

  private storePrefetchedFragment(
    queryItem: QueryItemWithPrefetchedFragment,
  ): void {
    const prefetchedFragment = queryItem.fragment ?? null

    if (!prefetchedFragment) {
      return
    }

    const lines = _.take(queryItem.matchingLines, 3)
    const excludeLines = _.isEmpty(queryItem.matchingLines)

    this.prefetchedFragments.set(
      fragmentKey(queryItem.museumNumber, lines, excludeLines),
      prefetchedFragment,
    )
    this.prefetchedFragments.set(
      fragmentKey(queryItem.museumNumber),
      prefetchedFragment,
    )
  }
}
