import ApiClient, { ApiError } from './ApiClient'

const path = '/resource'
const expectedUrl = `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
const result = { success: true }
const error = new Error('fake error message')
const accessToken = 'accessToken'

const errorResponse = { status: 404, statusText: 'NOT_FOUND' }
const expectSignal = expect.objectContaining({
  aborted: expect.any(Boolean),
  onabort: expect.any(Function)
})

let apiClient
let auth

beforeEach(() => {
  fetch.resetMocks()
  auth = { getAccessToken: jest.fn() }
  apiClient = new ApiClient(auth)
})

describe('fetchJson', () => {
  describe('Successful request', () => {
    beforeEach(() => {
      setUpSuccessResponse()
    })

    it('Resolves to parsed JSON on success', async () => {
      expect(apiClient.fetchJson(path, true)).resolves.toEqual(result)
    })

    it('Makes a request with given parameters', async () => {
      const expectedHeaders = new Headers({ 'Authorization': `Bearer ${accessToken}` })
      await apiClient.fetchJson(path, true, expectSignal)
      expect(fetch).toBeCalledWith(expectedUrl, {
        headers: expectedHeaders,
        signal: expectSignal
      })
    })

    it('Makes a request without Authorization header', async () => {
      await apiClient.fetchJson(path, false, expectSignal)
      expect(fetch).toBeCalledWith(expectedUrl, {
        headers: new Headers(),
        signal: expectSignal
      })
    })
  })

  testErrorResponse(() => apiClient.fetchJson(path, true))
})

describe('postJson', () => {
  const json = {
    'payload': 1
  }

  it('Resolves on success', async () => {
    setUpSuccessResponse('')

    await expect(apiClient.postJson(path, json)).resolves.toBeDefined()
  })

  it('Makes a post request with given parameters', async () => {
    setUpSuccessResponse('')

    await apiClient.postJson(path, json)

    const expectedHeaders = new Headers({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8'
    })
    expect(fetch).toBeCalledWith(expectedUrl, {
      body: JSON.stringify(json),
      headers: expectedHeaders,
      method: 'POST',
      signal: expectSignal
    })
  })

  testErrorResponse(() => apiClient.postJson(path, json))
})

describe('fetchBlob', () => {
  it('Resolves to dataURI', async () => {
    setUpSuccessResponse()

    const blob = new Blob([JSON.stringify(result)])
    expect(apiClient.fetchBlob(path)).resolves.toEqual(blob)
  })

  it('Makes a request with given parameters', async () => {
    setUpSuccessResponse()

    await apiClient.fetchBlob(path, true)

    const expectedHeaders = new Headers({ 'Authorization': `Bearer ${accessToken}` })
    expect(fetch).toBeCalledWith(expectedUrl, {
      headers: expectedHeaders,
      signal: expectSignal
    })
  })

  it('Makes a request without Authorization header', async () => {
    setUpSuccessResponse()

    await apiClient.fetchBlob(path, false)

    expect(fetch).toBeCalledWith(expectedUrl, {
      headers: new Headers(),
      signal: expectSignal
    })
  })

  testErrorResponse(() => apiClient.fetchBlob(path, true))
})

function setUpSuccessResponse (data = JSON.stringify(result)) {
  auth.getAccessToken.mockReturnValueOnce(accessToken)
  fetch.mockResponseOnce(data)
}

function testErrorResponse (action) {
  it('Can be cancelled', async () => {
    setUpSuccessResponse()
    const callback = jest.fn()
    const promise = action()
    const waitable = promise.then(() => null)
    promise.then(callback).catch(callback).cancel()
    await waitable
    expect(callback).not.toHaveBeenCalled()
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })
    await expect(action()).rejects.toEqual(error)
  })

  it('Rejects with error if fetch fails', async () => {
    fetch.mockRejectOnce(error)
    await expect(action()).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    const expectedError = new ApiError(errorResponse.statusText, {})
    fetch.mockResponseOnce('', errorResponse)
    await expect(action()).rejects.toEqual(expectedError)
  })

  it('Rejects with description as error message if response not ok and is JSON', async () => {
    const jsonError = { title: 'error title', description: 'error description' }
    fetch.mockResponseOnce(JSON.stringify(jsonError), errorResponse)
    await expect(action()).rejects.toEqual(new ApiError(jsonError.description, jsonError))
  })
}
