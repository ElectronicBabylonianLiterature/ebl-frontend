import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { createAuth0Client } from '@auth0/auth0-spa-js'
import { expectConsoleWarnings } from 'setupTests'
import {
  createMockAuth0Client,
  expectSessionCreationFailure,
} from 'auth/react-auth0-spa.testSupport'
import {
  setUpAuth0ProviderTest,
  defaultProviderProps,
} from 'auth/react-auth0-spa.provider.testSupport'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

jest.mock('jwt-decode')

describe('Auth0Provider', () => {
  beforeEach(setUpAuth0ProviderTest)

  describe('Session validation on provider initialization', () => {
    test('validates existing session when provider initializes outside redirect flow', async () => {
      const auth0ClientMock = createMockAuth0Client({
        checkSession: jest.fn().mockResolvedValue(undefined),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      Object.defineProperty(window, 'location', {
        value: { search: '', pathname: '/' },
        writable: true,
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.checkSession).toHaveBeenCalled()
    })

    test('skips session validation when returning from OAuth redirect', async () => {
      const auth0ClientMock = createMockAuth0Client({
        handleRedirectCallback: jest
          .fn()
          .mockResolvedValue({ appState: undefined }),
        checkSession: jest.fn(),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      Object.defineProperty(window, 'location', {
        value: { search: '?code=auth-code&state=state-value', pathname: '/' },
        writable: true,
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.handleRedirectCallback).toHaveBeenCalled()
      expect(auth0ClientMock.checkSession).not.toHaveBeenCalled()
    })

    test('logs warning and continues initialization when session validation fails', async () => {
      const consoleWarnSpy = expectConsoleWarnings(
        /^Session check failed, falling back to guest:/,
      )
      const checkSessionError = new Error('Session check failed')
      const auth0ClientMock = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(checkSessionError),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Session check failed, falling back to guest:',
        checkSessionError,
      )
    })

    test('provides guest access when session validation throws error', async () => {
      const consoleWarnSpy = expectConsoleWarnings(
        /^Session check failed, falling back to guest:/,
      )
      const checkSessionError = new Error('Session check failed')
      const auth0ClientMock = createMockAuth0Client({
        checkSession: jest.fn().mockRejectedValue(checkSessionError),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')
      expect(screen.getByText('child')).toBeInTheDocument()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Session check failed, falling back to guest:',
        checkSessionError,
      )
    })
  })

  describe('Authentication session creation error recovery', () => {
    test('provides guest access when token retrieval fails during authenticated session creation', async () => {
      const consoleErrorSpy = expectSessionCreationFailure()
      const tokenError = new Error('Token expired')
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest.fn().mockRejectedValue(tokenError),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create authenticated session:',
        tokenError,
      )

      expect(screen.getByText('child')).toBeInTheDocument()
    })

    test('logs error details when session creation fails unexpectedly', async () => {
      const consoleErrorSpy = expectSessionCreationFailure()
      const sessionError = new Error('Session creation failed')
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest.fn().mockRejectedValue(sessionError),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create authenticated session:',
        sessionError,
      )
    })

    test('remains functional despite authentication session errors', async () => {
      const consoleErrorSpy = expectSessionCreationFailure()
      const authError = new Error('Auth error')
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest.fn().mockRejectedValue(authError),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div data-testid="protected-content">Protected Area</div>
        </Auth0Provider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create authenticated session:',
        authError,
      )
    })
  })
})
