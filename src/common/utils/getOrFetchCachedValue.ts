import Bluebird from 'bluebird'
import { CacheEntry, getCachedValue, setCachedValue } from 'common/utils/cache'

type GetOrFetchCachedValueParams<CacheKey, CacheValue> = {
  readonly cache: Map<CacheKey, CacheEntry<CacheValue>>
  readonly requests: Map<CacheKey, Bluebird<CacheValue>>
  readonly key: CacheKey
  readonly maximumCacheSize: number
  readonly cacheEntryLifetimeInMilliseconds: number
  readonly fetchValue: () => Bluebird<CacheValue>
  readonly getCurrentTime?: () => number
}

export default function getOrFetchCachedValue<CacheKey, CacheValue>({
  cache,
  requests,
  key,
  maximumCacheSize,
  cacheEntryLifetimeInMilliseconds,
  fetchValue,
  getCurrentTime = () => Date.now(),
}: GetOrFetchCachedValueParams<CacheKey, CacheValue>): Bluebird<CacheValue> {
  const cachedValue = getCachedValue(cache, key, getCurrentTime)

  if (cachedValue !== null) {
    return Bluebird.resolve(cachedValue)
  }

  const inFlightRequest = requests.get(key)

  if (inFlightRequest) {
    if (inFlightRequest.isCancelled()) {
      requests.delete(key)
    } else {
      return inFlightRequest
    }
  }

  const requestReference: { current?: Bluebird<CacheValue> } = {}
  const request = fetchValue()
    .then((value) =>
      requests.get(key) === requestReference.current
        ? setCachedValue({
            cache,
            key,
            value,
            maximumCacheSize,
            cacheEntryLifetimeInMilliseconds,
            getCurrentTime,
          })
        : value,
    )
    .finally(() => {
      if (requests.get(key) === requestReference.current) {
        requests.delete(key)
      }
    })

  requestReference.current = request
  requests.set(key, request)

  return request
}
