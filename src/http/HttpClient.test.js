import HttpClient from './HttpClient'

const path = '/resource'
const expectedUrl = `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
const result = {success: true}
const error = new Error('fake error message')
const accessToken = 'accessToken'

let httpClient
let auth

beforeEach(async () => {
  fetch.resetMocks()

  auth = {getAccessToken: jest.fn()}
  httpClient = new HttpClient(auth)
})

describe('fetchJson', () => {
  it('Resolves to parsed JSON on success', async () => {
    auth.getAccessToken.mockReturnValueOnce(accessToken)
    fetch.mockResponseOnce(JSON.stringify(result))

    expect(httpClient.fetchJson(path)).resolves.toEqual(result)
  })

  it('Makes a request with given parameters', async () => {
    auth.getAccessToken.mockReturnValueOnce(accessToken)
    fetch.mockResponseOnce(JSON.stringify(result))

    await httpClient.fetchJson(path)

    const expectedHeaders = new Headers({'Authorization': `Bearer ${accessToken}`})
    expect(fetch).toBeCalledWith(expectedUrl, {headers: expectedHeaders})
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(httpClient.fetchJson(path)).rejects.toEqual(error)
  })

  it('Rejects with error if fetch fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(httpClient.fetchJson(path)).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    const statusText = 'NOT FOUND'
    fetch.mockResponseOnce('', {status: 404, statusText: statusText})
    await expect(httpClient.fetchJson(path)).rejects.toEqual(new Error(statusText))
  })
})

describe('postJson', () => {
  const json = {
    'payload': 1
  }

  it('Resolves on success', async () => {
    auth.getAccessToken.mockReturnValueOnce(accessToken)
    fetch.mockResponseOnce('')

    await expect(httpClient.postJson(path, json)).resolves.toBeUndefined()
  })

  it('Makes a post request with given parameters', async () => {
    auth.getAccessToken.mockReturnValueOnce(accessToken)
    fetch.mockResponseOnce('')

    await httpClient.postJson(path, json)

    const expectedHeaders = new Headers({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8'
    })
    expect(fetch).toBeCalledWith(expectedUrl, {body: JSON.stringify(json), headers: expectedHeaders, method: 'POST'})
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(httpClient.postJson(path, json)).rejects.toEqual(error)
  })

  it('Rejects with error if post fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(httpClient.postJson(path, json)).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    const statusText = 'NOT FOUND'
    fetch.mockResponseOnce('', {status: 404, statusText: statusText})
    await expect(httpClient.postJson(path, json)).rejects.toEqual(new Error(statusText))
  })
})
