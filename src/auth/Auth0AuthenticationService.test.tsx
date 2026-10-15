import Auth0AuthenticationService, {
  Auth0ClientApi,
} from 'auth/Auth0AuthenticationService'
import { Session, guestSession } from 'auth/Session'
import { User } from 'auth/Auth'
import { createMockAuth0Client } from 'auth/react-auth0-spa.testSupport'

describe('Auth0AuthenticationService', () => {
  let mockAuth0Client: jest.Mocked<Auth0ClientApi>
  let authService: Auth0AuthenticationService
  const returnTo = 'http://localhost'
  const testUser: User = { name: 'Test User' }
  const testSession: Session = guestSession

  beforeEach(() => {
    mockAuth0Client = createMockAuth0Client()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  function authenticatedService(): Auth0AuthenticationService {
    return new Auth0AuthenticationService(
      mockAuth0Client,
      returnTo,
      true,
      testUser,
      testSession,
    )
  }

  function expectTokenRequestedWithCache(): void {
    expect(mockAuth0Client.getTokenSilently).toHaveBeenCalledWith({
      cacheMode: 'on',
    })
  }

  describe('getAccessToken', () => {
    test('successfully returns access token with cacheMode on', async () => {
      const expectedToken = 'valid-access-token'
      mockAuth0Client.getTokenSilently.mockResolvedValue(expectedToken)

      authService = authenticatedService()

      const token = await authService.getAccessToken()

      expect(token).toBe(expectedToken)
      expectTokenRequestedWithCache()
      expect(mockAuth0Client.getTokenSilently).toHaveBeenCalledTimes(1)
    })

    test.each([
      ['login is required', 'Login required'],
      ['consent is required', 'Consent required'],
      [
        'error message contains login required substring',
        'Error: Login required. Please authenticate again.',
      ],
      [
        'error message contains consent required substring',
        'Error: Consent required for additional scopes.',
      ],
    ])('throws custom error when %s', async (_case, message) => {
      mockAuth0Client.getTokenSilently.mockRejectedValue(new Error(message))

      authService = authenticatedService()

      await expect(authService.getAccessToken()).rejects.toThrow(
        'Authentication expired. Please log in again.',
      )
      expectTokenRequestedWithCache()
    })

    test.each([
      ['other error types', 'Network failure'],
      ['timeout errors', 'Timeout error'],
    ])('re-throws original error for %s', async (_case, message) => {
      mockAuth0Client.getTokenSilently.mockRejectedValue(new Error(message))

      authService = authenticatedService()

      await expect(authService.getAccessToken()).rejects.toThrow(message)
      expectTokenRequestedWithCache()
    })

    test('handles non-Error objects thrown from auth0Client', async () => {
      const stringError = 'Something went wrong'
      mockAuth0Client.getTokenSilently.mockRejectedValue(stringError)

      authService = authenticatedService()

      await expect(authService.getAccessToken()).rejects.toBe(stringError)
    })

    test('works when user is not authenticated', async () => {
      const expectedToken = 'valid-access-token'
      mockAuth0Client.getTokenSilently.mockResolvedValue(expectedToken)

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        false,
        {},
        guestSession,
      )

      const token = await authService.getAccessToken()

      expect(token).toBe(expectedToken)
      expectTokenRequestedWithCache()
    })
  })
})
