import { Auth0Client } from '@auth0/auth0-spa-js'
import Auth0AuthenticationService from 'auth/Auth0AuthenticationService'
import { guestSession } from 'auth/Session'
import {
  returnTo,
  testSession,
  testUser,
} from 'auth/Auth0AuthenticationService.testSupport'
import { createMockAuth0Client } from 'auth/react-auth0-spa.testSupport'

describe('Auth0AuthenticationService', () => {
  let mockAuth0Client: jest.Mocked<Auth0Client>
  let authService: Auth0AuthenticationService

  beforeEach(() => {
    mockAuth0Client = createMockAuth0Client({})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAccessToken', () => {
    test('successfully returns access token with cacheMode on', async () => {
      const expectedToken = 'valid-access-token'
      mockAuth0Client.getTokenSilently.mockResolvedValue(expectedToken)

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      const token = await authService.getAccessToken()

      expect(token).toBe(expectedToken)
      expect(mockAuth0Client.getTokenSilently).toHaveBeenCalledWith({
        cacheMode: 'on',
      })
      expect(mockAuth0Client.getTokenSilently).toHaveBeenCalledTimes(1)
    })

    test('throws custom error when login is required', async () => {
      const loginError = new Error('Login required')
      mockAuth0Client.getTokenSilently.mockRejectedValue(loginError)

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      await expect(authService.getAccessToken()).rejects.toThrow(
        'Authentication expired. Please log in again.',
      )
      expect(mockAuth0Client.getTokenSilently).toHaveBeenCalledWith({
        cacheMode: 'on',
      })
    })

    test('throws custom error when consent is required', async () => {
      const consentError = new Error('Consent required')
      mockAuth0Client.getTokenSilently.mockRejectedValue(consentError)

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      await expect(authService.getAccessToken()).rejects.toThrow(
        'Authentication expired. Please log in again.',
      )
      expect(mockAuth0Client.getTokenSilently).toHaveBeenCalledWith({
        cacheMode: 'on',
      })
    })

    test('throws custom error when error message contains login required substring', async () => {
      const loginError = new Error(
        'Error: Login required. Please authenticate again.',
      )
      mockAuth0Client.getTokenSilently.mockRejectedValue(loginError)

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      await expect(authService.getAccessToken()).rejects.toThrow(
        'Authentication expired. Please log in again.',
      )
    })

    test('throws custom error when error message contains consent required substring', async () => {
      const consentError = new Error(
        'Error: Consent required for additional scopes.',
      )
      mockAuth0Client.getTokenSilently.mockRejectedValue(consentError)

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      await expect(authService.getAccessToken()).rejects.toThrow(
        'Authentication expired. Please log in again.',
      )
    })

    test('re-throws original error for other error types', async () => {
      const networkError = new Error('Network failure')
      mockAuth0Client.getTokenSilently.mockRejectedValue(networkError)

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      await expect(authService.getAccessToken()).rejects.toThrow(
        'Network failure',
      )
      expect(mockAuth0Client.getTokenSilently).toHaveBeenCalledWith({
        cacheMode: 'on',
      })
    })

    test('re-throws original error for timeout errors', async () => {
      const timeoutError = new Error('Timeout error')
      mockAuth0Client.getTokenSilently.mockRejectedValue(timeoutError)

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      await expect(authService.getAccessToken()).rejects.toThrow(
        'Timeout error',
      )
    })

    test('handles non-Error objects thrown from auth0Client', async () => {
      const stringError = 'Something went wrong'
      mockAuth0Client.getTokenSilently.mockRejectedValue(stringError)

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

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
      expect(mockAuth0Client.getTokenSilently).toHaveBeenCalledWith({
        cacheMode: 'on',
      })
    })
  })
})
