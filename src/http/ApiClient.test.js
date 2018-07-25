import ApiClient from './ApiClient'

const path = '/resource'
const expectedUrl = `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
const result = {success: true}
const error = new Error('fake error message')
const accessToken = 'accessToken'

const errorResponse = {status: 404, statusText: 'NOT_FOUND'}
const expectedError = new Error(errorResponse.statusText)

let apiClient
let auth
let signal

beforeEach(async () => {
  fetch.resetMocks()
  signal = 'mock signal'
  auth = {getAccessToken: jest.fn()}
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
      const expectedHeaders = new Headers({'Authorization': `Bearer ${accessToken}`})
      await apiClient.fetchJson(path, true, signal)
      expect(fetch).toBeCalledWith(expectedUrl, {
        headers: expectedHeaders,
        signal: signal
      })
    })

    it('Makes a request without Authorization header', async () => {
      await apiClient.fetchJson(path, false, signal)
      expect(fetch).toBeCalledWith(expectedUrl, {
        headers: new Headers(),
        signal: signal
      })
    })
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(apiClient.fetchJson(path, true, signal)).rejects.toEqual(error)
  })

  it('Rejects with error if fetch fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(apiClient.fetchJson(path, true, signal)).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    fetch.mockResponseOnce('', errorResponse)
    await expect(apiClient.fetchJson(path, true, signal)).rejects.toEqual(expectedError)
  })
})

describe('postJson', () => {
  const json = {
    'payload': 1
  }

  it('Resolves on success', async () => {
    setUpSuccessResponse('')

    await expect(apiClient.postJson(path, json, signal)).resolves.toBeUndefined()
  })

  it('Makes a post request with given parameters', async () => {
    setUpSuccessResponse('')

    await apiClient.postJson(path, json, signal)

    const expectedHeaders = new Headers({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8'
    })
    expect(fetch).toBeCalledWith(expectedUrl, {
      body: JSON.stringify(json),
      headers: expectedHeaders,
      method: 'POST',
      signal: signal
    })
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(apiClient.postJson(path, json, signal)).rejects.toEqual(error)
  })

  it('Rejects with error if post fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(apiClient.postJson(path, json, signal)).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    fetch.mockResponseOnce('', errorResponse)
    await expect(apiClient.postJson(path, json, signal)).rejects.toEqual(expectedError)
  })
})

describe('fetchBlob', () => {
  it('Resolves to dataURI', async () => {
    setUpSuccessResponse()

    const blob = new Blob([JSON.stringify(result)])
    expect(apiClient.fetchBlob(path, signal)).resolves.toEqual(blob)
  })

  it('Makes a request with given parameters', async () => {
    setUpSuccessResponse()

    await apiClient.fetchBlob(path, signal)

    const expectedHeaders = new Headers({'Authorization': `Bearer ${accessToken}`})
    expect(fetch).toBeCalledWith(expectedUrl, {
      headers: expectedHeaders,
      signal: signal
    })
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(apiClient.fetchBlob(path, signal)).rejects.toEqual(error)
  })

  it('Rejects with error if fetch fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(apiClient.fetchBlob(path, signal)).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    fetch.mockResponseOnce('', errorResponse)
    await expect(apiClient.fetchBlob(path)).rejects.toEqual(expectedError)
  })
})

function setUpSuccessResponse (data = JSON.stringify(result)) {
  auth.getAccessToken.mockReturnValueOnce(accessToken)
  fetch.mockResponseOnce(data)
}
