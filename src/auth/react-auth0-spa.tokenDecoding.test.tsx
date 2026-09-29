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
} from 'auth/react-auth0-spa.provider.testSupport'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

jest.mock('jwt-decode')

describe('Auth0Provider', () => {
  setupAuth0ProviderTest()

  describe('Token decoding and session creation', () => {
    test('extracts permissions array from decoded token and creates session successfully', async () => {
      const auth0ClientMock = createDefaultAuth0ClientMock({
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
      const auth0ClientMock = createDefaultAuth0ClientMock({
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
      const auth0ClientMock = createDefaultAuth0ClientMock({
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
      const auth0ClientMock = createDefaultAuth0ClientMock({
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
      const auth0ClientMock = createDefaultAuth0ClientMock({
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
  })
})
