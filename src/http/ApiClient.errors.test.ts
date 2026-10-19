import {
  accessToken,
  ApiClientTestContext,
  createApiClientTestContext,
  path,
} from 'http/ApiClient.testSupport'

let context: ApiClientTestContext

beforeEach(() => {
  context = createApiClientTestContext()
})

describe('HTTP Status Code Handling', () => {
  test('401 Unauthorized - throws ApiError with status info', async () => {
    const { apiClient, errorReporter } = context
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
    const { apiClient, errorReporter } = context
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
    const { apiClient } = context
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
    const { apiClient, errorReporter } = context
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
    const { apiClient } = context
    fetchMock.mockResponseOnce('', { status: 502, statusText: 'Bad Gateway' })

    await expect(apiClient.fetchBlob(path, false)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Bad Gateway',
    })
  })

  test('503 Service Unavailable - temporary failure', async () => {
    const { apiClient } = context
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
    const { apiClient, errorReporter } = context
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

  test('AbortError - thrown when request is cancelled, not reported', async () => {
    const { apiClient, errorReporter } = context
    fetchMock.mockAbortOnce()

    await expect(apiClient.fetchJson(path, true)).rejects.toThrow('aborted')
    expect(errorReporter.captureException).not.toHaveBeenCalled()
  })

  test('Timeout error - network timeout', async () => {
    const { apiClient, errorReporter } = context
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
    const { apiClient, auth, errorReporter } = context
    const authError = new Error('Token expired')
    auth.getAccessToken
      .mockRejectedValueOnce(authError)
      .mockRejectedValueOnce(authError)

    await expect(apiClient.fetchJson(path, true)).rejects.toThrow(
      'Token expired',
    )
    expect(errorReporter.captureException).toHaveBeenCalledWith(
      authError,
      expect.objectContaining({
        event: 'auth_token_error',
        endpoint: path,
      }),
    )
  })

  test('Missing authentication when required - no token available', async () => {
    const { apiClient, auth } = context
    const notAuthError = new Error('Not authenticated')
    auth.getAccessToken
      .mockRejectedValueOnce(notAuthError)
      .mockRejectedValueOnce(notAuthError)

    await expect(apiClient.postJson(path, {})).rejects.toThrow(
      'Not authenticated',
    )
  })

  test('Unauthenticated request succeeds without token', async () => {
    const { apiClient, auth } = context
    fetchMock.mockResponseOnce(JSON.stringify({ public: 'data' }))
    auth.isAuthenticated.mockReturnValue(false)

    await expect(apiClient.fetchJson(path, false)).resolves.toEqual({
      public: 'data',
    })
    expect(auth.getAccessToken).not.toHaveBeenCalled()
  })
})

describe('Header Construction', () => {
  test('Authenticated request includes Authorization header', async () => {
    const { apiClient } = context
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await apiClient.fetchJson(path, true)

    const calls = (fetch as jest.Mock).mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const headers = calls[0][1].headers
    expect(headers.get('Authorization')).toBe(`Bearer ${accessToken}`)
  })

  test('Unauthenticated request omits Authorization header', async () => {
    const { apiClient, auth } = context
    fetchMock.mockResponseOnce(JSON.stringify({}))
    auth.isAuthenticated.mockReturnValue(false)

    await apiClient.fetchJson(path, false)

    const calls = (fetch as jest.Mock).mock.calls
    const headers = calls[calls.length - 1][1].headers
    expect(headers.get('Authorization')).toBeNull()
  })

  test('POST request includes Content-Type header', async () => {
    const { apiClient } = context
    fetchMock.mockResponseOnce('', { status: 201 })

    await apiClient.postJson(path, { data: 'test' })

    const calls = (fetch as jest.Mock).mock.calls
    const headers = calls[calls.length - 1][1].headers
    expect(headers.get('Content-Type')).toBe('application/json; charset=utf-8')
  })
})
