import { Auth0Client } from '@auth0/auth0-spa-js'
import { Session, guestSession } from 'auth/Session'
import { AuthenticationService, User } from 'auth/Auth'

export default class Auth0AuthenticationService implements AuthenticationService {
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
    session: Session = guestSession,
  ) {
    this.auth0Client = auth0Client
    this.user = user
    this.session = session
    this.returnTo = returnTo
    this._isAuthenticated = isAuthenticated
  }
  login(): void {
    this.auth0Client.loginWithRedirect({
      appState: { targetUrl: window.location.pathname },
    })
  }
  async logout(): Promise<void> {
    await this.auth0Client.logout({
      logoutParams: {
        returnTo: this.returnTo,
      },
    })
  }
  getSession(): Session {
    return this.session
  }
  isAuthenticated(): boolean {
    return this._isAuthenticated
  }
  async getAccessToken(): Promise<string> {
    try {
      return await this.auth0Client.getTokenSilently({
        cacheMode: 'on',
      })
    } catch (error) {
      const err = error as Error
      if (
        err.message &&
        (err.message.includes('Login required') ||
          err.message.includes('Consent required'))
      ) {
        throw new Error('Authentication expired. Please log in again.')
      }
      throw error
    }
  }
  getUser(): User {
    return this.user
  }
}
