import cancellableFetch from './cancellableFetch'

const url = 'http://example.com'
const result = { success: true }
const error = new Error('fake error message')

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
    expect(fetch).toBeCalledWith(url, options)
  })

  test('Makes a request without extra options', async () => {
    await cancellableFetch(url)
    expect(fetch).toBeCalledWith(url, {})
  })

  test('Forwards the abort signal to fetch', async () => {
    const controller = new AbortController()
    await cancellableFetch(url, { signal: controller.signal })
    expect(fetch).toBeCalledWith(url, { signal: controller.signal })
  })
})

test('Rejects with error if fetch fails', async () => {
  fetchMock.mockRejectOnce(error)
  await expect(cancellableFetch(url)).rejects.toThrow(error)
})
