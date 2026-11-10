import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentCache } from './fragmentCache'
import { fragmentKey } from './fragmentCacheKeys'
import { FragmentRepository, onError } from './fragmentServicePorts'
import SharedAbortableRequests from 'common/utils/SharedAbortableRequests'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import { rejectOnAbort } from 'common/utils/abortError'

export default function findAbortableFragment(
  {
    number,
    lines,
    excludeLines,
    signal,
  }: {
    number: string
    lines?: readonly number[]
    excludeLines?: boolean
    signal?: AbortSignal
  },
  {
    cache,
    requests,
    limiter,
    repository,
    injectReferences,
  }: {
    cache: FragmentCache
    requests: SharedAbortableRequests<Fragment>
    limiter: ConcurrencyLimiter
    repository: Pick<FragmentRepository, 'find'>
    injectReferences: (fragment: Fragment) => Promise<Fragment>
  },
): Promise<Fragment> {
  const key = fragmentKey(number, lines, excludeLines)
  const fetch = (requestSignal?: AbortSignal): Promise<Fragment> => {
    const prefetched = cache.takePrefetchedFragment(key)
    const loaded = prefetched
      ? Promise.resolve(prefetched)
      : repository.find(number, lines, excludeLines, requestSignal)
    return loaded.then(injectReferences).catch(onError)
  }
  return requests.run(
    key,
    signal,
    (start) => cache.fragment(key, start),
    (requestSignal) =>
      limiter.run(
        () => rejectOnAbort(fetch(requestSignal), requestSignal),
        requestSignal,
      ),
  )
}
