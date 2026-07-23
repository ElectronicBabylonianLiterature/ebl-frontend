import ConcurrencyLimiter from './ConcurrencyLimiter'
import {
  deferred,
  queueState,
  settle,
} from 'test-support/concurrencyLimiterHelpers'

describe('ConcurrencyLimiter cancellation', () => {
  it('rejects without running the operation when the signal is already aborted', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const operation = jest.fn(() => Promise.resolve('never runs'))
    const controller = new AbortController()
    controller.abort()

    await expect(
      limiter.run(operation, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(operation).not.toHaveBeenCalled()
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })

  it('rejects with the abort reason carried by the signal', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const reason = new Error('caller gave up')
    const signal = { aborted: true, reason } as unknown as AbortSignal

    await expect(
      limiter.run(() => Promise.resolve('never runs'), signal),
    ).rejects.toBe(reason)
  })

  it('stops listening to the signal once the slot is granted', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const activeCompletion = deferred<string>()
    const controller = new AbortController()
    const removeEventListener = jest.spyOn(
      controller.signal,
      'removeEventListener',
    )

    const active = limiter.run(() => activeCompletion.promise)
    const queued = limiter.run(
      () => Promise.resolve('queued done'),
      controller.signal,
    )

    await settle()

    expect(queueState(limiter).waitingResolvers).toHaveLength(1)

    activeCompletion.resolve('active done')
    await expect(active).resolves.toBe('active done')
    await expect(queued).resolves.toBe('queued done')

    expect(removeEventListener).toHaveBeenCalledWith(
      'abort',
      expect.any(Function),
    )

    controller.abort()
    await settle()

    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })

  it('does not leak slots when queued operations are canceled', async () => {
    const limiter = new ConcurrencyLimiter(2)
    const activeCompletions = [deferred<string>(), deferred<string>()]
    const canceledOperations = [jest.fn(), jest.fn(), jest.fn()]
    let activeWork = 0
    let maximumActiveWork = 0

    const activeOperations = activeCompletions.map((completion) =>
      limiter.run(() => {
        activeWork += 1
        maximumActiveWork = Math.max(maximumActiveWork, activeWork)
        return completion.promise.finally(() => {
          activeWork -= 1
        })
      }),
    )
    const controllers = canceledOperations.map(() => new AbortController())
    const canceledPromises = canceledOperations.map((operation, index) =>
      limiter.run(() => {
        operation()
        return Promise.resolve('canceled operation ran')
      }, controllers[index].signal),
    )
    canceledPromises.forEach((promise) => promise.catch(() => undefined))

    await settle()

    expect(queueState(limiter).activeCount).toBe(2)
    expect(queueState(limiter).waitingResolvers).toHaveLength(3)

    controllers.forEach((controller) => controller.abort())
    await settle()

    expect(queueState(limiter).waitingResolvers).toHaveLength(0)

    activeCompletions.forEach((completion, index) => {
      completion.resolve(`active ${index} done`)
    })
    await Promise.all(activeOperations)
    await settle()

    const freshOperation = jest.fn(() => Promise.resolve('fresh done'))

    await expect(limiter.run(freshOperation)).resolves.toBe('fresh done')
    canceledOperations.forEach((operation) => {
      expect(operation).not.toHaveBeenCalled()
    })
    expect(maximumActiveWork).toBe(2)
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })

  it('does not interrupt a running operation when its signal aborts', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const activeCompletion = deferred<string>()
    const controller = new AbortController()
    const queuedOperation = jest.fn(() => Promise.resolve('queued done'))

    const active = limiter.run(
      () => activeCompletion.promise,
      controller.signal,
    )

    await settle()

    expect(queueState(limiter).activeCount).toBe(1)

    const queued = limiter.run(queuedOperation)

    await settle()

    expect(queuedOperation).not.toHaveBeenCalled()
    expect(queueState(limiter).waitingResolvers).toHaveLength(1)

    controller.abort()
    await settle()

    expect(queuedOperation).not.toHaveBeenCalled()
    expect(queueState(limiter).activeCount).toBe(1)

    activeCompletion.resolve('active done')
    await expect(active).resolves.toBe('active done')
    await settle()

    expect(queuedOperation).toHaveBeenCalledTimes(1)
    await expect(queued).resolves.toBe('queued done')
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })

  it('continues running fresh work after repeated queued cancellations', async () => {
    const limiter = new ConcurrencyLimiter(1)

    for (const iteration of [1, 2, 3]) {
      const activeCompletion = deferred<string>()
      const active = limiter.run(() => activeCompletion.promise)

      await settle()

      const controller = new AbortController()
      const canceledOperation = jest.fn(() => Promise.resolve('canceled'))
      const canceled = limiter.run(canceledOperation, controller.signal)
      canceled.catch(() => undefined)

      await settle()

      expect(queueState(limiter).waitingResolvers).toHaveLength(1)

      controller.abort()
      await settle()

      expect(canceledOperation).not.toHaveBeenCalled()
      expect(queueState(limiter).waitingResolvers).toHaveLength(0)

      activeCompletion.resolve(`active ${iteration} done`)
      await expect(active).resolves.toBe(`active ${iteration} done`)
      await settle()

      const freshOperation = jest.fn(() =>
        Promise.resolve(`fresh ${iteration} done`),
      )

      await expect(limiter.run(freshOperation)).resolves.toBe(
        `fresh ${iteration} done`,
      )
      expect(queueState(limiter).activeCount).toBe(0)
      expect(queueState(limiter).waitingResolvers).toHaveLength(0)
    }
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
