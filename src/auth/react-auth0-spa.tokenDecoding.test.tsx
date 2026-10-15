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

  describe('Token decoding and session creation', () => {
    test('extracts permissions array from decoded token and creates session successfully', async () => {
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: ['read:words', 'write:fragments', 'lemmatize:fragments'],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(jwtDecode.default).toHaveBeenCalledWith('valid-token')
      expect(auth0ClientMock.getTokenSilently).toHaveBeenCalled()
    })

    test('falls back to empty permissions array when permissions claim is undefined', async () => {
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: undefined,
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(jwtDecode.default).toHaveBeenCalledWith('valid-token')
    })

    test('falls back to empty permissions array when permissions claim is null', async () => {
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue({
        scope: 'openid profile email',
        aud: 'ebl-backend',
        permissions: null,
      })

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')
    })

    test('creates valid session with zero permissions', async () => {
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          permissions: [],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')
    })

    test('prefers permissions over scope when both are present', async () => {
      const auth0ClientMock = createMockAuth0Client({
        isAuthenticated: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
        getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
      })
      ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
      ;(jwtDecode.default as jest.Mock).mockReturnValue(
        createMockDecodedToken({
          scope: 'should-be-ignored',
          permissions: ['read:words', 'write:words'],
        }),
      )

      render(
        <Auth0Provider {...defaultProviderProps}>
          <div>child</div>
        </Auth0Provider>,
      )

      await screen.findByText('child')

      expect(jwtDecode.default).toHaveBeenCalledWith('valid-token')
    })

    test('falls back to scope claim when permissions is missing', async () => {
      const auth0ClientMock = createMockAuth0Client({
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
      const auth0ClientMock = createMockAuth0Client({
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

    test.each([
      ['enables', 'write:bibliography', 'true'],
      ['keeps disabled', 'read:bibliography', 'false'],
    ])(
      '%s MemorySession write bibliography with the %s permission',
      async (_behaviour, permission, expected) => {
        const auth0ClientMock = createMockAuth0Client({
          isAuthenticated: jest.fn().mockResolvedValue(true),
          getUser: jest.fn().mockResolvedValue({ name: 'Test User' }),
          getTokenSilently: jest.fn().mockResolvedValue('valid-token'),
        })
        ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
        ;(jwtDecode.default as jest.Mock).mockReturnValue(
          createMockDecodedToken({ permissions: [permission] }),
        )

        render(
          <Auth0Provider {...defaultProviderProps}>
            <PermissionProbe />
          </Auth0Provider>,
        )

        await screen.findByTestId('can-write-bibliography')

        expect(screen.getByTestId('can-write-bibliography')).toHaveTextContent(
          expected,
        )
      },
    )
  })
})
