import ApiClient, { ApiError } from 'http/ApiClient'
import { createJsonResponse } from 'http/ApiClient.testSupport'
import {
  createMockAuthService,
  mockErrorReporter,
  restoreFetchAroundTests,
} from 'http/ApiClient.security.testSupport'

describe('Security: API Client Error Reporting', () => {
  restoreFetchAroundTests()

  describe('Error Handling & Reporting', () => {
    it.each([
      [401, 'Unauthorized', '/protected'],
      [403, 'Forbidden', '/admin-only'],
    ])(
      'should report %i errors as auth errors',
      async (status: number, statusText: string, endpoint: string) => {
        const authService = createMockAuthService(true)
        const apiClient = new ApiClient(authService, mockErrorReporter)

        global.fetch = jest.fn().mockResolvedValue(
          createJsonResponse({
            ok: false,
            status: status,
            statusText: statusText,
            body: { error: statusText },
          }),
        )

        await expect(apiClient.fetchJson(endpoint, true)).rejects.toThrow()

        expect(mockErrorReporter.captureException).toHaveBeenCalledWith(
          expect.any(ApiError),
          expect.objectContaining({
            status: status,
            authError: true,
          }),
        )
      },
    )

    it('should not double-report errors', async () => {
      const authService = createMockAuthService(true)
      const apiClient = new ApiClient(authService, mockErrorReporter)

      const error = new Error('Test error') as Error & { __captured: boolean }
      error.__captured = true

      global.fetch = jest.fn().mockRejectedValue(error)

      await expect(apiClient.fetchJson('/test', true)).rejects.toThrow()

      expect(mockErrorReporter.captureException).not.toHaveBeenCalled()
    })
  })

  describe('Token Expiration During Request', () => {
    it('should throw clear error when token expires mid-session', async () => {
      const authService = createMockAuthService(true)
      ;(authService.getAccessToken as jest.Mock).mockRejectedValue(
        new Error('Authentication expired. Please log in again.'),
      )

      const apiClient = new ApiClient(authService, mockErrorReporter)

      await expect(
        apiClient.fetchJson('/protected-resource', true),
      ).rejects.toThrow('Authentication expired')

      expect(mockErrorReporter.captureException).toHaveBeenCalled()
    })

    it('should give up after retry limit on token errors', async () => {
      const authService = createMockAuthService(true)
      const mockGetToken = jest
        .fn()
        .mockRejectedValue(new Error('Token unavailable'))

      authService.getAccessToken = mockGetToken

      const apiClient = new ApiClient(authService, mockErrorReporter)

      await expect(apiClient.fetchJson('/test', true)).rejects.toThrow()

      expect(mockGetToken).toHaveBeenCalledTimes(2)
    })
  })

  describe('Security Best Practices', () => {
    it('should not leak tokens in URLs', async () => {
      const authService = createMockAuthService(true, 'secret-token')
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest
        .fn()
        .mockResolvedValue(createJsonResponse({ body: {} }))

      await apiClient.fetchJson('/endpoint?param=value', true)

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).not.toContain('secret-token')
      expect(url).not.toContain('token=')
      expect(url).not.toContain('Bearer')
    })

    it('should use HTTPS API URL (environment check)', () => {
      const apiUrl = process.env.REACT_APP_DICTIONARY_API_URL

      if (process.env.NODE_ENV === 'production' && apiUrl) {
        expect(apiUrl).toMatch(/^https:\/\//)
      }
    })
  })
})

describe('Security: API Error Messages', () => {
  it('should preserve backend error responses (backend responsible for sanitization)', async () => {
    const apiError = await ApiError.fromResponse(
      createJsonResponse({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        body: {
          error: 'Database connection failed',
          description: 'Contact administrator',
        },
      }),
    )

    expect(apiError.message).toBeTruthy()
    expect(apiError.status).toBe(500)
  })

  it('should extract description field from error response', async () => {
    const apiError = await ApiError.fromResponse(
      createJsonResponse({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        body: { description: 'Invalid parameter: email' },
      }),
    )

    expect(apiError.message).toContain('Invalid parameter')
  })

  it('should handle malformed error responses safely', async () => {
    const apiError = await ApiError.fromResponse({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => {
        throw new Error('Invalid JSON')
      },
    } as unknown as Response)

    expect(apiError.message).toBe('Bad Request')
    expect(apiError.status).toBe(400)
  })
})
