import { createAbortError, rejectOnAbort } from 'common/utils/abortError'
import AbortableRequestConsumers from 'common/utils/AbortableRequestConsumers'

type SharedRequest = {
  readonly controller: AbortController
  readonly consumers: AbortableRequestConsumers
  settled: Promise<void>
}

type GetOrStart<Value> = (start: () => Promise<Value>) => Promise<Value>
type Fetch<Value> = (signal?: AbortSignal) => Promise<Value>

export default class SharedAbortableRequests<Value> {
  private readonly requests = new Map<string, SharedRequest>()

  run(
    key: string,
    signal: AbortSignal | undefined,
    getOrStart: GetOrStart<Value>,
    fetch: Fetch<Value>,
  ): Promise<Value> {
    if (signal?.aborted) {
      return Promise.reject(createAbortError(signal))
    }
    const existing = this.requests.get(key)
    if (existing?.controller.signal.aborted) {
      return rejectOnAbort(
        existing.settled.then(() => this.run(key, signal, getOrStart, fetch)),
        signal,
      )
    }
    return rejectOnAbort(
      this.startOrJoin(key, signal, getOrStart, fetch),
      signal,
    )
  }

  private startOrJoin(
    key: string,
    signal: AbortSignal | undefined,
    getOrStart: GetOrStart<Value>,
    fetch: Fetch<Value>,
  ): Promise<Value> {
    const controller = signal ? new AbortController() : undefined
    let started = false
    const result = getOrStart(() => {
      started = true
      return fetch(controller?.signal)
    })
    const request =
      started && signal && controller
        ? this.track(key, controller, result)
        : this.requests.get(key)
    return request
      ? request.consumers.subscribe(
          result,
          signal,
          () => request.controller.abort(),
          request.settled,
        )
      : result
  }

  private track(
    key: string,
    controller: AbortController,
    result: Promise<Value>,
  ): SharedRequest {
    const request: SharedRequest = {
      controller,
      consumers: new AbortableRequestConsumers(),
      settled: Promise.resolve(),
    }
    const forget = (): void => {
      if (this.requests.get(key) === request) {
        this.requests.delete(key)
      }
    }
    request.settled = result.then(forget, forget)
    this.requests.set(key, request)
    return request
  }
}
