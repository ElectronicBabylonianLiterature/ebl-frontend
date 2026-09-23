import applyWhenCurrent, {
  applyWhenNotAborted,
} from 'common/utils/applyWhenCurrent'

let onSuccess: jest.Mock<void, [string]>
let onError: jest.Mock<void, [Error]>

const current = (): boolean => false
const stale = (): boolean => true

beforeEach(() => {
  onSuccess = jest.fn()
  onError = jest.fn()
})

test('Applies the result when the operation is still current', async () => {
  await applyWhenCurrent(() => Promise.resolve('result'), {
    onSuccess,
    onError,
  })(current)

  expect(onSuccess).toHaveBeenCalledWith('result')
  expect(onError).not.toHaveBeenCalled()
})

test('Discards the result when the operation is stale', async () => {
  await applyWhenCurrent(() => Promise.resolve('result'), {
    onSuccess,
    onError,
  })(stale)

  expect(onSuccess).not.toHaveBeenCalled()
  expect(onError).not.toHaveBeenCalled()
})

test('Applies the error when the operation is still current', async () => {
  const failure = new Error('network failure')

  await applyWhenCurrent<string>(() => Promise.reject(failure), {
    onSuccess,
    onError,
  })(current)

  expect(onError).toHaveBeenCalledWith(failure)
  expect(onSuccess).not.toHaveBeenCalled()
})

test('Discards the error when the operation is stale', async () => {
  await applyWhenCurrent<string>(
    () => Promise.reject(new Error('network failure')),
    { onSuccess, onError },
  )(stale)

  expect(onError).not.toHaveBeenCalled()
  expect(onSuccess).not.toHaveBeenCalled()
})

test('Checks staleness only after the operation settles', async () => {
  let isStale = false
  const promise = applyWhenCurrent(() => Promise.resolve('result'), {
    onSuccess,
    onError,
  })(() => isStale)

  isStale = true
  await promise

  expect(onSuccess).not.toHaveBeenCalled()
})

test('Does not start the operation before it is run', () => {
  const operation = jest.fn<Promise<string>, []>()
  operation.mockResolvedValue('result')

  applyWhenCurrent(operation, { onSuccess, onError })

  expect(operation).not.toHaveBeenCalled()
})

describe('applyWhenNotAborted', () => {
  test('Applies the result while the signal is not aborted', async () => {
    await applyWhenNotAborted(
      () => Promise.resolve('result'),
      new AbortController().signal,
      { onSuccess, onError },
    )

    expect(onSuccess).toHaveBeenCalledWith('result')
    expect(onError).not.toHaveBeenCalled()
  })

  test('Applies the error while the signal is not aborted', async () => {
    const failure = new Error('network failure')

    await applyWhenNotAborted<string>(
      () => Promise.reject(failure),
      new AbortController().signal,
      { onSuccess, onError },
    )

    expect(onError).toHaveBeenCalledWith(failure)
    expect(onSuccess).not.toHaveBeenCalled()
  })

  test('Discards the result once the signal is aborted', async () => {
    const controller = new AbortController()
    const promise = applyWhenNotAborted(
      () => Promise.resolve('result'),
      controller.signal,
      { onSuccess, onError },
    )

    controller.abort()
    await promise

    expect(onSuccess).not.toHaveBeenCalled()
  })

  test('Discards the error once the signal is aborted', async () => {
    const controller = new AbortController()
    const promise = applyWhenNotAborted<string>(
      () => Promise.reject(new Error('network failure')),
      controller.signal,
      { onSuccess, onError },
    )

    controller.abort()
    await promise

    expect(onError).not.toHaveBeenCalled()
  })
})
