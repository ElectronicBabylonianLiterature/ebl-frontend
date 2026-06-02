import Bluebird from 'bluebird'

type QueueState = {
  activeCount: number
  waitingResolvers: Array<() => void>
}

export default class ConcurrencyLimiter {
  private readonly queueState: QueueState = {
    activeCount: 0,
    waitingResolvers: [],
  }

  constructor(private readonly maximumConcurrency: number) {}

  run<ReturnValue>(
    operation: () => Bluebird<ReturnValue>,
  ): Bluebird<ReturnValue> {
    return this.acquireSlot().then((releaseSlot) =>
      Bluebird.try(operation).finally(releaseSlot),
    )
  }

  private acquireSlot(): Bluebird<() => void> {
    return new Bluebird((resolve) => {
      const tryAcquireSlot = () => {
        if (this.queueState.activeCount < this.maximumConcurrency) {
          this.queueState.activeCount += 1
          resolve(() => this.releaseSlot())
          return
        }

        this.queueState.waitingResolvers.push(tryAcquireSlot)
      }

      tryAcquireSlot()
    })
  }

  private releaseSlot(): void {
    this.queueState.activeCount = Math.max(0, this.queueState.activeCount - 1)
    const next = this.queueState.waitingResolvers.shift()

    if (next) {
      next()
    }
  }
}
