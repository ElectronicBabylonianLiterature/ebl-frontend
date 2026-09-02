import { debounce } from 'lodash'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import RealiaService from 'realia/application/RealiaService'

export const SEARCH_DEBOUNCE_MS = 300

export interface RealiaOption {
  label: string
  value: string
  entry?: RealiaEntry
}

export function toRealiaOption(entry: RealiaEntry): RealiaOption {
  return { value: entry.realiaId, label: entry.id, entry }
}

function toNativePromise<T>(promise: PromiseLike<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    promise.then(resolve, reject)
  })
}

export function loadRealiaOptions(
  realiaService: RealiaService,
  query: string,
  excludedRealiaIds: readonly string[] = [],
): Promise<RealiaOption[]> {
  return query
    ? toNativePromise<readonly RealiaEntry[]>(realiaService.search(query)).then(
        (entries) =>
          entries
            .filter((entry) => !excludedRealiaIds.includes(entry.realiaId))
            .map(toRealiaOption),
      )
    : Promise.resolve([])
}

export interface RealiaLoaderContext {
  realiaService: RealiaService
  excludedRealiaIds: readonly string[]
}

type OptionsCallback = (options: RealiaOption[]) => void

export interface RealiaOptionLoader {
  (query: string, callback: OptionsCallback): void
  cancel: () => void
}

export function createRealiaOptionLoader(
  getContext: () => RealiaLoaderContext,
  wait: number = SEARCH_DEBOUNCE_MS,
): RealiaOptionLoader {
  let latestRequestId = 0
  let isDisposed = false

  const respond = (
    requestId: number,
    callback: OptionsCallback,
    options: RealiaOption[],
  ): void => {
    if (!isDisposed && requestId === latestRequestId) {
      callback(options)
    }
  }

  const search = debounce((query: string, callback: OptionsCallback): void => {
    const { realiaService, excludedRealiaIds } = getContext()
    const requestId = (latestRequestId += 1)

    loadRealiaOptions(realiaService, query, excludedRealiaIds).then(
      (options) => respond(requestId, callback, options),
      () => respond(requestId, callback, []),
    )
  }, wait)

  const discardPendingRequests = (): void => {
    latestRequestId += 1
    search.cancel()
  }

  const load = (query: string, callback: OptionsCallback): void => {
    if (query) {
      search(query, callback)
    } else {
      discardPendingRequests()
      callback([])
    }
  }
  load.cancel = (): void => {
    isDisposed = true
    discardPendingRequests()
  }
  return load
}
