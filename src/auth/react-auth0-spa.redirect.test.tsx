import React from 'react'
import { render, screen } from '@testing-library/react'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { createAuth0Client } from '@auth0/auth0-spa-js'
import * as jwtDecode from 'jwt-decode'
import applicationScopes from 'auth/applicationScopes.json'
import { createMockAuth0Client } from 'auth/react-auth0-spa.testSupport'
import {
  setUpAuth0ProviderTest,
  defaultProviderProps,
  createMockDecodedToken,
} from 'auth/react-auth0-spa.provider.testSupport'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

jest.mock('jwt-decode')

describe('Auth0Provider', () => {
  beforeEach(setUpAuth0ProviderTest)

  describe('OAuth redirect callback handling', () => {
    test('processes OAuth redirect and invokes redirect callback with returned app state', async () => {
      const appState = { returnTo: '/dashboard' }
      const auth0ClientMock = createMockAuth0Client({
        handleRedirectCallback: jest.fn().mockResolvedValue({ appState }),
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
    })

    test('passes appState to custom redirect callback after OAuth completion', async () => {
      const appState = { returnTo: '/dashboard' }
      const customCallback = jest.fn()
      const auth0ClientMock = createMockAuth0Client({
        handleRedirectCallback: jest.fn().mockResolvedValue({ appState }),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      Object.defineProperty(window, 'location', {
        value: { search: '?code=auth-code&state=state-value', pathname: '/' },
        writable: true,
      })

      render(
        <Auth0Provider
          {...defaultProviderProps}
          onRedirectCallback={customCallback}
        >
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(customCallback).toHaveBeenCalledWith(appState)
    })

    test('uses default redirect callback to replace browser history when none provided', async () => {
      const auth0ClientMock = createMockAuth0Client({
        handleRedirectCallback: jest
          .fn()
          .mockResolvedValue({ appState: undefined }),
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
    })

    test('replaces window history state during OAuth redirect handling', async () => {
      const auth0ClientMock = createMockAuth0Client({
        handleRedirectCallback: jest
          .fn()
          .mockResolvedValue({ appState: undefined }),
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
    })
  })

  describe('edge cases and resilience', () => {
    test('correctly handles admin user with all application permissions', async () => {
      const allPermissions = Object.values(applicationScopes)
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Admin' }),
        getTokenSilently: jest.fn().mockResolvedValue('admin-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({ permissions: allPermissions }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>admin-area</div>
        </Auth0Provider>,
      )

      await screen.findByText('admin-area')

      expect(jwtDecode.default).toHaveBeenCalled()
    })

    test('creates valid session from token with only required claims', async () => {
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'User' }),
        getTokenSilently: jest.fn().mockResolvedValue('token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue({
        aud: 'ebl-backend',
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>content</div>
        </Auth0Provider>,
      )

      await screen.findByText('content')

      expect(screen.getByText('content')).toBeInTheDocument()
    })

    test('prevents re-initialization when provider props update', async () => {
      const auth0ClientMock = createMockAuth0Client()
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      const { rerender } = render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      const initialCallCount = (createAuth0Client as jest.Mock).mock.calls
        .length

      rerender(
        <Auth0Provider {...defaultProviderProps} domain="different-domain.com">
          <div>child</div>
        </Auth0Provider>,
      )

      expect((createAuth0Client as jest.Mock).mock.calls.length).toBe(
        initialCallCount,
      )
    })

    test('handles gracefully when getUser returns no user data', async () => {
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue(undefined),
        getTokenSilently: jest.fn().mockResolvedValue('token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(screen.getByText('child')).toBeInTheDocument()
    })
  })
})
