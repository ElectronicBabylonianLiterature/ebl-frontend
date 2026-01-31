import ApiClient, { ApiError } from './ApiClient'

const path = '/resource'
const expectedUrl = `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
const result = { success: true }
const error = new Error('fake error message')
const accessToken = 'accessToken'

const errorResponse = { status: 404, statusText: 'NOT_FOUND' }
const expectSignal = expect.any(AbortSignal)
const requestJson = {
  payload: 1,
}

let apiClient
let auth
let errorReporter

beforeEach(() => {
  fetchMock.resetMocks()
  auth = { getAccessToken: jest.fn(), isAuthenticated: jest.fn() }
  errorReporter = { captureException: jest.fn() }
  apiClient = new ApiClient(auth, errorReporter)
})

describe('fetchJson', () => {
  describe('Successful request', () => {
    beforeEach(() => {
      setUpSuccessResponse()
    })

    test('Resolves to parsed JSON on success', async () => {
      expect(apiClient.fetchJson(path, true)).resolves.toEqual(result)
    })

    test('Makes a request with given parameters', async () => {
      const expectedHeaders = new Headers({
        Authorization: `Bearer ${accessToken}`,
      })
      await apiClient.fetchJson(path, true, expectSignal)
      expect(fetch).toBeCalledWith(expectedUrl, {
        headers: expectedHeaders,
        signal: expectSignal,
      })
    })

    test('Makes a request without Authorization header', async () => {
      await apiClient.fetchJson(path, false, expectSignal)
      expect(fetch).toBeCalledWith(expectedUrl, {
        headers: new Headers(),
        signal: expectSignal,
      })
    })
  })

  commonTests(() => apiClient.fetchJson(path, true))
})

describe('postJson', () => {
  test('Resolves on success', async () => {
    setUpSuccessResponse()

    await expect(apiClient.postJson(path, requestJson)).resolves.toEqual(result)
  })

  test.each([201, 204])('%i resolves to null', async (status) => {
    setUpEmptyResponse(status)

    await expect(apiClient.postJson(path, requestJson)).resolves.toBeNull()
  })

  test('Makes a post request with given parameters', async () => {
    setUpSuccessResponse()

    await apiClient.postJson(path, requestJson)

    const expectedHeaders = new Headers({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    })
    expect(fetch).toBeCalledWith(expectedUrl, {
      body: JSON.stringify(requestJson),
      headers: expectedHeaders,
      method: 'POST',
      signal: expectSignal,
    })
  })

  commonTests(() => apiClient.postJson(path, requestJson))
})

describe('putJson', () => {
  test('Resolves on success', async () => {
    setUpSuccessResponse()

    await expect(apiClient.putJson(path, requestJson)).resolves.toEqual(result)
  })

  test('No Content resolves to falsy value', async () => {
    setUpEmptyResponse(204)

    await expect(apiClient.putJson(path, requestJson)).resolves.toBeFalsy()
  })

  test('Makes a put request with given parameters', async () => {
    setUpSuccessResponse()

    await apiClient.putJson(path, requestJson)

    const expectedHeaders = new Headers({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    })
    expect(fetch).toBeCalledWith(expectedUrl, {
      body: JSON.stringify(requestJson),
      headers: expectedHeaders,
      method: 'PUT',
      signal: expectSignal,
    })
  })

  commonTests(() => apiClient.postJson(path, requestJson))
})

describe('fetchBlob', () => {
  test('Resolves to dataURI', async () => {
    setUpSuccessResponse()

    await expect(
      apiClient.fetchBlob(path).then((blob) => blob.text()),
    ).resolves.toEqual(JSON.stringify(result))
  })

  test('Makes a request with given parameters', async () => {
    setUpSuccessResponse()

    await apiClient.fetchBlob(path, true)

    const expectedHeaders = new Headers({
      Authorization: `Bearer ${accessToken}`,
    })
    expect(fetch).toBeCalledWith(expectedUrl, {
      headers: expectedHeaders,
      signal: expectSignal,
    })
  })

  test('Makes a request without Authorization header', async () => {
    setUpSuccessResponse()

    await apiClient.fetchBlob(path, false)

    expect(fetch).toBeCalledWith(expectedUrl, {
      headers: new Headers(),
      signal: expectSignal,
    })
  })

  commonTests(() => apiClient.fetchBlob(path, true))
})

function setUpSuccessResponse() {
  auth.getAccessToken.mockReturnValueOnce(accessToken)
  fetchMock.mockResponse(JSON.stringify(result))
}

function setUpEmptyResponse(status: number) {
  auth.getAccessToken.mockReturnValueOnce(accessToken)
  fetchMock.mockResponse('', { status })
}

function commonTests(action) {
  test('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => {
      throw error
    })
    await expect(action()).rejects.toThrow(error)
  })

  test('Rejects with error if fetch fails', async () => {
    fetchMock.mockRejectOnce(error)
    await expect(action()).rejects.toThrow(error)
    expect(errorReporter.captureException).toBeCalledWith(error)
  })

  test('Rejects with status text as error message if response not ok', async () => {
    const expectedError = new ApiError(errorResponse.statusText, {})
    fetchMock.mockResponseOnce('', errorResponse)
    await expect(action()).rejects.toThrow(expectedError)
    expect(errorReporter.captureException).toBeCalledWith(expectedError)
  })

  test('Rejects with description as error message if response not ok and is JSON', async () => {
    const jsonError = { title: 'error title', description: 'error description' }
    const expectedError = new ApiError(jsonError.description, jsonError)
    fetchMock.mockResponseOnce(JSON.stringify(jsonError), errorResponse)
    await expect(action()).rejects.toThrow(expectedError)
    expect(errorReporter.captureException).toBeCalledWith(expectedError)
  })
}
