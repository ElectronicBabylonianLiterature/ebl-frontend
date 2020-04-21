import _ from 'lodash'
import applicationScopes from './applicationScopes.json'
import { Session } from 'auth/Session'

export const eblNameProperty = 'https://ebabylon.org/eblName'
const scopes = ['openid', 'profile']

export const scopeString = scopes.concat(_.values(applicationScopes)).join(' ')
export interface AuthenticationService {
  login(): void
  logout(): void
  getSession(): Session
  isAuthenticated(): boolean
  getAccessToken(): Promise<string>
  getUser(): any
}
