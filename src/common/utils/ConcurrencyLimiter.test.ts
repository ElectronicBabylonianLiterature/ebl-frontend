import ConcurrencyLimiter from './ConcurrencyLimiter'
import {
  Deferred,
  deferred,
  queueState,
  settle,
} from 'test-support/concurrencyLimiterHelpers'

describe('ConcurrencyLimiter', () => {
  it('limits normal concurrency', async () => {
    const limiter = new ConcurrencyLimiter(2)
    const started: string[] = []
    const completions = new Map<string, Deferred<string>>()
    let activeWork = 0
    let maximumActiveWork = 0

    const runOperation = (name: string): Promise<string> =>
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

    await expect(Promise.all(operations)).resolves.toEqual([
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
      return Promise.resolve('second done')
    })

    await settle()

    expect(started).toEqual(['first'])

    firstCompletion.resolve('first done')
    await settle()

    expect(started).toEqual(['first', 'second'])
    await expect(Promise.all([first, second])).resolves.toEqual([
      'first done',
      'second done',
    ])
    expect(queueState(limiter).activeCount).toBe(0)
  })

  it('releases the slot when an operation rejects', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const failure = new Error('failure')
    const queuedOperation = jest.fn(() => Promise.resolve('queued done'))

    const rejected = limiter.run(() => Promise.reject(failure))
    const queued = limiter.run(queuedOperation)

    await expect(rejected).rejects.toBe(failure)
    await expect(queued).resolves.toBe('queued done')
    expect(queuedOperation).toHaveBeenCalledTimes(1)
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })

  it('releases the slot when an operation throws synchronously', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const boom = new Error('boom')
    const subsequentOperation = jest.fn(() =>
      Promise.resolve('subsequent done'),
    )

    const thrown = limiter.run(() => {
      throw boom
    })
    const subsequent = limiter.run(subsequentOperation)

    await expect(thrown).rejects.toBe(boom)
    await expect(subsequent).resolves.toBe('subsequent done')
    expect(subsequentOperation).toHaveBeenCalledTimes(1)
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })

  it('ignores repeated release calls for the same acquired slot', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const releaseSlot = await (
      limiter as unknown as { acquireSlot: () => Promise<() => void> }
    ).acquireSlot()

    expect(queueState(limiter).activeCount).toBe(1)

    releaseSlot()
    releaseSlot()

    expect(queueState(limiter).activeCount).toBe(0)

    const freshOperation = jest.fn(() => Promise.resolve('fresh done'))

    await expect(limiter.run(freshOperation)).resolves.toBe('fresh done')
    expect(freshOperation).toHaveBeenCalledTimes(1)
    expect(queueState(limiter).activeCount).toBe(0)
    expect(queueState(limiter).waitingResolvers).toHaveLength(0)
  })
})
