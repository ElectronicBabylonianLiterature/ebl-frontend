import {
  expectGuestFallbackOnSessionFailure,
  expectTokenValidatedOnRender,
  resetAuth0Mocks,
} from 'auth/react-auth0-spa.testSupport'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

describe('Security: token handling', () => {
  beforeEach(resetAuth0Mocks)

  describe('localStorage Token Security', () => {
    it('should not trust localStorage tokens without validation', async () => {
      localStorage.setItem('auth0.token', 'expired-token')

      await expectTokenValidatedOnRender('App', {
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getTokenSilently: jest
          .fn()
          .mockRejectedValue(new Error('Login required')),
      })
    })
  })

  describe('Network Failure Handling', () => {
    it('should handle network errors during auth initialization', async () => {
      const mockClient = await expectGuestFallbackOnSessionFailure(
        'Content',
        new Error('Network error'),
      )

      expect(mockClient.isAuthenticated).toHaveBeenCalled()
    })
  })

  describe('Token Refresh Edge Cases', () => {
    it('should handle token refresh failures gracefully', async () => {
      await expectTokenValidatedOnRender('Test', {
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest
          .fn()
          .mockResolvedValueOnce('valid-token')
          .mockRejectedValueOnce(new Error('Refresh failed')),
      })
    })
  })
})
