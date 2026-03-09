/**
 * API Client Security Tests
 * Verify that API calls properly include/exclude auth headers based on context
 */

import ApiClient, { ApiError } from 'http/ApiClient'
import { AuthenticationService } from 'auth/Auth'
import { guestSession } from 'auth/Session'

const mockErrorReporter = {
  captureException: jest.fn(),
}

const createMockAuthService = (
  isAuth: boolean,
  token = 'test-token',
): AuthenticationService => ({
  isAuthenticated: () => isAuth,
  getAccessToken: jest.fn().mockResolvedValue(token),
  getSession: () => guestSession,
  login: jest.fn(),
  logout: jest.fn(),
  getUser: () => ({}),
})

describe('Security: API Client Authorization', () => {
  let originalFetch: typeof global.fetch

  beforeAll(() => {
    originalFetch = global.fetch
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockErrorReporter.captureException.mockClear()
  })

  describe('Authentication Header Injection', () => {
    it('should include Authorization header when authenticate=true', async () => {
      const authService = createMockAuthService(true, 'valid-token')
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      await apiClient.fetchJson('/test-endpoint', true)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.any(Headers),
        }),
      )

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(callHeaders.get('Authorization')).toBe('Bearer valid-token')
    })

    it('should NOT include Authorization when authenticate=false and user not authenticated', async () => {
      const authService = createMockAuthService(false)
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      await apiClient.fetchJson('/public-endpoint', false)

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(callHeaders.get('Authorization')).toBeNull()
    })

    it('should include Authorization when user is authenticated even if authenticate=false', async () => {
      const authService = createMockAuthService(true, 'user-token')
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      // Even though authenticate=false, user is logged in so token should be included
      await apiClient.fetchJson('/endpoint', false)

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(callHeaders.get('Authorization')).toBe('Bearer user-token')
    })

    it('should retry token acquisition on failure', async () => {
      const mockGetToken = jest
        .fn()
        .mockRejectedValueOnce(new Error('Token fetch failed'))
        .mockResolvedValueOnce('retried-token')

      const authService = {
        ...createMockAuthService(true),
        getAccessToken: mockGetToken,
      }

      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      await apiClient.fetchJson('/test', true)

      // Should retry once
      expect(mockGetToken).toHaveBeenCalledTimes(2)
      expect(mockErrorReporter.captureException).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST Request Security', () => {
    it('should default to authenticated for POST requests', async () => {
      const authService = createMockAuthService(true, 'post-token')
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => null,
      } as Response)

      // postJson defaults authenticate to true
      await apiClient.postJson('/create-resource', { data: 'test' })

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(callHeaders.get('Authorization')).toBe('Bearer post-token')
    })

    it('should allow explicit authenticate=false for POST', async () => {
      const authService = createMockAuthService(false)
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => null,
      } as Response)

      await apiClient.postJson('/public-post', { data: 'test' }, false)

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(callHeaders.get('Authorization')).toBeNull()
    })
  })

  describe('Error Handling & Reporting', () => {
    it('should report 401 errors as auth errors', async () => {
      const authService = createMockAuthService(true)
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Unauthorized' }),
      } as Response)

      await expect(apiClient.fetchJson('/protected', true)).rejects.toThrow()

      expect(mockErrorReporter.captureException).toHaveBeenCalledWith(
        expect.any(ApiError),
        expect.objectContaining({
          status: 401,
          authError: true,
        }),
      )
    })

    it('should report 403 errors as auth errors', async () => {
      const authService = createMockAuthService(true)
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Forbidden' }),
      } as Response)

      await expect(apiClient.fetchJson('/admin-only', true)).rejects.toThrow()

      expect(mockErrorReporter.captureException).toHaveBeenCalledWith(
        expect.any(ApiError),
        expect.objectContaining({
          status: 403,
          authError: true,
        }),
      )
    })

    it('should not double-report errors', async () => {
      const authService = createMockAuthService(true)
      const apiClient = new ApiClient(authService, mockErrorReporter)

      const error = new Error('Test error') as Error & { __captured: boolean }
      error.__captured = true

      global.fetch = jest.fn().mockRejectedValue(error)

      await expect(apiClient.fetchJson('/test', true)).rejects.toThrow()

      // Should not capture already-captured errors
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

      // Should retry once (0th attempt + 1 retry = 2 total calls)
      expect(mockGetToken).toHaveBeenCalledTimes(2)
    })
  })

  describe('Security Best Practices', () => {
    it('should not leak tokens in URLs', async () => {
      const authService = createMockAuthService(true, 'secret-token')
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response)

      await apiClient.fetchJson('/endpoint?param=value', true)

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      // Token should be in header, not URL
      expect(url).not.toContain('secret-token')
      expect(url).not.toContain('token=')
      expect(url).not.toContain('Bearer')
    })

    it('should use HTTPS API URL (environment check)', () => {
      const apiUrl = process.env.REACT_APP_DICTIONARY_API_URL

      // In production, this should be HTTPS
      if (process.env.NODE_ENV === 'production' && apiUrl) {
        expect(apiUrl).toMatch(/^https:\/\//)
      }
    })
  })
})

describe('Security: API Error Messages', () => {
  it('should preserve backend error responses (backend responsible for sanitization)', async () => {
    const apiError = await ApiError.fromResponse({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({
        error: 'Database connection failed',
        description: 'Contact administrator',
      }),
    } as Response)

    // Frontend preserves backend error messages
    // Backend is responsible for not leaking sensitive data
    expect(apiError.message).toBeTruthy()
    expect(apiError.status).toBe(500)
  })

  it('should extract description field from error response', async () => {
    const apiError = await ApiError.fromResponse({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        description: 'Invalid parameter: email',
      }),
    } as Response)

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
