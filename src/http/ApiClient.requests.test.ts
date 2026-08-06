import { ApiError } from 'http/ApiClient'
import {
  ApiClientTestContext,
  createApiClientTestContext,
  path,
} from 'http/ApiClient.testSupport'

let context: ApiClientTestContext

beforeEach(() => {
  context = createApiClientTestContext()
})

describe('Request Cancellation', () => {
  test('Forwards the abort signal to fetch', async () => {
    const { apiClient } = context
    fetchMock.mockResponse(JSON.stringify({ data: 'x' }))
    const controller = new AbortController()

    await apiClient.fetchJson(path, true, controller.signal)

    expect(fetch).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    )
  })

  test('The abort signal can be passed to all methods', async () => {
    const { apiClient } = context
    fetchMock.mockResponse(JSON.stringify({ data: 'test' }))
    const controller = new AbortController()

    await apiClient.fetchJson(path, true, controller.signal)
    await apiClient.postJson(path, {}, true, controller.signal)
    await apiClient.fetchBlob(path, true, controller.signal)
    ;(fetch as jest.Mock).mock.calls.forEach(([, options]) => {
      expect(options.signal).toBe(controller.signal)
    })
  })
})

describe('JSON Parsing Edge Cases', () => {
  test('Empty response body with 200 status', async () => {
    const { apiClient } = context
    fetchMock.mockResponseOnce('', { status: 200 })

    await expect(apiClient.fetchJson(path, false)).rejects.toThrow()
  })

  test('Invalid JSON response - parsing error', async () => {
    const { apiClient } = context
    fetchMock.mockResponseOnce('not valid json', { status: 200 })

    await expect(apiClient.fetchJson(path, false)).rejects.toThrow()
  })

  test('201 Created returns null for empty body', async () => {
    const { apiClient } = context
    fetchMock.mockResponseOnce('', { status: 201 })

    await expect(apiClient.postJson(path, {})).resolves.toBeNull()
  })

  test('201 Created returns parsed JSON when body is present', async () => {
    const { apiClient } = context
    const createdPayload = { _id: 'Artax I', lemma: ['Artax'], pos: ['ON'] }
    fetchMock.mockResponseOnce(JSON.stringify(createdPayload), {
      status: 201,
    })

    await expect(apiClient.postJson(path, {})).resolves.toEqual(createdPayload)
  })

  test('204 No Content returns null', async () => {
    const { apiClient } = context
    fetchMock.mockResponseOnce('', { status: 204 })

    await expect(apiClient.postJson(path, {})).resolves.toBeNull()
  })

  test('Nested error descriptions in JSON', async () => {
    const { apiClient } = context
    const errorBody = {
      title: 'Validation Error',
      description: {
        field: 'email',
        errors: ['Invalid format', 'Already exists'],
      },
    }
    fetchMock.mockResponseOnce(JSON.stringify(errorBody), { status: 400 })

    await expect(apiClient.postJson(path, {})).rejects.toMatchObject({
      message: expect.stringContaining('Validation Error'),
    })
  })
})

describe('Blob Handling', () => {
  test('Blob fetch with authentication', async () => {
    const { apiClient } = context
    fetchMock.mockResponseOnce('test data', {
      headers: { 'content-type': 'application/octet-stream' },
    })

    const result = await apiClient.fetchBlob(path, true)
    expect(result.constructor.name).toBe('Blob')
    expect(result.size).toBeGreaterThan(0)
  })

  test('Blob fetch fails with 404', async () => {
    const { apiClient } = context
    fetchMock.mockResponseOnce('', { status: 404 })

    await expect(apiClient.fetchBlob(path, true)).rejects.toMatchObject({
      name: 'ApiError',
    })
  })
})

describe('Concurrent Requests', () => {
  test('Multiple parallel requests all receive responses', async () => {
    const { apiClient } = context
    fetchMock
      .mockResponseOnce(JSON.stringify({ id: 1 }))
      .mockResponseOnce(JSON.stringify({ id: 2 }))
      .mockResponseOnce(JSON.stringify({ id: 3 }))

    const results = await Promise.all([
      apiClient.fetchJson('/resource/1', false),
      apiClient.fetchJson('/resource/2', false),
      apiClient.fetchJson('/resource/3', false),
    ])

    expect(results).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
  })

  test('One failed request does not affect others', async () => {
    const { apiClient } = context
    fetchMock
      .mockResponseOnce(JSON.stringify({ success: true }))
      .mockResponseOnce('', { status: 500 })
      .mockResponseOnce(JSON.stringify({ success: true }))

    const promises = [
      apiClient.fetchJson('/endpoint1', false),
      apiClient.fetchJson('/endpoint2', false),
      apiClient.fetchJson('/endpoint3', false),
    ]

    const results = await Promise.allSettled(promises)

    expect(results[0]).toMatchObject({
      status: 'fulfilled',
      value: { success: true },
    })
    expect(results[1]).toMatchObject({
      status: 'rejected',
      reason: expect.any(ApiError),
    })
    expect(results[2]).toMatchObject({
      status: 'fulfilled',
      value: { success: true },
    })
  })
})
