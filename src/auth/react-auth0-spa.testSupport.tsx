import React from 'react'
import { render } from '@testing-library/react'
import { Auth0Client } from '@auth0/auth0-spa-js'
import { Auth0Provider } from 'auth/react-auth0-spa'

export function createMockAuth0Client(
  overrides: Partial<Auth0Client>,
): jest.Mocked<Auth0Client> {
  return {
    getTokenSilently: jest.fn(),
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
    getUser: jest.fn(),
    handleRedirectCallback: jest.fn(),
    checkSession: jest.fn(),
    ...overrides,
  } as unknown as jest.Mocked<Auth0Client>
}

export function renderWithAuth0Provider(label: string): void {
  const TestComponent = (): JSX.Element => <div>{label}</div>

  render(
    <Auth0Provider
      domain="test.auth0.com"
      clientId="test-client"
      returnTo="http://localhost"
    >
      <TestComponent />
    </Auth0Provider>,
  )
}
