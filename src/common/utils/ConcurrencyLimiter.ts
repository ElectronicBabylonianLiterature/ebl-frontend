import Bluebird from 'bluebird'

type QueueState = {
  activeCount: number
  waitingResolvers: WaitingResolver[]
}

type WaitingResolver = {
  active: boolean
  acquire: () => boolean
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
    let releaseSlot: (() => void) | undefined
    let operationPromise: Bluebird<ReturnValue> | undefined
    let isCanceled = false
    let hasOperationStarted = false

    const slotPromise = this.acquireSlot()

    return new Bluebird<ReturnValue>((resolve, reject, onCancel) => {
      onCancel?.(() => {
        isCanceled = true
        slotPromise.cancel()
        operationPromise?.cancel()

        if (releaseSlot && !hasOperationStarted) {
          releaseSlot()
        }
      })

      slotPromise
        .then((releaseAcquiredSlot) => {
          releaseSlot = releaseAcquiredSlot

          if (isCanceled) {
            releaseSlot()
            return
          }

          hasOperationStarted = true
          operationPromise = Bluebird.try(operation).finally(releaseSlot)
          operationPromise.then(resolve, reject)
        })
        .catch(reject)
    })
  }

  private acquireSlot(): Bluebird<() => void> {
    return new Bluebird((resolve, _reject, onCancel) => {
      const waitingResolver: WaitingResolver = {
        active: true,
        acquire: () => {
          if (!waitingResolver.active) {
            return false
          }

          waitingResolver.active = false

          if (this.queueState.activeCount < this.maximumConcurrency) {
            this.queueState.activeCount += 1
            resolve(this.createReleaseSlot())
            return true
          }

          waitingResolver.active = true
          return false
        },
      }

      onCancel?.(() => {
        waitingResolver.active = false
        this.queueState.waitingResolvers =
          this.queueState.waitingResolvers.filter(
            (resolver) => resolver !== waitingResolver,
          )
      })

      if (!waitingResolver.acquire()) {
        this.queueState.waitingResolvers.push(waitingResolver)
      }
    })
  }

  private releaseSlot(): void {
    this.queueState.activeCount = Math.max(0, this.queueState.activeCount - 1)

    while (this.queueState.waitingResolvers.length > 0) {
      const next = this.queueState.waitingResolvers.shift()

      if (next?.acquire()) {
        return
      }
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
