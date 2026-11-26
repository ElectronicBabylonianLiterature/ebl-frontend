import { createAbortError } from 'common/utils/abortError'

export default class AbortableRequestConsumers {
  private subscribers = 0
  private pinned = false

  subscribe<Value>(
    promise: Promise<Value>,
    signal: AbortSignal | undefined,
    abandonRequest: () => void,
    settled: Promise<unknown> = promise,
  ): Promise<Value> {
    if (!signal) {
      this.pinned = true
      return promise
    }
    if (signal.aborted) return Promise.reject(createAbortError(signal))

    this.subscribers += 1
    return new Promise<Value>((resolve, reject) => {
      const abortSubscriber = (): void => {
        this.subscribers -= 1
        reject(createAbortError(signal))
        if (this.subscribers === 0 && !this.pinned) abandonRequest()
      }
      signal.addEventListener('abort', abortSubscriber, { once: true })
      promise.then(resolve, reject)
      const stopListening = (): void => {
        signal.removeEventListener('abort', abortSubscriber)
      }
      settled.then(stopListening, stopListening)
    })
  }
}
