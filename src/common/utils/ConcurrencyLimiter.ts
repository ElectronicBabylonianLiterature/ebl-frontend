import { createAbortError } from 'common/utils/abortError'

type QueueState = {
  activeCount: number
  waitingResolvers: (() => void)[]
}

export default class ConcurrencyLimiter {
  private readonly queueState: QueueState = {
    activeCount: 0,
    waitingResolvers: [],
  }

  constructor(private readonly maximumConcurrency: number) {}

  async run<ReturnValue>(
    operation: () => Promise<ReturnValue>,
    signal?: AbortSignal,
  ): Promise<ReturnValue> {
    const releaseSlot = await this.acquireSlot(signal)
    try {
      return await operation()
    } finally {
      releaseSlot()
    }
  }

  private acquireSlot(signal?: AbortSignal): Promise<() => void> {
    if (signal?.aborted) {
      return Promise.reject(createAbortError(signal))
    }
    if (this.queueState.activeCount < this.maximumConcurrency) {
      this.queueState.activeCount += 1
      return Promise.resolve(this.createReleaseSlot())
    }
    return this.waitForSlot(signal)
  }

  private waitForSlot(signal?: AbortSignal): Promise<() => void> {
    return new Promise<() => void>((resolve, reject) => {
      const abortWhileWaiting = (): void => {
        this.queueState.waitingResolvers =
          this.queueState.waitingResolvers.filter(
            (resolver) => resolver !== waitingResolver,
          )
        reject(createAbortError(signal as AbortSignal))
      }
      const waitingResolver = (): void => {
        signal?.removeEventListener('abort', abortWhileWaiting)
        resolve(this.createReleaseSlot())
      }
      this.queueState.waitingResolvers.push(waitingResolver)
      signal?.addEventListener('abort', abortWhileWaiting, { once: true })
    })
  }

  private releaseSlot(): void {
    this.queueState.activeCount = Math.max(0, this.queueState.activeCount - 1)

    const next = this.queueState.waitingResolvers.shift()

    if (next) {
      this.queueState.activeCount += 1
      next()
    }
  }

  private createReleaseSlot(): () => void {
    let isReleased = false

    return () => {
      if (!isReleased) {
        isReleased = true
        this.releaseSlot()
      }
    }
  }
}
