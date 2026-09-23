import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import {
  deferred,
  queueState,
  settle,
} from 'test-support/concurrencyLimiterHelpers'

function abortDuringHandoff(
  limiter: ConcurrencyLimiter,
  controller: AbortController,
): void {
  const state = queueState(limiter)
  const handoff = state.waitingResolvers[0] as () => void
  state.waitingResolvers[0] = (): void => {
    handoff()
    controller.abort()
  }
}

describe('ConcurrencyLimiter slot handoff', () => {
  it('does not run a queued operation aborted after its slot was handed over', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const firstCompletion = deferred<string>()
    const queuedOperation = jest.fn(() => Promise.resolve('queued done'))
    const controller = new AbortController()

    const first = limiter.run(() => firstCompletion.promise)
    const queued = limiter.run(queuedOperation, controller.signal)
    await settle()
    abortDuringHandoff(limiter, controller)

    firstCompletion.resolve('first done')

    await expect(first).resolves.toBe('first done')
    await expect(queued).rejects.toMatchObject({ name: 'AbortError' })
    expect(queuedOperation).not.toHaveBeenCalled()
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })

  it('does not deadlock when queued cancellation races with slot handoff', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const firstCompletion = deferred<string>()
    const queuedOperation = jest.fn(() => Promise.resolve('queued done'))

    const controller = new AbortController()
    const first = limiter.run(() => firstCompletion.promise)
    const queued = limiter.run(queuedOperation, controller.signal)
    queued.catch(() => undefined)

    await settle()

    firstCompletion.resolve('first done')
    controller.abort()

    await expect(first).resolves.toBe('first done')
    await settle()

    const freshOperation = jest.fn(() => Promise.resolve('fresh done'))

    await expect(limiter.run(freshOperation)).resolves.toBe('fresh done')
    expect(freshOperation).toHaveBeenCalledTimes(1)
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })
})
