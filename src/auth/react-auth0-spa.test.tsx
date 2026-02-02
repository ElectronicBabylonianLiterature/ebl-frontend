import React from 'react'
import { render, screen } from '@testing-library/react'
import { Auth0Provider } from './react-auth0-spa'
import { createAuth0Client } from '@auth0/auth0-spa-js'

jest.mock('@auth0/auth0-spa-js', () => ({
  createAuth0Client: jest.fn(),
}))

describe('Auth0Provider', () => {
  const auth0ClientMock = {
    isAuthenticated: jest.fn().mockResolvedValue(false),
    getUser: jest.fn(),
    getTokenSilently: jest.fn(),
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
    handleRedirectCallback: jest.fn(),
  }

  beforeEach(() => {
    ;(createAuth0Client as jest.Mock).mockResolvedValue(auth0ClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('initializes Auth0 client once per mount', async () => {
    const { rerender } = render(
      <Auth0Provider
        domain="example.com"
        clientId="client-id"
        returnTo="http://localhost"
        authorizationParams={{
          // eslint-disable-next-line camelcase
          redirect_uri: 'http://localhost',
        }}
      >
        <div>child</div>
      </Auth0Provider>,
    )

    await screen.findByText('child')
    expect(createAuth0Client).toHaveBeenCalledTimes(1)

    rerender(
      <Auth0Provider
        domain="example.com"
        clientId="client-id"
        returnTo="http://localhost"
        authorizationParams={{
          // eslint-disable-next-line camelcase
          redirect_uri: 'http://localhost',
        }}
      >
        <div>child</div>
      </Auth0Provider>,
    )

    expect(createAuth0Client).toHaveBeenCalledTimes(1)
  })
})
