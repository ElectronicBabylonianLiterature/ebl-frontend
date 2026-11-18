import {
  CacheEntry,
  getCachedValue,
  setCachedValueForKeys,
} from 'common/utils/cache'

const lifetime = 1000

function cacheUnder(
  cache: Map<string, CacheEntry<string>>,
  keys: readonly string[],
): string {
  return setCachedValueForKeys({
    cache,
    keys,
    value: 'entry',
    maximumCacheSize: 10,
    cacheEntryLifetimeInMilliseconds: lifetime,
    getCurrentTime: () => 0,
  })
}

it('stores the value under every key and returns it', () => {
  const cache = new Map<string, CacheEntry<string>>()
  expect(cacheUnder(cache, ['alias', 'id'])).toEqual('entry')
  expect([...cache.keys()]).toEqual(['alias', 'id'])
  expect(getCachedValue(cache, 'alias', () => 1)).toEqual('entry')
  expect(getCachedValue(cache, 'id', () => 1)).toEqual('entry')
})

it('stores a repeated key once', () => {
  const cache = new Map<string, CacheEntry<string>>()
  cacheUnder(cache, ['id', 'id'])
  expect([...cache.keys()]).toEqual(['id'])
})
