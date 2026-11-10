import React, { useContext } from 'react'
import _ from 'lodash'
import { guestSession, Session } from 'auth/Session'

import applicationScopes from 'auth/applicationScopes.json'

export const eblNameProperty = 'https://ebabylon.org/eblName'

const defaultScopes = ['openid', 'profile']

// Scopes that are only requested while the feature using them is enabled.
// auth0-spa-js keys its token cache by the requested scope, so adding a scope
// makes every returning user look logged out once; requesting these only with
// the feature flag on avoids that for deployments that keep media writes off.
// Permission checks (Session) still know every scope in applicationScopes.json.
const mediaUploadScopes: readonly string[] = [
  applicationScopes.uploadFragmentMedia,
  applicationScopes.manageFragmentMedia,
]

export function createScopeString({
  mediaUploadEnabled,
}: {
  mediaUploadEnabled: boolean
}): string {
  const requestedApplicationScopes = _.values(applicationScopes).filter(
    (scope) => mediaUploadEnabled || !mediaUploadScopes.includes(scope),
  )
  return defaultScopes.concat(requestedApplicationScopes).join(' ')
}

export const scopeString = createScopeString({
  mediaUploadEnabled: process.env.REACT_APP_MEDIA_UPLOAD_ENABLED === 'true',
})

export interface User {
  [eblNameProperty]?: string
  name?: string
  sub?: string
}

export interface AuthenticationService {
  login(): void
  logout(): Promise<void>
  getSession(): Session
  isAuthenticated(): boolean
  getAccessToken(): Promise<string>
  getUser(): User
}

const defaultAuthenticationService: AuthenticationService = {
  login: _.noop,
  async logout() {
    return Promise.resolve()
  },
  getSession() {
    return guestSession
  },
  isAuthenticated() {
    return false
  },
  getAccessToken() {
    throw new Error('Not authenticated')
  },
  getUser() {
    throw new Error('Not authenticated')
  },
}

export const AuthenticationContext = React.createContext<AuthenticationService>(
  defaultAuthenticationService,
)

export function useAuthentication(): AuthenticationService {
  return useContext(AuthenticationContext)
}
