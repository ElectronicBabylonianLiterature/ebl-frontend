import React from 'react'
import { Auth0Client } from '@auth0/auth0-spa-js'
import * as jwtDecode from 'jwt-decode'
import { useAuthentication } from 'auth/Auth'
import { createMockAuth0Client } from 'auth/react-auth0-spa.testSupport'

export const createDefaultAuth0ClientMock = (
  overrides?: Partial<Auth0Client>,
): jest.Mocked<Auth0Client> =>
  createMockAuth0Client({
    isAuthenticated: jest.fn().mockResolvedValue(false),
    checkSession: jest.fn().mockResolvedValue(undefined),
    ...(overrides || {}),
  })

export const guestFallbackWarningPattern =
  /^Session check failed, falling back to guest:/

export const sessionCreationErrorPattern =
  /^Failed to create authenticated session:/

export const createMockDecodedToken = (
  overrides?: Partial<{ scope?: string; aud: string; permissions?: string[] }>,
) => ({
  scope: 'openid profile email',
  aud: 'ebl-backend',
  permissions: [],
  ...(overrides || {}),
})

export const PermissionProbe = (): JSX.Element => {
  const session = useAuthentication().getSession()

  return (
    <>
      <div data-testid="can-read-words">
        {String(session.isAllowedToReadWords())}
      </div>
      <div data-testid="can-write-bibliography">
        {String(session.isAllowedToWriteBibliography())}
      </div>
    </>
  )
}

export const defaultProviderProps = {
  domain: 'example.com',
  clientId: 'client-id',
  returnTo: 'http://localhost',
  authorizationParams: {
    redirectUri: 'http://localhost',
  },
}

export function setupAuth0ProviderTest(): void {
  Object.defineProperty(window, 'history', {
    value: { replaceState: jest.fn() },
    writable: true,
  })

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        pathname: '/',
      },
      writable: true,
    })
    ;(jwtDecode.default as jest.Mock).mockImplementation(() => {
      return createMockDecodedToken()
    })
  })
}
