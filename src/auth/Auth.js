import auth0 from 'auth0-js'
import _ from 'lodash'
import Promise from 'bluebird'
import Session from './Session'

const scopes = [
  'openid',
  'profile'
]

const applicationScopes = {
  readWords: 'read:words',
  writeWords: 'write:words',
  readFragments: 'read:fragments',
  transliterateFragments: 'transliterate:fragments',
  lemmatizeFragments: 'lemmatize:fragments',
  readBibliography: 'read:bibliography',
  writeBiblioGraphy: 'write:bibliography',
  accessBeta: 'access:beta',
  readWglFolios: 'read:WGL-folios',
  readFwgFolios: 'read:FWG-folios',
  readElFolios: 'read:EL-folios',
  readAkgFolios: 'read:AKG-folios',
  readMjgFolios: 'read:MJG-folios'
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

  isAuthenticated () {
    return this.sessionStore.getSession().isAuthenticated()
  }

  getAccessToken () {
    return this.sessionStore.getSession().accessToken
  }

  isAllowedToReadWords () {
    return this.hasScope('readWords')
  }

  isAllowedToWriteWords () {
    return this.hasScope('writeWords')
  }

  isAllowedToReadFragments () {
    return this.hasScope('readFragments')
  }

  isAllowedToTransliterateFragments () {
    return this.hasScope('transliterateFragments')
  }

  isAllowedToLemmatizeFragments () {
    return this.hasScope('lemmatizeFragments')
  }

  hasBetaAccess () {
    return this.hasScope('accessBeta')
  }

  hasScope (applicationScope) {
    const scope = applicationScopes[applicationScope]
    return this.sessionStore.getSession().hasScope(scope)
  }
}

export default Auth
