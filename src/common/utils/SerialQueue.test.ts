import SerialQueue from 'common/utils/SerialQueue'
import { deferred, settle } from 'test-support/concurrencyLimiterHelpers'

it('starts an operation only after the previous one has settled', async () => {
  const queue = new SerialQueue()
  const first = deferred<string>()
  const second = jest.fn(() => Promise.resolve('second'))

  const firstResult = queue.enqueue(() => first.promise)
  const secondResult = queue.enqueue(second)
  await settle()
  expect(second).not.toHaveBeenCalled()

  first.resolve('first')

  await expect(firstResult).resolves.toBe('first')
  await expect(secondResult).resolves.toBe('second')
  expect(second).toHaveBeenCalledTimes(1)
})

it('runs the next operation after a failed one', async () => {
  const queue = new SerialQueue()
  const failure = new Error('first failed')

  const firstResult = queue.enqueue(() => Promise.reject(failure))
  const secondResult = queue.enqueue(() => Promise.resolve('second'))

  await expect(firstResult).rejects.toBe(failure)
  await expect(secondResult).resolves.toBe('second')
})
