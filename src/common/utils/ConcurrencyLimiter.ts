type QueueState = {
  activeCount: number
  waitingResolvers: (() => void)[]
}

function abortError(signal: AbortSignal): Error {
  return (
    (signal.reason as Error | undefined) ??
    new DOMException('The operation was aborted.', 'AbortError')
  )
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
    if (this.queueState.activeCount < this.maximumConcurrency) {
      this.queueState.activeCount += 1
      return Promise.resolve(this.createReleaseSlot())
    }
    return new Promise<() => void>((resolve, reject) => {
      const waitingResolver = (): void => resolve(this.createReleaseSlot())
      this.queueState.waitingResolvers.push(waitingResolver)
      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            const index =
              this.queueState.waitingResolvers.indexOf(waitingResolver)
            if (index >= 0) {
              this.queueState.waitingResolvers.splice(index, 1)
              reject(abortError(signal))
            }
          },
          { once: true },
        )
      }
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
