import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import * as auth0 from '@auth0/auth0-spa-js'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { Auth0ClientApi } from 'auth/Auth0AuthenticationService'
import { expectConsoleErrors, expectConsoleWarnings } from 'setupTests'

export const guestFallbackWarning =
  'Session check failed, falling back to guest:'

export function createMockAuth0Client(
  overrides: Partial<jest.Mocked<Auth0ClientApi>> = {},
): jest.Mocked<Auth0ClientApi> {
  return {
    getTokenSilently: jest.fn(),
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn().mockResolvedValue(false),
    getUser: jest.fn(),
    handleRedirectCallback: jest.fn(),
    checkSession: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

export function mockedCreateAuth0Client(): jest.SpyInstance<
  Promise<Auth0ClientApi>,
  [auth0.Auth0ClientOptions]
> {
  return jest.spyOn(auth0, 'createAuth0Client')
}

export function resetAuth0Mocks(): void {
  jest.clearAllMocks()
  localStorage.clear()
}

export function provideAuth0Client(
  overrides: Partial<jest.Mocked<Auth0ClientApi>>,
): jest.Mocked<Auth0ClientApi> {
  const mockClient = createMockAuth0Client(overrides)
  mockedCreateAuth0Client().mockResolvedValue(mockClient)
  return mockClient
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

export function unsignedAccessToken(payload: Record<string, unknown>): string {
  const encode = (part: Record<string, unknown>): string =>
    btoa(JSON.stringify(part))
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.`
}

export function expectSessionCreationFailure(): jest.SpyInstance {
  return expectConsoleErrors(/^Failed to create authenticated session:/)
}

export async function renderAndWaitForLabel(label: string): Promise<void> {
  renderWithAuth0Provider(label)

  await waitFor(() => {
    expect(screen.getByText(label)).toBeInTheDocument()
  })
}

export async function expectTokenValidatedOnRender(
  label: string,
  overrides: Partial<jest.Mocked<Auth0ClientApi>>,
): Promise<jest.Mocked<Auth0ClientApi>> {
  const mockClient = provideAuth0Client(overrides)

  await renderAndWaitForLabel(label)

  expect(mockClient.getTokenSilently).toHaveBeenCalled()
  return mockClient
}

export async function expectGuestFallbackOnSessionFailure(
  label: string,
  sessionError: Error,
): Promise<jest.Mocked<Auth0ClientApi>> {
  const mockClient = provideAuth0Client({
    checkSession: jest.fn().mockRejectedValue(sessionError),
    isAuthenticated: jest.fn().mockResolvedValue(false),
  })
  const consoleWarn = expectConsoleWarnings(
    /^Session check failed, falling back to guest:/,
  )

  await renderAndWaitForLabel(label)

  expect(consoleWarn).toHaveBeenCalledWith(guestFallbackWarning, sessionError)
  return mockClient
}
