import Bluebird from 'bluebird'
import { CacheEntry, trimCache } from 'common/utils/cache'
import getOrFetchCachedValue from 'common/utils/getOrFetchCachedValue'

export const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
export const defaultCacheScope = 'default'

interface ClearableCache {
  clear(): void
}

export class ScopedCache {
  private scope: string | null = null
  private generation = 0
  private readonly caches: ClearableCache[] = []

  constructor(private readonly getCacheScope: () => string) {}

  get currentGeneration(): number {
    return this.generation
  }

  register<Cache extends ClearableCache>(cache: Cache): Cache {
    this.caches.push(cache)
    return cache
  }

  bumpGeneration(): void {
    this.generation += 1
  }

  getOrFetch<CacheValue>(
    cache: Map<string, CacheEntry<CacheValue>>,
    requests: Map<string, Bluebird<CacheValue>>,
    key: string,
    maximumCacheSize: number,
    fetchValue: () => Bluebird<CacheValue>,
  ): Bluebird<CacheValue> {
    this.clearWhenScopeChanges()
    return getOrFetchCachedValue({
      cache,
      requests,
      key,
      maximumCacheSize,
      cacheEntryLifetimeInMilliseconds,
      fetchValue,
    })
  }

  clearWhenScopeChanges(): void {
    const nextScope = this.resolveCacheScope()
    if (this.scope === null) {
      this.scope = nextScope
      return
    }
    if (this.scope !== nextScope) {
      this.scope = nextScope
      this.clearAll()
    }
  }

  trimCache<CacheKey, CacheValue>(
    cache: Map<CacheKey, CacheEntry<CacheValue>>,
    maximumCacheSize: number,
  ): void {
    trimCache(cache, maximumCacheSize)
  }

  private clearAll(): void {
    this.caches.forEach((cache) => cache.clear())
    this.bumpGeneration()
  }

  private resolveCacheScope(): string {
    try {
      return this.getCacheScope()
    } catch {
      return defaultCacheScope
    }
  }
}
