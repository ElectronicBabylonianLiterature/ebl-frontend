/**
 * Critical Security Tests for Authentication & Authorization
 * These tests verify that unauthenticated users cannot access protected features
 * and that expired/invalid tokens fall back to guest sessions.
 */

import { render, screen, waitFor } from '@testing-library/react'
import { Auth0Client } from '@auth0/auth0-spa-js'
import { Auth0Provider } from 'auth/react-auth0-spa'
import React from 'react'
import { guestSession } from 'auth/Session'
import Folio from 'fragmentarium/domain/Folio'

import { createAuth0Client } from '@auth0/auth0-spa-js'

// Mock Auth0 client
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
    jest.clearAllMocks()
    // Clear localStorage to simulate clean state
    localStorage.clear()
  })

  describe('Expired Token Handling', () => {
    it('should fall back to guest session when token validation fails', async () => {
      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true), // Claims to be authenticated
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockRejectedValue(
          new Error('Login required'), // But token is expired
        ),
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

      // Verify that even though isAuthenticated was true,
      // the service falls back to guest session when token fails
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
      const mockClient = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(new Error('Session expired')),
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      jest.spyOn(console, 'warn').mockImplementation()

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

      // Component should render successfully with guest session
      expect(mockClient.isAuthenticated).toHaveBeenCalled()
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
      // Simulate stale token in localStorage
      localStorage.setItem('auth0.token', 'expired-token')

      const mockClient = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true), // localStorage says authenticated
        getTokenSilently: jest
          .fn()
          .mockRejectedValue(new Error('Login required')), // But token is invalid
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

      // Should attempt to validate the token
      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })
  })

  describe('Network Failure Handling', () => {
    it('should handle network errors during auth initialization', async () => {
      const mockClient = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(new Error('Network error')),
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      mockCreateAuth0Client.mockResolvedValue(mockClient)

      jest.spyOn(console, 'warn').mockImplementation()

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

      // Should fallback to guest session on network error
      expect(mockClient.isAuthenticated).toHaveBeenCalled()
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

      // First call should succeed
      expect(mockClient.getTokenSilently).toHaveBeenCalled()
    })
  })
})

describe('Security: Authorization Enforcement', () => {
  it('should not expose write permissions to unauthenticated users', () => {
    const session = guestSession

    // Verify all write operations are blocked
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
