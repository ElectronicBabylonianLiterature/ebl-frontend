import {
  expectGuestFallbackOnSessionFailure,
  expectTokenValidatedOnRender,
  provideAuth0Client,
  renderAndWaitForLabel,
  resetAuth0Mocks,
} from 'auth/react-auth0-spa.testSupport'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

describe('Security: session fallback', () => {
  beforeEach(resetAuth0Mocks)

  describe('Expired Token Handling', () => {
    it.each([['Login required'], ['Consent required']])(
      'should fall back to guest session when the token fails with "%s"',
      async (tokenError: string) => {
        await expectTokenValidatedOnRender('Test', {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
          getTokenSilently: jest.fn().mockRejectedValue(new Error(tokenError)),
        })
      },
    )

    it('should handle corrupted token by falling back to guest session', async () => {
      provideAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockRejectedValue(new Error('Invalid token')),
      })

      await renderAndWaitForLabel('Test')
    })
  })

  describe('Session Check Failure Handling', () => {
    it('should gracefully handle checkSession() failures', async () => {
      const mockClient = await expectGuestFallbackOnSessionFailure(
        'Test',
        new Error('Network error'),
      )

      expect(mockClient.checkSession).toHaveBeenCalled()
    })

    it('should create guest session when checkSession() fails', async () => {
      const mockClient = await expectGuestFallbackOnSessionFailure(
        'Loaded',
        new Error('Session expired'),
      )

      expect(mockClient.isAuthenticated).toHaveBeenCalled()
    })
  })
})
