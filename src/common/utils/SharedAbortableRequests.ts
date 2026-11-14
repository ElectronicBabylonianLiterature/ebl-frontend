import { createAbortError, rejectOnAbort } from 'common/utils/abortError'

type SharedRequest = {
  readonly controller: AbortController
  subscribers: number
  hasUncancellableConsumer: boolean
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
    if (!started) {
      this.join(this.requests.get(key), signal)
    } else if (signal && controller) {
      this.track(key, controller, signal, result)
    }
    return result
  }

  private track(
    key: string,
    controller: AbortController,
    signal: AbortSignal,
    result: Promise<Value>,
  ): void {
    const request: SharedRequest = {
      controller,
      subscribers: 0,
      hasUncancellableConsumer: false,
      settled: Promise.resolve(),
    }
    const forget = (): void => {
      if (this.requests.get(key) === request) {
        this.requests.delete(key)
      }
    }
    request.settled = result.then(forget, forget)
    this.requests.set(key, request)
    this.join(request, signal)
  }

  private join(
    request: SharedRequest | undefined,
    signal: AbortSignal | undefined,
  ): void {
    if (!request) {
      return
    }
    if (!signal) {
      request.hasUncancellableConsumer = true
      return
    }
    request.subscribers += 1
    signal.addEventListener('abort', () => this.leave(request), { once: true })
  }

  private leave(request: SharedRequest): void {
    request.subscribers -= 1
    if (request.subscribers === 0 && !request.hasUncancellableConsumer) {
      request.controller.abort()
    }
  }
}
