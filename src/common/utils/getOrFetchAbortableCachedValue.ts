import { createAbortError } from 'common/utils/abortError'
import { CacheEntry, getCachedValue, setCachedValue } from 'common/utils/cache'

export type AbortableRequest<CacheValue> = {
  readonly promise: Promise<CacheValue>
  readonly controller: AbortController
  abortableSubscribers: number
  pinned: boolean
}

type GetOrFetchAbortableCachedValueParams<CacheKey, CacheValue> = {
  readonly cache: Map<CacheKey, CacheEntry<CacheValue>>
  readonly requests: Map<CacheKey, AbortableRequest<CacheValue>>
  readonly key: CacheKey
  readonly maximumCacheSize: number
  readonly cacheEntryLifetimeInMilliseconds: number
  readonly fetchValue: (signal: AbortSignal) => Promise<CacheValue>
  readonly signal?: AbortSignal
  readonly getCurrentTime?: () => number
}

function startRequest<CacheKey, CacheValue>({
  cache,
  requests,
  key,
  maximumCacheSize,
  cacheEntryLifetimeInMilliseconds,
  fetchValue,
  getCurrentTime,
}: GetOrFetchAbortableCachedValueParams<
  CacheKey,
  CacheValue
>): AbortableRequest<CacheValue> {
  const controller = new AbortController()
  const isRegistered = (): boolean =>
    requests.get(key)?.controller === controller
  const promise = fetchValue(controller.signal)
    .then((value) =>
      isRegistered()
        ? setCachedValue({
            cache,
            key,
            value,
            maximumCacheSize,
            cacheEntryLifetimeInMilliseconds,
            getCurrentTime: getCurrentTime as () => number,
          })
        : value,
    )
    .finally(() => {
      if (isRegistered()) {
        requests.delete(key)
      }
    })
  const request = {
    promise,
    controller,
    abortableSubscribers: 0,
    pinned: false,
  }
  requests.set(key, request)
  return request
}

function subscribe<CacheValue>(
  request: AbortableRequest<CacheValue>,
  signal: AbortSignal | undefined,
  abandonRequest: () => void,
): Promise<CacheValue> {
  if (!signal) {
    request.pinned = true
    return request.promise
  }

  request.abortableSubscribers += 1
  return new Promise<CacheValue>((resolve, reject) => {
    const abortSubscriber = (): void => {
      request.abortableSubscribers -= 1
      reject(createAbortError(signal))
      if (request.abortableSubscribers === 0 && !request.pinned) {
        abandonRequest()
      }
    }
    signal.addEventListener('abort', abortSubscriber, { once: true })
    request.promise.then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', abortSubscriber)
    })
  })
}

export default function getOrFetchAbortableCachedValue<CacheKey, CacheValue>(
  params: GetOrFetchAbortableCachedValueParams<CacheKey, CacheValue>,
): Promise<CacheValue> {
  const { cache, requests, key, signal } = params
  const getCurrentTime = params.getCurrentTime ?? (() => Date.now())
  const cachedValue = getCachedValue(cache, key, getCurrentTime)

  if (cachedValue !== null) {
    return Promise.resolve(cachedValue)
  }
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal))
  }

  const request =
    requests.get(key) ?? startRequest({ ...params, getCurrentTime })

  return subscribe(request, signal, () => {
    if (requests.get(key) === request) {
      requests.delete(key)
    }
    request.controller.abort()
  })
}
