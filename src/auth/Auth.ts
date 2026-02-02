import React, { useContext } from 'react'
import _ from 'lodash'
import { guestSession, Session } from 'auth/Session'

import applicationScopes from './applicationScopes.json'

export const eblNameProperty = 'https://ebabylon.org/eblName'

const defaultScopes = ['openid', 'profile']
export const scopeString = defaultScopes
  .concat(_.values(applicationScopes))
  .join(' ')

export interface User {
  [eblNameProperty]?: string
  name?: string
}

export interface AuthenticationService {
  login(): void
  logout(): void
  getSession(): Session
  isAuthenticated(): boolean
  getAccessToken(): Promise<string>
  getUser(): User
}

const defaultAuthenticationService: AuthenticationService = {
  login: _.noop,
  logout: _.noop,
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
