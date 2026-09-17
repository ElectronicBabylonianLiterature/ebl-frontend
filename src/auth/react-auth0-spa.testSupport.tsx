import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Auth0Client, createAuth0Client } from '@auth0/auth0-spa-js'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { tolerateConsoleErrors } from 'setupTests'

export const guestFallbackWarning =
  'Session check failed, falling back to guest:'

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

export function mockedCreateAuth0Client(): jest.MockedFunction<
  typeof createAuth0Client
> {
  return createAuth0Client as jest.MockedFunction<typeof createAuth0Client>
}

export function resetAuth0Mocks(): void {
  tolerateConsoleErrors(/Failed to create authenticated session/)
  jest.clearAllMocks()
  localStorage.clear()
}

export function provideAuth0Client(
  overrides: Partial<Auth0Client>,
): jest.Mocked<Auth0Client> {
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

export async function renderAndWaitForLabel(label: string): Promise<void> {
  renderWithAuth0Provider(label)

  await waitFor(() => {
    expect(screen.getByText(label)).toBeInTheDocument()
  })
}

export async function expectTokenValidatedOnRender(
  label: string,
  overrides: Partial<Auth0Client>,
): Promise<jest.Mocked<Auth0Client>> {
  const mockClient = provideAuth0Client(overrides)

  await renderAndWaitForLabel(label)

  expect(mockClient.getTokenSilently).toHaveBeenCalled()
  return mockClient
}

export async function expectGuestFallbackOnSessionFailure(
  label: string,
  sessionError: Error,
): Promise<jest.Mocked<Auth0Client>> {
  const mockClient = provideAuth0Client({
    checkSession: jest.fn().mockRejectedValue(sessionError),
    isAuthenticated: jest.fn().mockResolvedValue(false),
  })
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  await renderAndWaitForLabel(label)

  expect(consoleWarn).toHaveBeenCalledWith(guestFallbackWarning, sessionError)
  consoleWarn.mockRestore()
  return mockClient
}
