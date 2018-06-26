import HttpClient from './HttpClient'

const url = 'http://example.com'
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

    expect(httpClient.fetchJson(url)).resolves.toEqual(result)
  })

  it('Makes a request with given parameters', async () => {
    auth.getAccessToken.mockReturnValueOnce(accessToken)
    fetch.mockResponseOnce(JSON.stringify(result))

    await httpClient.fetchJson(url)

    const expectedHeaders = new Headers({'Authorization': `Bearer ${accessToken}`})
    expect(fetch).toBeCalledWith(url, {headers: expectedHeaders})
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(httpClient.fetchJson(url)).rejects.toEqual(error)
  })

  it('Rejects with error if fetch fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(httpClient.fetchJson(url)).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    const statusText = 'NOT FOUND'
    fetch.mockResponseOnce('', {status: 404, statusText: statusText})
    await expect(httpClient.fetchJson(url)).rejects.toEqual(new Error(statusText))
  })
})

describe('postJson', () => {
  const json = {
    'payload': 1
  }

  it('Resolves on success', async () => {
    auth.getAccessToken.mockReturnValueOnce(accessToken)
    fetch.mockResponseOnce('')

    await expect(httpClient.postJson(url, json)).resolves.toBeUndefined()
  })

  it('Makes a post request with given parameters', async () => {
    auth.getAccessToken.mockReturnValueOnce(accessToken)
    fetch.mockResponseOnce('')

    await httpClient.postJson(url, json)

    const expectedHeaders = new Headers({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8'
    })
    expect(fetch).toBeCalledWith(url, {body: JSON.stringify(json), headers: expectedHeaders})
  })

  it('Rejects with error if not authorized', async () => {
    auth.getAccessToken.mockImplementationOnce(() => { throw error })

    await expect(httpClient.postJson(url, json)).rejects.toEqual(error)
  })

  it('Rejects with error if post fails', async () => {
    fetch.mockRejectOnce(error)

    await expect(httpClient.postJson(url, json)).rejects.toEqual(error)
  })

  it('Rejects with status text as error message if response not ok', async () => {
    const statusText = 'NOT FOUND'
    fetch.mockResponseOnce('', {status: 404, statusText: statusText})
    await expect(httpClient.postJson(url, json)).rejects.toEqual(new Error(statusText))
  })
})
