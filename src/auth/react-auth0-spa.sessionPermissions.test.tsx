import React from 'react'
import { render, screen } from '@testing-library/react'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { createAuth0Client } from '@auth0/auth0-spa-js'
import * as jwtDecode from 'jwt-decode'
import {
  createDefaultAuth0ClientMock,
  defaultProviderProps,
  setupAuth0ProviderTest,
  createMockDecodedToken,
  PermissionProbe,
} from 'auth/react-auth0-spa.provider.testSupport'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

jest.mock('jwt-decode')

describe('Auth0Provider', () => {
  setupAuth0ProviderTest()

  describe('Token decoding and session creation', () => {
    test('falls back to scope claim when permissions is missing', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          scope: 'write:bibliography',
          permissions: undefined,
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-write-bibliography')

      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'true',
      )
    })

    test('uses basic guest permissions when both permissions and scope are missing', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue({
        aud: 'ebl-backend',
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-read-words')

      expect(screen.getByTestId('can-read-words')).toHaveTextContent('true')
      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'false',
      )
    })

    test('flips MemorySession behavior when write bibliography permission is present', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: ['write:bibliography'],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-write-bibliography')

      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'true',
      )
    })

    test('keeps MemorySession write bibliography disabled when permission is absent', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: ['read:bibliography'],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-write-bibliography')

      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'false',
      )
    })
  })

  describe('Complete authentication lifecycle', () => {
    test('completes full authentication pipeline with user permissions', async () => {
      const authUser = { name: 'Jane Doe', email: 'jane@example.com' }
      const permissions = [
        'read:words',
        'write:fragments',
        'lemmatize:fragments',
      ]
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue(authUser),
        getTokenSilently: jest.fn().mockResolvedValue('access-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({ permissions }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>protected-content</div>
        </Auth0Provider>,
      )

      await screen.findByText('protected-content')

      expect(auth0ClientMock.isAuthenticated).toHaveBeenCalled()
      expect(auth0ClientMock.getUser).toHaveBeenCalled()
      expect(auth0ClientMock.getTokenSilently).toHaveBeenCalled()
      expect(jwtDecode.default).toHaveBeenCalledWith('access-token')
    })

    test('provides guest session when user is not authenticated', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <PermissionProbe />
        </Auth0Provider>,
      )

      await screen.findByTestId('can-read-words')

      expect(auth0ClientMock.isAuthenticated).toHaveBeenCalled()
      expect(auth0ClientMock.getUser).not.toHaveBeenCalled()
      expect(auth0ClientMock.getTokenSilently).not.toHaveBeenCalled()
      expect(screen.getByTestId('can-read-words')).toHaveTextContent('true')
      expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
        'false',
      )
    })
  })
})
