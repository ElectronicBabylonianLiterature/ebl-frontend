import ApiClient, { ApiError } from './ApiClient'
import { AuthenticationService } from 'auth/Auth'

describe('ApiClient - Edge Cases and Error Handling', () => {
  let apiClient: ApiClient
  let auth: jest.Mocked<AuthenticationService>
  let errorReporter: { captureException: jest.Mock }
  const accessToken = 'test-token'
  const path = '/test-endpoint'

  beforeEach(() => {
    fetchMock.resetMocks()
    auth = {
      getAccessToken: jest.fn().mockResolvedValue(accessToken),
      isAuthenticated: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<AuthenticationService>
    errorReporter = { captureException: jest.fn() }
    apiClient = new ApiClient(auth, errorReporter)
  })

  describe('HTTP Status Code Handling', () => {
    test('401 Unauthorized - throws ApiError with status info', async () => {
      const errorBody = { title: 'Unauthorized', description: 'Invalid token' }
      fetchMock.mockResponseOnce(JSON.stringify(errorBody), { status: 401 })

      await expect(apiClient.fetchJson(path, true)).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Invalid token',
        data: errorBody,
      })
      expect(errorReporter.captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ApiError',
          message: 'Invalid token',
        }),
        expect.any(Object),
      )
    })

    test('403 Forbidden - throws ApiError with permissions context', async () => {
      const errorBody = {
        title: 'Forbidden',
        description: {
          message: 'Insufficient permissions',
          scope: 'write:fragments',
        },
      }
      fetchMock.mockResponseOnce(JSON.stringify(errorBody), { status: 403 })

      await expect(apiClient.postJson(path, {})).rejects.toMatchObject({
        name: 'ApiError',
        data: errorBody,
      })
      expect(errorReporter.captureException).toHaveBeenCalled()
    })

    test('404 Not Found - handles non-JSON error response', async () => {
      fetchMock.mockResponseOnce('Page not found', {
        status: 404,
        statusText: 'Not Found',
      })

      await expect(apiClient.fetchJson(path, false)).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Not Found',
        data: {},
      })
    })

    test('500 Internal Server Error - captures stack trace', async () => {
      fetchMock.mockResponseOnce('', {
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(apiClient.fetchJson(path, true)).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Internal Server Error',
      })
      expect(errorReporter.captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ApiError',
          stack: expect.any(String),
        }),
        expect.any(Object),
      )
    })

    test('502 Bad Gateway - network-level error', async () => {
      fetchMock.mockResponseOnce('', { status: 502, statusText: 'Bad Gateway' })

      await expect(apiClient.fetchBlob(path, false)).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Bad Gateway',
      })
    })

    test('503 Service Unavailable - temporary failure', async () => {
      const errorBody = {
        title: 'Service Unavailable',
        description: 'Maintenance mode',
      }
      fetchMock.mockResponseOnce(JSON.stringify(errorBody), { status: 503 })

      await expect(apiClient.putJson(path, {})).rejects.toMatchObject({
        message: 'Maintenance mode',
      })
    })
  })

  describe('Network Errors', () => {
    test('Network failure - throws and reports error', async () => {
      const networkError = new Error('Failed to fetch')
      fetchMock.mockRejectOnce(networkError)

      await expect(apiClient.fetchJson(path, true)).rejects.toThrow(
        'Failed to fetch',
      )
      expect(errorReporter.captureException).toHaveBeenCalledWith(
        networkError,
        expect.any(Object),
      )
    })

    test('AbortError - thrown when request is cancelled', async () => {
      fetchMock.mockAbortOnce()

      await expect(apiClient.fetchJson(path, true)).rejects.toThrow('aborted')
      expect(errorReporter.captureException).toHaveBeenCalled()
    })

    test('Timeout error - network timeout', async () => {
      const timeoutError = new Error('Timeout')
      fetchMock.mockRejectOnce(timeoutError)

      await expect(apiClient.postJson(path, { data: 'test' })).rejects.toThrow(
        'Timeout',
      )
      expect(errorReporter.captureException).toHaveBeenCalled()
    })
  })

  describe('Authentication Errors', () => {
    test('getAccessToken throws - propagates auth error', async () => {
      const authError = new Error('Token expired')
      auth.getAccessToken.mockRejectedValueOnce(authError)

      await expect(apiClient.fetchJson(path, true)).rejects.toThrow(
        'Token expired',
      )
      // Auth errors are captured by ApiClient
      expect(errorReporter.captureException).toHaveBeenCalledWith(
        authError,
        expect.objectContaining({
          event: 'auth_token_error',
          endpoint: path,
        }),
      )
    })

    test('Missing authentication when required - no token available', async () => {
      auth.getAccessToken.mockRejectedValueOnce(new Error('Not authenticated'))

      await expect(apiClient.postJson(path, {})).rejects.toThrow(
        'Not authenticated',
      )
    })

    test('Unauthenticated request succeeds without token', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ public: 'data' }))
      auth.isAuthenticated.mockReturnValue(false)

      await expect(apiClient.fetchJson(path, false)).resolves.toEqual({
        public: 'data',
      })
      expect(auth.getAccessToken).not.toHaveBeenCalled()
    })
  })

  describe('Request Cancellation', () => {
    test('Cancelled promise rejects without completing', () => {
      fetchMock.mockResponseOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ body: 'data' }), 100),
          ),
      )

      const promise = apiClient.fetchJson(path, true)
      promise.cancel()

      // Bluebird cancelled promises throw CancellationError
      expect(promise.isCancelled()).toBe(true)
    })

    test('Request cancellation is available on all methods', () => {
      fetchMock.mockResponse(JSON.stringify({ data: 'test' }))

      const fetchPromise = apiClient.fetchJson(path, true)
      const postPromise = apiClient.postJson(path, {})
      const blobPromise = apiClient.fetchBlob(path, true)

      expect(fetchPromise.cancel).toBeDefined()
      expect(postPromise.cancel).toBeDefined()
      expect(blobPromise.cancel).toBeDefined()
    })
  })

  describe('JSON Parsing Edge Cases', () => {
    test('Empty response body with 200 status', async () => {
      fetchMock.mockResponseOnce('', { status: 200 })

      await expect(apiClient.fetchJson(path, false)).rejects.toThrow()
    })

    test('Invalid JSON response - parsing error', async () => {
      fetchMock.mockResponseOnce('not valid json', { status: 200 })

      await expect(apiClient.fetchJson(path, false)).rejects.toThrow()
    })

    test('201 Created returns null for empty body', async () => {
      fetchMock.mockResponseOnce('', { status: 201 })

      await expect(apiClient.postJson(path, {})).resolves.toBeNull()
    })

    test('204 No Content returns null', async () => {
      fetchMock.mockResponseOnce('', { status: 204 })

      await expect(apiClient.postJson(path, {})).resolves.toBeNull()
    })

    test('Nested error descriptions in JSON', async () => {
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
      fetchMock.mockResponseOnce('test data', {
        headers: { 'content-type': 'application/octet-stream' },
      })

      const result = await apiClient.fetchBlob(path, true)
      expect(result.constructor.name).toBe('Blob')
      expect(result.size).toBeGreaterThan(0)
    })

    test('Blob fetch fails with 404', async () => {
      fetchMock.mockResponseOnce('', { status: 404 })

      await expect(apiClient.fetchBlob(path, true)).rejects.toMatchObject({
        name: 'ApiError',
      })
    })
  })

  describe('Concurrent Requests', () => {
    test('Multiple parallel requests all receive responses', async () => {
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

  describe('Header Construction', () => {
    test('Authenticated request includes Authorization header', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}))

      await apiClient.fetchJson(path, true)

      const calls = (fetch as jest.Mock).mock.calls
      expect(calls.length).toBeGreaterThan(0)
      const headers = calls[0][1].headers
      expect(headers.get('Authorization')).toBe(`Bearer ${accessToken}`)
    })

    test('Unauthenticated request omits Authorization header', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}))
      auth.isAuthenticated.mockReturnValue(false)

      await apiClient.fetchJson(path, false)

      const calls = (fetch as jest.Mock).mock.calls
      const headers = calls[calls.length - 1][1].headers
      expect(headers.get('Authorization')).toBeNull()
    })

    test('POST request includes Content-Type header', async () => {
      fetchMock.mockResponseOnce('', { status: 201 })

      await apiClient.postJson(path, { data: 'test' })

      const calls = (fetch as jest.Mock).mock.calls
      const headers = calls[calls.length - 1][1].headers
      expect(headers.get('Content-Type')).toBe(
        'application/json; charset=utf-8',
      )
    })
  })

  describe('ApiError Construction', () => {
    test('ApiError name is set correctly', () => {
      const error = new ApiError('Test error', { status: 400 })
      expect(error.name).toBe('ApiError')
    })

    test('ApiError preserves stack trace', () => {
      const error = new ApiError('Test error', {})
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('ApiError')
    })

    test('ApiError.fromResponse handles malformed JSON', async () => {
      const response = new Response('not json', {
        status: 400,
        statusText: 'Bad Request',
      })
      const error = await ApiError.fromResponse(response)

      expect(error.message).toBe('Bad Request')
      expect(error.data).toEqual({})
    })

    test('ApiError.bodyToMessage handles string description', () => {
      const message = ApiError.bodyToMessage(
        { description: 'Simple error' },
        'Bad Request',
      )
      expect(message).toBe('Simple error')
    })

    test('ApiError.bodyToMessage handles object description', () => {
      const message = ApiError.bodyToMessage(
        { title: 'Error', description: { code: 'ERR_001' } },
        'Bad Request',
      )
      expect(message).toContain('Error')
      expect(message).toContain('ERR_001')
    })

    test('ApiError.bodyToMessage falls back to JSON stringify', () => {
      const message = ApiError.bodyToMessage({ custom: 'field' }, 'Bad Request')
      expect(message).toBe('{"custom":"field"}')
    })
  })
})
