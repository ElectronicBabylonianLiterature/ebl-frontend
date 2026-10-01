import React from 'react'
import * as jwtDecode from 'jwt-decode'
import { useAuthentication } from 'auth/Auth'

export const defaultProviderProps = {
  domain: 'example.com',
  clientId: 'client-id',
  returnTo: 'http://localhost',
  authorizationParams: {
    redirectUri: 'http://localhost',
  },
}

export function createMockDecodedToken(
  overrides?: Partial<{ scope?: string; aud: string; permissions?: string[] }>,
): { scope?: string; aud: string; permissions?: string[] } {
  return {
    scope: 'openid profile email',
    aud: 'ebl-backend',
    permissions: [],
    ...(overrides || {}),
  }
}

export function PermissionProbe(): JSX.Element {
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

export function setUpAuth0ProviderTest(): void {
  jest.clearAllMocks()
  Object.defineProperty(window, 'history', {
    value: { replaceState: jest.fn() },
    writable: true,
  })
  Object.defineProperty(window, 'location', {
    value: {
      search: '',
      pathname: '/',
    },
    writable: true,
  })
  ;(jwtDecode.default as jest.Mock).mockImplementation(() =>
    createMockDecodedToken(),
  )
}
