import { CacheEntry } from 'common/utils/cache'
import getOrFetchAbortableCachedValue, {
  AbortableRequest,
} from 'common/utils/getOrFetchAbortableCachedValue'
import { settle } from 'test-support/concurrencyLimiterHelpers'

const key = 'chapter'

function createCompletion() {
  let resolve!: (value: string) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<string>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })
  return { promise, resolve, reject }
}

function createHarness() {
  const cache = new Map<string, CacheEntry<string>>()
  const requests = new Map<string, AbortableRequest<string>>()
  const fetches: {
    signal: AbortSignal
    completion: ReturnType<typeof createCompletion>
  }[] = []
  const fetchValue = jest.fn((signal: AbortSignal) => {
    const completion = createCompletion()
    fetches.push({ signal, completion })
    return completion.promise
  })
  const get = (signal?: AbortSignal): Promise<string> =>
    getOrFetchAbortableCachedValue({
      cache,
      requests,
      key,
      maximumCacheSize: 10,
      cacheEntryLifetimeInMilliseconds: 60000,
      fetchValue,
      signal,
    })
  return { cache, requests, fetches, fetchValue, get }
}

describe('getOrFetchAbortableCachedValue', () => {
  it('shares one fetch between subscribers and caches its value', async () => {
    const { fetches, fetchValue, get, requests } = createHarness()

    const first = get(new AbortController().signal)
    const second = get(new AbortController().signal)
    fetches[0].completion.resolve('value')

    await expect(Promise.all([first, second])).resolves.toEqual([
      'value',
      'value',
    ])
    await expect(get()).resolves.toBe('value')
    expect(fetchValue).toHaveBeenCalledTimes(1)
    expect(requests.size).toBe(0)
  })

  it('keeps a shared fetch alive when only one subscriber aborts', async () => {
    const { fetches, fetchValue, get } = createHarness()
    const leaving = new AbortController()

    const abandoned = get(leaving.signal)
    const remaining = get(new AbortController().signal)
    leaving.abort()

    await expect(abandoned).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetches[0].signal.aborted).toBe(false)

    fetches[0].completion.resolve('value')
    await expect(remaining).resolves.toBe('value')
    expect(fetchValue).toHaveBeenCalledTimes(1)
  })

  it('aborts the fetch and unregisters it when every subscriber aborts', async () => {
    const { fetches, get, requests } = createHarness()
    const first = new AbortController()
    const second = new AbortController()

    const firstResult = get(first.signal)
    const secondResult = get(second.signal)
    first.abort()
    expect(fetches[0].signal.aborted).toBe(false)
    expect(requests.has(key)).toBe(true)

    second.abort()
    expect(fetches[0].signal.aborted).toBe(true)
    expect(requests.has(key)).toBe(false)

    await expect(firstResult).rejects.toMatchObject({ name: 'AbortError' })
    await expect(secondResult).rejects.toMatchObject({ name: 'AbortError' })
  })

  it.each(['before', 'after'])(
    'never aborts a fetch pinned by a signal-less caller joining %s',
    async (order) => {
      const { fetches, get } = createHarness()
      const controller = new AbortController()

      let pinned: Promise<string>
      let abortable: Promise<string>
      if (order === 'before') {
        pinned = get()
        abortable = get(controller.signal)
      } else {
        abortable = get(controller.signal)
        pinned = get()
      }
      controller.abort()

      await expect(abortable).rejects.toMatchObject({ name: 'AbortError' })
      expect(fetches[0].signal.aborted).toBe(false)
      fetches[0].completion.resolve('value')
      await expect(pinned).resolves.toBe('value')
    },
  )

  it('starts a fresh fetch for a caller arriving right after a full abort', async () => {
    const { fetches, fetchValue, get } = createHarness()
    const controller = new AbortController()

    const abandoned = get(controller.signal)
    controller.abort()
    const fresh = get(new AbortController().signal)

    expect(fetchValue).toHaveBeenCalledTimes(2)
    expect(fetches[1].signal.aborted).toBe(false)
    fetches[0].completion.reject(
      new DOMException('The operation was aborted.', 'AbortError'),
    )
    fetches[1].completion.resolve('fresh value')

    await expect(abandoned).rejects.toMatchObject({ name: 'AbortError' })
    await expect(fresh).resolves.toBe('fresh value')
  })

  it('does not cache a value from a fetch that was fully aborted', async () => {
    const { cache, fetches, fetchValue, get } = createHarness()
    const controller = new AbortController()

    const abandoned = get(controller.signal)
    controller.abort()
    fetches[0].completion.resolve('stale value')

    await expect(abandoned).rejects.toMatchObject({ name: 'AbortError' })
    await settle()
    expect(cache.size).toBe(0)

    const fresh = get()
    fetches[1].completion.resolve('fresh value')
    await expect(fresh).resolves.toBe('fresh value')
    expect(fetchValue).toHaveBeenCalledTimes(2)
  })

  it('rejects an already-aborted caller without starting or joining a fetch', async () => {
    const { fetches, fetchValue, get } = createHarness()
    const controller = new AbortController()
    controller.abort()

    await expect(get(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(fetchValue).not.toHaveBeenCalled()

    const inFlight = get(new AbortController().signal)
    await expect(get(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(fetches[0].signal.aborted).toBe(false)
    fetches[0].completion.resolve('value')
    await expect(inFlight).resolves.toBe('value')
  })

  it('still resolves a cached value for an already-aborted caller', async () => {
    const { fetches, get } = createHarness()
    const request = get()
    fetches[0].completion.resolve('value')
    await request
    const controller = new AbortController()
    controller.abort()

    await expect(get(controller.signal)).resolves.toBe('value')
  })

  it('leaves a newer registration alone when an orphaned fetch is abandoned', async () => {
    const { fetches, get, requests } = createHarness()
    const controller = new AbortController()

    const orphaned = get(controller.signal)
    requests.clear()
    const current = get(new AbortController().signal)
    controller.abort()

    await expect(orphaned).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetches[0].signal.aborted).toBe(true)
    expect(fetches[1].signal.aborted).toBe(false)
    expect(requests.has(key)).toBe(true)

    fetches[1].completion.resolve('value')
    await expect(current).resolves.toBe('value')
  })

  it('propagates a fetch failure to subscribers and allows a retry', async () => {
    const { fetches, fetchValue, get } = createHarness()
    const failure = new Error('server error')

    const request = get(new AbortController().signal)
    fetches[0].completion.reject(failure)
    await expect(request).rejects.toBe(failure)

    const retry = get(new AbortController().signal)
    fetches[1].completion.resolve('value')
    await expect(retry).resolves.toBe('value')
    expect(fetchValue).toHaveBeenCalledTimes(2)
  })

  it('stops listening to the signal after the fetch settles', async () => {
    const { fetches, get } = createHarness()
    const controller = new AbortController()
    const removeEventListener = jest.spyOn(
      controller.signal,
      'removeEventListener',
    )

    const request = get(controller.signal)
    fetches[0].completion.resolve('value')
    await request
    await settle()

    expect(removeEventListener).toHaveBeenCalledWith(
      'abort',
      expect.any(Function),
    )
  })
})
