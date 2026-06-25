export type CacheEntry<CacheValue> = {
  readonly expiresAt: number
  readonly value: CacheValue
}

export function getCachedValue<CacheKey, CacheValue>(
  cache: Map<CacheKey, CacheEntry<CacheValue>>,
  key: CacheKey,
  getCurrentTime: () => number = () => Date.now(),
): CacheValue | null {
  const entry = cache.get(key)

  if (!entry) {
    return null
  }

  if (entry.expiresAt <= getCurrentTime()) {
    cache.delete(key)
    return null
  }

  cache.delete(key)
  cache.set(key, entry)

  return entry.value
}

type SetCachedValueParams<CacheKey, CacheValue> = {
  readonly cache: Map<CacheKey, CacheEntry<CacheValue>>
  readonly key: CacheKey
  readonly value: CacheValue
  readonly maximumCacheSize: number
  readonly cacheEntryLifetimeInMilliseconds: number
  readonly getCurrentTime?: () => number
}

export function setCachedValue<CacheKey, CacheValue>({
  cache,
  key,
  value,
  maximumCacheSize,
  cacheEntryLifetimeInMilliseconds,
  getCurrentTime = () => Date.now(),
}: SetCachedValueParams<CacheKey, CacheValue>): CacheValue {
  cache.delete(key)
  cache.set(key, {
    expiresAt: getCurrentTime() + cacheEntryLifetimeInMilliseconds,
    value,
  })

  trimCache(cache, maximumCacheSize)

  return value
}

export function trimCache<CacheKey, CacheValue>(
  cache: Map<CacheKey, CacheEntry<CacheValue>>,
  maximumCacheSize: number,
): void {
  while (cache.size > maximumCacheSize) {
    const oldestKey = cache.keys().next().value

    if (oldestKey === undefined) {
      return
    }

    cache.delete(oldestKey)
  }
}
