import React from 'react'
import { render, screen } from '@testing-library/react'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { createAuth0Client } from '@auth0/auth0-spa-js'
import {
  createDefaultAuth0ClientMock,
  defaultProviderProps,
  setupAuth0ProviderTest,
} from 'auth/react-auth0-spa.provider.testSupport'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

jest.mock('jwt-decode')

describe('Auth0Provider', () => {
  setupAuth0ProviderTest()

  describe('initialization', () => {
    test('initializes Auth0 client once per mount', async () => {
      ;(createAuth0Client as jest.Mock).mockResolvedValue(
        createDefaultAuth0ClientMock(),
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
        createDefaultAuth0ClientMock(),
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
        createDefaultAuth0ClientMock(),
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
      const auth0ClientMock = createDefaultAuth0ClientMock({
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
      const auth0ClientMock = createDefaultAuth0ClientMock({
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
      const auth0ClientMock = createDefaultAuth0ClientMock({
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
})
