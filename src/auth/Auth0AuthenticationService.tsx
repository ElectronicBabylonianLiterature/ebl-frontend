import { Auth0Client } from '@auth0/auth0-spa-js'
import { Session, guestSession } from 'auth/Session'
import { AuthenticationService, User } from 'auth/Auth'

export default class Auth0AuthenticationService
  implements AuthenticationService {
  private readonly auth0Client: Auth0Client
  private readonly user: User
  private readonly session: Session
  private readonly returnTo: string
  private readonly _isAuthenticated: boolean

  constructor(
    auth0Client: Auth0Client,
    returnTo: string,
    isAuthenticated = false,
    user: User = {},
    session: Session = guestSession
  ) {
    this.auth0Client = auth0Client
    this.user = user
    this.session = session
    this.returnTo = returnTo
    this._isAuthenticated = isAuthenticated
  }
  login(): void {
    this.auth0Client.loginWithRedirect({
      appState: { targetUrl: window.location.pathname }
    })
  }
  logout(): void {
    this.auth0Client.logout({
      returnTo: this.returnTo
    })
  }
  getSession(): Session {
    return this.session
  }
  isAuthenticated(): boolean {
    return this._isAuthenticated
  }
  getAccessToken(): Promise<string> {
    return this.auth0Client.getTokenSilently()
  }
  getUser(): User {
    return this.user
  }
}
