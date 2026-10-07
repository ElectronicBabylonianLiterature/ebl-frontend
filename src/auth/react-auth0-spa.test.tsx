import React from 'react'
import { render, screen } from '@testing-library/react'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { createAuth0Client } from '@auth0/auth0-spa-js'
import * as jwtDecode from 'jwt-decode'
import { createMockAuth0Client } from 'auth/react-auth0-spa.testSupport'
import {
  setUpAuth0ProviderTest,
  defaultProviderProps,
  createMockDecodedToken,
  PermissionProbe,
} from 'auth/react-auth0-spa.provider.testSupport'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

jest.mock('jwt-decode')

describe('Auth0Provider', () => {
  beforeEach(setUpAuth0ProviderTest)

  describe('initialization', () => {
    test('initializes Auth0 client once per mount', async () => {
      ;(createAuth0Client as jest.Mock).mockResolvedValue(
        createMockAuth0Client(),
      )

      const { rerender } = render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')
      expect(createAuth0Client).toHaveBeenCalledTimes(1)

      rerender(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      expect(createAuth0Client).toHaveBeenCalledTimes(1)
    })

    test('passes initOptions to createAuth0Client', async () => {
      ;(createAuth0Client as jest.Mock).mockResolvedValue(
        createMockAuth0Client(),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(createAuth0Client).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          clientId: 'client-id',
          authorizationParams: {
            redirectUri: 'http://localhost',
          },
        }),
      )
    })

    test('displays loading spinner while authenticating', () => {
      ;(createAuth0Client as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      expect(screen.queryByText('child')).not.toBeInTheDocument()
    })

    test('renders children when authentication completes', async () => {
      ;(createAuth0Client as jest.Mock).mockResolvedValue(
        createMockAuth0Client(),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child content</div>
        </Auth0Provider>,
      )

      await screen.findByText('child content')
      expect(screen.getByText('child content')).toBeInTheDocument()
    })
  })

  describe('Authenticated user authentication flow', () => {
    test('creates authenticated service when isAuthenticated returns true', async () => {
      const authUser = { name: 'John Doe', email: 'john@example.com' }
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue(authUser),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.isAuthenticated).toHaveBeenCalled()
      expect(auth0ClientMock.getUser).toHaveBeenCalled()
      expect(auth0ClientMock.getTokenSilently).toHaveBeenCalled()
    })

    test('retrieves and decodes access token when user is authenticated', async () => {
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test' }),
        getTokenSilently: jest.fn().mockResolvedValue('access-token-123'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.getTokenSilently).toHaveBeenCalled()
    })

    test('skips token retrieval when user is not authenticated', async () => {
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(false),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(auth0ClientMock.getTokenSilently).not.toHaveBeenCalled()
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
      const auth0ClientMock = createMockAuth0Client({
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
      const auth0ClientMock = createMockAuth0Client({
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
