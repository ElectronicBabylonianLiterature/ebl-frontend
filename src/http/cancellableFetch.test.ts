import cancellableFetch from './cancellableFetch'

const url = 'http://example.com'
const result = { success: true }
const error = new Error('fake error message')

const expectSignal = expect.any(AbortSignal)

beforeEach(() => {
  fetchMock.resetMocks()
})

describe('Successful request', () => {
  beforeEach(() => {
    fetchMock.mockResponse(JSON.stringify(result))
  })

  test('Resolves', async () => {
    expect(
      cancellableFetch(url).then((response) => response.json()),
    ).resolves.toEqual(result)
  })

  test('Makes a request with given options', async () => {
    const options = {
      headers: new Headers({ Authorization: `Bearer token` }),
    }
    await cancellableFetch(url, options)
    expect(fetch).toBeCalledWith(url, {
      ...options,
      signal: expectSignal,
    })
  })

  test('Makes a request without extra options', async () => {
    await cancellableFetch(url)
    expect(fetch).toBeCalledWith(url, {
      signal: expectSignal,
    })
  })
})

test('Can be cancelled', async () => {
  fetchMock.mockResponse(JSON.stringify(result))
  const callback = jest.fn()
  const promise = cancellableFetch(url)
  const waitable = promise.then(() => null)
  promise.then(callback).catch(callback).cancel()
  await waitable
  expect(callback).not.toHaveBeenCalled()
})

test('Rejects with error if fetch fails', async () => {
  fetchMock.mockRejectOnce(error)
  await expect(cancellableFetch(url)).rejects.toThrow(error)
})
