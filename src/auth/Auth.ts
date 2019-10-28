import auth0 from 'auth0-js'
import _ from 'lodash'
import Promise from 'bluebird'
import Session from './Session'
import applicationScopes from './applicationScopes.json'

const eblNameProperty = 'https://ebabylon.org/eblName'
const scopes = ['openid', 'profile']

const scopeString = scopes.concat(_.values(applicationScopes)).join(' ')

function createSession(authResult) {
  return new Session(
    authResult.accessToken,
    authResult.idToken,
    1000 * authResult.expiresIn + new Date().getTime(),
    (authResult.scope || scopeString).split(' ')
  )
}

export interface AuthenticationService {
  login(): void
  handleAuthentication(): Promise<void>
  logout(): void
  getSession(): Session
  isAuthenticated(): boolean
  getAccessToken(): string
}

class Auth implements AuthenticationService {
  private readonly config
  private readonly auth0
  private readonly sessionStore
  private readonly errorReporter

  constructor(sessionStore, errorReporter, config) {
    this.config = config
    this.auth0 = new auth0.WebAuth({
      domain: config.domain,
      clientID: config.clientID,
      redirectUri: config.redirectUri,
      audience: config.audience,
      responseType: 'token id_token',
      scope: scopeString
    })
    this.sessionStore = sessionStore
    this.errorReporter = errorReporter
  }

  login() {
    this.auth0.authorize()
  }

  handleAuthentication() {
    return new Promise<void>((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(err.error))
        } else {
          const {
            sub,
            [eblNameProperty]: eblName,
            name
          } = authResult.idTokenPayload
          this.errorReporter.setUser(sub, name, eblName)
          const session = createSession(authResult)
          this.sessionStore.setSession(session)
          resolve()
        }
      })
    })
  }

  logout() {
    this.sessionStore.clearSession()
    this.errorReporter.clearScope()
    this.auth0.logout({
      clientID: this.config.clientID,
      returnTo: this.config.returnTo
    })
  }

  getSession() {
    return this.sessionStore.getSession()
  }

  isAuthenticated() {
    return this.getSession().isAuthenticated()
  }

  getAccessToken() {
    const session = this.getSession()
    if (session.isAuthenticated()) {
      return session.accessToken
    } else {
      throw new Error('Session expired.')
    }
  }
}

export default Auth
