import Bluebird from 'bluebird'

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

  run<ReturnValue>(
    operation: () => Bluebird<ReturnValue>,
  ): Bluebird<ReturnValue> {
    let operationPromise: Bluebird<ReturnValue> | undefined
    let isCanceled = false

    const slotPromise = this.acquireSlot()

    return new Bluebird<ReturnValue>((resolve, reject, onCancel) => {
      onCancel?.(() => {
        isCanceled = true
        slotPromise.cancel()
        operationPromise?.cancel()
      })

      slotPromise
        .then((releaseSlot) => {
          if (isCanceled) {
            releaseSlot()
            return
          }

          operationPromise = Bluebird.try(operation).finally(releaseSlot)
          operationPromise.then(resolve, reject)
        })
        .catch(reject)
    })
  }

  private acquireSlot(): Bluebird<() => void> {
    return new Bluebird((resolve, _reject, onCancel) => {
      const waitingResolver = () => resolve(this.createReleaseSlot())

      onCancel?.(() => {
        this.queueState.waitingResolvers =
          this.queueState.waitingResolvers.filter(
            (resolver) => resolver !== waitingResolver,
          )
      })

      if (this.queueState.activeCount < this.maximumConcurrency) {
        this.queueState.activeCount += 1
        resolve(this.createReleaseSlot())
      } else {
        this.queueState.waitingResolvers.push(waitingResolver)
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
