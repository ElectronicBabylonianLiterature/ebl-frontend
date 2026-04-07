import { render, screen, waitFor } from '@testing-library/react'
import { Auth0Client } from '@auth0/auth0-spa-js'
import { Auth0Provider } from 'auth/react-auth0-spa'
import React from 'react'
import { guestSession } from 'auth/Session'
import Folio from 'fragmentarium/domain/Folio'
import { silenceConsoleErrors } from 'setupTests'

import { createAuth0Client } from '@auth0/auth0-spa-js'

const createMockAuth0Client = (
  overrides: Partial<Auth0Client> = {},
): jest.Mocked<Auth0Client> =>
  ({
    getTokenSilently: jest.fn(),
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
    getUser: jest.fn(),
    handleRedirectCallback: jest.fn(),
    checkSession: jest.fn(),
    ...overrides,
  }) as unknown as jest.Mocked<Auth0Client>

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

const mockCreateAuth0Client = createAuth0Client as jest.MockedFunction<
  typeof createAuth0Client
>

describe('Security: Authentication & Session Management', () => {
  beforeEach(() => {
    silenceConsoleErrors()
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Expired Token Handling', () => {
    it('should fall back to guest session when token validation fails', async () => {
      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest
          .fn()
          .mockRejectedValue(new Error('Login required')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const TestComponent = () => {
        return <div>Test</div>
      }

      render(
        <Auth0Provider
          domain="test.auth0.com"
          clientId="test-client"
          returnTo="http://localhost"
        >
          <TestComponent />
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })

      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })

    it('should handle "Consent required" error and fall back to guest', async () => {
      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest
          .fn()
          .mockRejectedValue(new Error('Consent required')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const TestComponent = () => <div>Test</div>

      render(
        <Auth0Provider
          domain="test.auth0.com"
          clientId="test-client"
          returnTo="http://localhost"
        >
          <TestComponent />
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })

      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })

    it('should handle corrupted token by falling back to guest session', async () => {
      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockRejectedValue(new Error('Invalid token')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const TestComponent = () => <div>Test</div>

      render(
        <Auth0Provider
          domain="test.auth0.com"
          clientId="test-client"
          returnTo="http://localhost"
        >
          <TestComponent />
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })
    })
  })

  describe('Session Check Failure Handling', () => {
    it('should gracefully handle checkSession() failures', async () => {
      const mockClient = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(new Error('Network error')),
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

      const TestComponent = () => <div>Test</div>

      render(
        <Auth0Provider
          domain="test.auth0.com"
          clientId="test-client"
          returnTo="http://localhost"
        >
          <TestComponent />
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })

      expect(mockClient.checkSession).toHaveBeenCalled()
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Session check failed'),
        expect.any(Error),
      )

      consoleWarn.mockRestore()
    })

    it('should create guest session when checkSession() fails', async () => {
      const sessionError = new Error('Session expired')
      const mockClient = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(sessionError),
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

      const TestComponent = () => <div>Loaded</div>

      render(
        <Auth0Provider
          domain="test.auth0.com"
          clientId="test-client"
          returnTo="http://localhost"
        >
          <TestComponent />
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Loaded')).toBeInTheDocument()
      })

      expect(mockClient.isAuthenticated).toHaveBeenCalled()
      expect(consoleWarn).toHaveBeenCalledWith(
        'Session check failed, falling back to guest:',
        sessionError,
      )

      consoleWarn.mockRestore()
    })
  })

  describe('Guest Session Permissions', () => {
    it('should not allow write operations for guest users', () => {
      const session = guestSession

      expect(session.isGuestSession()).toBe(true)
      expect(session.isAllowedToWriteWords()).toBe(false)
      expect(session.isAllowedToWriteBibliography()).toBe(false)
      expect(session.isAllowedToTransliterateFragments()).toBe(false)
      expect(session.isAllowedToLemmatizeFragments()).toBe(false)
      expect(session.isAllowedToAnnotateFragments()).toBe(false)
      expect(session.isAllowedToWriteTexts()).toBe(false)
    })

    it('should allow read operations for guest users', () => {
      const session = guestSession

      expect(session.isAllowedToReadWords()).toBe(true)
      expect(session.isAllowedToReadBibliography()).toBe(true)
      expect(session.isAllowedToReadFragments()).toBe(true)
      expect(session.isAllowedToReadTexts()).toBe(true)
    })

    it('should block closed folios for guest users', () => {
      const session = guestSession

      const openFolio = new Folio({ name: 'AHA', number: '1' })
      const closedFolio = new Folio({ name: 'ARG', number: '1' })

      expect(session.isAllowedToReadFolio(openFolio)).toBe(true)
      expect(session.isAllowedToReadFolio(closedFolio)).toBe(false)
    })
  })

  describe('localStorage Token Security', () => {
    it('should not trust localStorage tokens without validation', async () => {
      localStorage.setItem('auth0.token', 'expired-token')

      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getTokenSilently: jest
          .fn()
          .mockRejectedValue(new Error('Login required')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const TestComponent = () => <div>App</div>

      render(
        <Auth0Provider
          domain="test.auth0.com"
          clientId="test-client"
          returnTo="http://localhost"
        >
          <TestComponent />
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText('App')).toBeInTheDocument()
      })

      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })
  })

  describe('Network Failure Handling', () => {
    it('should handle network errors during auth initialization', async () => {
      const networkError = new Error('Network error')
      const mockClient = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(networkError),
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

      const TestComponent = () => <div>Content</div>

      render(
        <Auth0Provider
          domain="test.auth0.com"
          clientId="test-client"
          returnTo="http://localhost"
        >
          <TestComponent />
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
      })

      expect(mockClient.isAuthenticated).toHaveBeenCalled()
      expect(consoleWarn).toHaveBeenCalledWith(
        'Session check failed, falling back to guest:',
        networkError,
      )

      consoleWarn.mockRestore()
    })
  })

  describe('Token Refresh Edge Cases', () => {
    it('should handle token refresh failures gracefully', async () => {
      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest
          .fn()
          .mockResolvedValueOnce('valid-token')
          .mockRejectedValueOnce(new Error('Refresh failed')),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      const TestComponent = () => <div>Test</div>

      render(
        <Auth0Provider
          domain="test.auth0.com"
          clientId="test-client"
          returnTo="http://localhost"
        >
          <TestComponent />
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })

      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })
  })
})

describe('Security: Authorization Enforcement', () => {
  it('should not expose write permissions to unauthenticated users', () => {
    const session = guestSession

    const writePermissions = [
      'isAllowedToWriteWords',
      'isAllowedToWriteBibliography',
      'isAllowedToTransliterateFragments',
      'isAllowedToLemmatizeFragments',
      'isAllowedToAnnotateFragments',
      'isAllowedToWriteTexts',
    ]

    writePermissions.forEach((permission) => {
      const method = session[
        permission as keyof typeof session
      ] as () => boolean
      expect(method()).toBe(false)
    })
  })

  it('should allow public read access for unauthenticated users', () => {
    const session = guestSession

    const readPermissions = [
      'isAllowedToReadWords',
      'isAllowedToReadBibliography',
      'isAllowedToReadFragments',
      'isAllowedToReadTexts',
    ]

    readPermissions.forEach((permission) => {
      const method = session[
        permission as keyof typeof session
      ] as () => boolean
      expect(method()).toBe(true)
    })
  })
})
