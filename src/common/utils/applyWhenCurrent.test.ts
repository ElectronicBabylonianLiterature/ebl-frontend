import applyWhenCurrent from 'common/utils/applyWhenCurrent'

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
