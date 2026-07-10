import Bluebird from 'bluebird'
import ConcurrencyLimiter from './ConcurrencyLimiter'

type QueueState = {
  activeCount: number
  waitingResolvers: unknown[]
}

type Deferred<Value> = {
  promise: Bluebird<Value>
  resolve: (value: Value) => void
}

function deferred<Value>(): Deferred<Value> {
  let resolvePromise: (value: Value) => void = () => undefined
  const promise = new Bluebird<Value>((resolve) => {
    resolvePromise = resolve
  })

  return { promise, resolve: resolvePromise }
}

function queueState(limiter: ConcurrencyLimiter): QueueState {
  return (limiter as unknown as { queueState: QueueState }).queueState
}

async function settle(): Promise<void> {
  await Bluebird.delay(0)
  await Bluebird.delay(0)
}

describe('ConcurrencyLimiter', () => {
  it('limits normal concurrency', async () => {
    const limiter = new ConcurrencyLimiter(2)
    const started: string[] = []
    const completions = new Map<string, Deferred<string>>()
    let activeWork = 0
    let maximumActiveWork = 0

    const runOperation = (name: string): Bluebird<string> =>
      limiter.run(() => {
        started.push(name)
        activeWork += 1
        maximumActiveWork = Math.max(maximumActiveWork, activeWork)
        const completion = deferred<string>()
        completions.set(name, completion)
        return completion.promise.finally(() => {
          activeWork -= 1
        })
      })

    const operations = ['one', 'two', 'three', 'four'].map(runOperation)

    await settle()

    expect(started).toEqual(['one', 'two'])
    expect(maximumActiveWork).toBe(2)

    completions.get('one')?.resolve('one done')
    await settle()

    expect(started).toEqual(['one', 'two', 'three'])
    expect(maximumActiveWork).toBe(2)

    completions.get('two')?.resolve('two done')
    await settle()

    expect(started).toEqual(['one', 'two', 'three', 'four'])
    expect(maximumActiveWork).toBe(2)

    completions.get('three')?.resolve('three done')
    completions.get('four')?.resolve('four done')

    await expect(Bluebird.all(operations)).resolves.toEqual([
      'one done',
      'two done',
      'three done',
      'four done',
    ])
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })

  it('runs queued operations after active operations finish', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const firstCompletion = deferred<string>()
    const started: string[] = []

    const first = limiter.run(() => {
      started.push('first')
      return firstCompletion.promise
    })
    const second = limiter.run(() => {
      started.push('second')
      return Bluebird.resolve('second done')
    })

    await settle()

    expect(started).toEqual(['first'])

    firstCompletion.resolve('first done')
    await settle()

    expect(started).toEqual(['first', 'second'])
    await expect(Bluebird.all([first, second])).resolves.toEqual([
      'first done',
      'second done',
    ])
    expect(queueState(limiter).activeCount).toBe(0)
  })

  it('does not leak slots when queued operations are canceled', async () => {
    const limiter = new ConcurrencyLimiter(2)
    const activeCompletions = [deferred<string>(), deferred<string>()]
    const canceledOperations = [jest.fn(), jest.fn(), jest.fn()]
    let activeWork = 0
    let maximumActiveWork = 0

    const activeOperations = activeCompletions.map((completion, index) =>
      limiter.run(() => {
        activeWork += 1
        maximumActiveWork = Math.max(maximumActiveWork, activeWork)
        return completion.promise.finally(() => {
          activeWork -= 1
        })
      }),
    )
    const canceledPromises = canceledOperations.map((operation) =>
      limiter.run(() => {
        operation()
        return Bluebird.resolve('canceled operation ran')
      }),
    )

    await settle()

    expect(queueState(limiter).activeCount).toBe(2)
    expect(queueState(limiter).waitingResolvers).toHaveLength(3)

    canceledPromises.forEach((promise) => promise.cancel())
    await settle()

    expect(queueState(limiter).waitingResolvers).toHaveLength(0)

    activeCompletions.forEach((completion, index) => {
      completion.resolve(`active ${index} done`)
    })
    await Bluebird.all(activeOperations)
    await settle()

    const freshOperation = jest.fn(() => Bluebird.resolve('fresh done'))
    const freshPromise = limiter.run(freshOperation)

    await expect(freshPromise).resolves.toBe('fresh done')
    expect(freshOperation).toHaveBeenCalledTimes(1)
    canceledOperations.forEach((operation) => {
      expect(operation).not.toHaveBeenCalled()
    })
    expect(maximumActiveWork).toBeLessThanOrEqual(2)
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })

  it('does not deadlock when queued cancellation races with slot handoff', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const firstCompletion = deferred<string>()
    const queuedOperation = jest.fn(() => Bluebird.resolve('queued done'))

    const first = limiter.run(() => firstCompletion.promise)
    const queued = limiter.run(queuedOperation)

    await settle()

    firstCompletion.resolve('first done')
    queued.cancel()

    await expect(first).resolves.toBe('first done')
    await settle()

    const freshOperation = jest.fn(() => Bluebird.resolve('fresh done'))
    const fresh = limiter.run(freshOperation)

    await expect(fresh).resolves.toBe('fresh done')
    expect(queuedOperation).not.toHaveBeenCalled()
    expect(freshOperation).toHaveBeenCalledTimes(1)
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })
})
