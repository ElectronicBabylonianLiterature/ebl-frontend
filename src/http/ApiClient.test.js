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

beforeEach(async () => {
  fetch.resetMocks()

  auth = {getAccessToken: jest.fn()}
  apiClient = new ApiClient(auth)
})

describe('fetchJson', () => {
  it('Resolves to parsed JSON on success', async () => {
    setUpSuccessResponse()

    expect(apiClient.fetchJson(path, true)).resolves.toEqual(result)
  })

  it('Makes a request with given parameters', async () => {
    setUpSuccessResponse()

    await apiClient.fetchJson(path, true)

    const expectedHeaders = new Headers({'Authorization': `Bearer ${accessToken}`})
    expect(fetch).toBeCalledWith(expectedUrl, {headers: expectedHeaders})
  })

  it('Makes a request without Authorization header', async () => {
    setUpSuccessResponse()

    await apiClient.fetchJson(path, false)

    expect(fetch).toBeCalledWith(expectedUrl, {headers: new Headers()})
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(apiClient.fetchJson(path, true)).rejects.toEqual(error)
  })

  it('Rejects with error if fetch fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(apiClient.fetchJson(path, true)).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    fetch.mockResponseOnce('', errorResponse)
    await expect(apiClient.fetchJson(path, true)).rejects.toEqual(expectedError)
  })
})

describe('postJson', () => {
  const json = {
    'payload': 1
  }

  it('Resolves on success', async () => {
    setUpSuccessResponse('')

    await expect(apiClient.postJson(path, json)).resolves.toBeUndefined()
  })

  it('Makes a post request with given parameters', async () => {
    setUpSuccessResponse('')

    await apiClient.postJson(path, json)

    const expectedHeaders = new Headers({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8'
    })
    expect(fetch).toBeCalledWith(expectedUrl, {body: JSON.stringify(json), headers: expectedHeaders, method: 'POST'})
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(apiClient.postJson(path, json)).rejects.toEqual(error)
  })

  it('Rejects with error if post fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(apiClient.postJson(path, json)).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    fetch.mockResponseOnce('', errorResponse)
    await expect(apiClient.postJson(path, json)).rejects.toEqual(expectedError)
  })
})

describe('fetchBlob', () => {
  it('Resolves to dataURI', async () => {
    setUpSuccessResponse()

    const blob = new Blob([JSON.stringify(result)])
    expect(apiClient.fetchBlob(path)).resolves.toEqual(blob)
  })

  it('Makes a request with given parameters', async () => {
    setUpSuccessResponse()

    await apiClient.fetchBlob(path)

    const expectedHeaders = new Headers({'Authorization': `Bearer ${accessToken}`})
    expect(fetch).toBeCalledWith(expectedUrl, {headers: expectedHeaders})
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(apiClient.fetchBlob(path)).rejects.toEqual(error)
  })

  it('Rejects with error if fetch fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(apiClient.fetchBlob(path)).rejects.toEqual(error)
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
