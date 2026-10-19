import mapSeries from 'common/utils/mapSeries'

type Deferred = {
  promise: Promise<string>
  resolve: (value: string) => void
  reject: (error: Error) => void
}

function deferred(): Deferred {
  let resolvePromise: Deferred['resolve'] = () => undefined
  let rejectPromise: Deferred['reject'] = () => undefined
  const promise = new Promise<string>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  return { promise, resolve: resolvePromise, reject: rejectPromise }
}

async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

it('starts each item only after the previous one has settled', async () => {
  const pending = [deferred(), deferred()]
  const mapper = jest.fn((index: number) => pending[index].promise)

  const result = mapSeries([0, 1], mapper)
  await flushPromises()
  expect(mapper).toHaveBeenCalledTimes(1)

  pending[0].resolve('first')
  await flushPromises()
  expect(mapper).toHaveBeenCalledTimes(2)
  expect(mapper).toHaveBeenLastCalledWith(1)

  pending[1].resolve('second')
  await expect(result).resolves.toEqual(['first', 'second'])
})

it('keeps the input order even when later items settle faster', async () => {
  const delays = [20, 0, 10]
  const mapper = (delay: number): Promise<number> =>
    new Promise((resolve) => setTimeout(() => resolve(delay), delay))

  await expect(mapSeries(delays, mapper)).resolves.toEqual(delays)
})

it('accepts synchronous results', async () => {
  await expect(mapSeries([1, 2, 3], (item) => item * 2)).resolves.toEqual([
    2, 4, 6,
  ])
})

it('stops at the first rejection and does not start later items', async () => {
  const error = new Error('second failed')
  const mapper = jest.fn((item: number) =>
    item === 2 ? Promise.reject(error) : Promise.resolve(item),
  )

  await expect(mapSeries([1, 2, 3], mapper)).rejects.toBe(error)
  expect(mapper).toHaveBeenCalledTimes(2)
  expect(mapper).not.toHaveBeenCalledWith(3)
})

it('resolves to an empty list without calling the mapper', async () => {
  const mapper = jest.fn()

  await expect(mapSeries([], mapper)).resolves.toEqual([])
  expect(mapper).not.toHaveBeenCalled()
})
