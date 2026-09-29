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

  describe('isAuthenticated', () => {
    test('returns true when authenticated', () => {
      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      expect(authService.isAuthenticated()).toBe(true)
    })

    test('returns false when not authenticated', () => {
      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        false,
        {},
        guestSession,
      )

      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('getSession', () => {
    test('returns correct session', () => {
      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      expect(authService.getSession()).toBe(testSession)
    })
  })

  describe('getUser', () => {
    test('returns correct user', () => {
      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      expect(authService.getUser()).toBe(testUser)
    })

    test('returns empty user object when not authenticated', () => {
      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        false,
        {},
        guestSession,
      )

      expect(authService.getUser()).toEqual({})
    })
  })

  describe('login', () => {
    test('calls loginWithRedirect with current pathname', () => {
      const originalPathname = window.location.pathname
      Object.defineProperty(window, 'location', {
        value: { pathname: '/test-path' },
        writable: true,
      })

      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        false,
        {},
        guestSession,
      )

      authService.login()

      expect(mockAuth0Client.loginWithRedirect).toHaveBeenCalledWith({
        appState: { targetUrl: '/test-path' },
      })

      Object.defineProperty(window, 'location', {
        value: { pathname: originalPathname },
        writable: true,
      })
    })
  })

  describe('logout', () => {
    test('calls auth0Client logout with returnTo parameter', () => {
      authService = new Auth0AuthenticationService(
        mockAuth0Client,
        returnTo,
        true,
        testUser,
        testSession,
      )

      authService.logout()

      expect(mockAuth0Client.logout).toHaveBeenCalledWith({
        logoutParams: {
          returnTo: returnTo,
        },
      })
    })
  })
})
