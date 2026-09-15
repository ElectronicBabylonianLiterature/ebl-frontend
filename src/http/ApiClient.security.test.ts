import ApiClient from 'http/ApiClient'
import { createJsonResponse } from 'http/ApiClient.testSupport'
import {
  createMockAuthService,
  mockErrorReporter,
  restoreFetchAroundTests,
} from 'http/ApiClient.security.testSupport'

describe('Security: API Client Authorization', () => {
  restoreFetchAroundTests()

  describe('Authentication Header Injection', () => {
    it('should include Authorization header when authenticate=true', async () => {
      const authService = createMockAuthService(true, 'valid-token')
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest
        .fn()
        .mockResolvedValue(createJsonResponse({ body: { data: 'test' } }))

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

      global.fetch = jest
        .fn()
        .mockResolvedValue(createJsonResponse({ body: { data: 'test' } }))

      await apiClient.fetchJson('/public-endpoint', false)

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(callHeaders.get('Authorization')).toBeNull()
    })

    it('should include Authorization when user is authenticated even if authenticate=false', async () => {
      const authService = createMockAuthService(true, 'user-token')
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest
        .fn()
        .mockResolvedValue(createJsonResponse({ body: { data: 'test' } }))

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

      global.fetch = jest
        .fn()
        .mockResolvedValue(createJsonResponse({ body: { data: 'test' } }))

      await apiClient.fetchJson('/test', true)

      expect(mockGetToken).toHaveBeenCalledTimes(2)
      expect(mockErrorReporter.captureException).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST Request Security', () => {
    it('should default to authenticated for POST requests', async () => {
      const authService = createMockAuthService(true, 'post-token')
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest
        .fn()
        .mockResolvedValue(
          createJsonResponse({ status: 201, statusText: 'Created' }),
        )

      await apiClient.postJson('/create-resource', { data: 'test' })

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(callHeaders.get('Authorization')).toBe('Bearer post-token')
    })

    it('should allow explicit authenticate=false for POST', async () => {
      const authService = createMockAuthService(false)
      const apiClient = new ApiClient(authService, mockErrorReporter)

      global.fetch = jest
        .fn()
        .mockResolvedValue(
          createJsonResponse({ status: 201, statusText: 'Created' }),
        )

      await apiClient.postJson('/public-post', { data: 'test' }, false)

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(callHeaders.get('Authorization')).toBeNull()
    })
  })
})
