import auth0 from 'auth0-js'
import _ from 'lodash'
import Session from './Session'

const scopes = [
  'openid',
  'profile'
]

const applicationScopes = {
  readWords: 'read:words',
  writeWords: 'write:words',
  readFragments: 'read:fragments',
  transliterateFragments: 'transliterate:fragments'
}

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
          reject(err)
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

  isAuthenticated () {
    return this.sessionStore.getSession().isAuthenticated()
  }

  getAccessToken () {
    return this.sessionStore.getSession().accessToken
  }

  isAllowedToReadWords () {
    const scope = applicationScopes.readWords
    return this.sessionStore.getSession().hasScope(scope)
  }

  isAllowedToWriteWords () {
    const scope = applicationScopes.writeWords
    return this.sessionStore.getSession().hasScope(scope)
  }

  isAllowedToReadFragments () {
    const scope = applicationScopes.readFragments
    return this.sessionStore.getSession().hasScope(scope)
  }

  isAllowedToTransliterateFragments () {
    const scope = applicationScopes.transliterateFragments
    return this.sessionStore.getSession().hasScope(scope)
  }
}

export default Auth
