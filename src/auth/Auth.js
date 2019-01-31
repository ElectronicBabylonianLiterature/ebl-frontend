import auth0 from 'auth0-js'
import _ from 'lodash'
import Promise from 'bluebird'
import Session from './Session'
import applicationScopes from './applicationScopes.json'

const scopes = [
  'openid',
  'profile'
]

const scopeString = scopes.concat(_.values(applicationScopes)).join(' ')

function createSession (authResult) {
  return new Session(
    authResult.accessToken,
    authResult.idToken,
    (1000 * authResult.expiresIn) + new Date().getTime(),
    (authResult.scope || scopeString).split(' ')
  )
}

class Auth {
  auth0 = new auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
    redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
    audience: 'dictionary-api',
    responseType: 'token id_token',
    scope: scopeString
  })

  constructor (sessionStore) {
    this.sessionStore = sessionStore
  }

  login () {
    this.auth0.authorize()
  }

  handleAuthentication () {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(err.error))
        } else {
          const session = createSession(authResult)
          this.sessionStore.setSession(session)
          resolve()
        }
      })
    })
  }

  logout () {
    this.sessionStore.clearSession()
    this.auth0.logout({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: process.env.REACT_APP_AUTH0_RETURN_TO
    })
  }

  getSession () {
    return this.sessionStore.getSession()
  }

  isAuthenticated () {
    return this.sessionStore.getSession().isAuthenticated()
  }

  getAccessToken () {
    return this.sessionStore.getSession().accessToken
  }

  isAllowedToReadWords () {
    return this.hasScope('isAllowedToReadWords')
  }

  isAllowedToWriteWords () {
    return this.hasScope('isAllowedToWriteWords')
  }

  isAllowedToReadFragments () {
    return this.hasScope('isAllowedToReadFragments')
  }

  isAllowedToTransliterateFragments () {
    return this.hasScope('isAllowedToTransliterateFragments')
  }

  isAllowedToLemmatizeFragments () {
    return this.hasScope('isAllowedToLemmatizeFragments')
  }

  hasBetaAccess () {
    return this.hasScope('hasBetaAccess')
  }

  hasScope (method) {
    return this.sessionStore.getSession()[method]()
  }
}

export default Auth
