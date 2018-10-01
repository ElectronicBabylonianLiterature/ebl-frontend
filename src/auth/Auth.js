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

function setSession (session) {
  localStorage.setItem('access_token', session.accessToken)
  localStorage.setItem('id_token', session.idToken)
  localStorage.setItem('expires_at', JSON.stringify(session.expiresAt))
  localStorage.setItem('scopes', session.scopes.join(' '))
}

function clearSession () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('id_token')
  localStorage.removeItem('expires_at')
  localStorage.removeItem('scopes')
}

function getSession () {
  const expiresAt = localStorage.getItem('expires_at')
  return new Session(
    localStorage.getItem('access_token'),
    localStorage.getItem('id_token'),
    expiresAt && JSON.parse(expiresAt),
    (localStorage.getItem('scopes') || '').split(' ')
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

  login () {
    this.auth0.authorize()
  }

  handleAuthentication () {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) {
          reject(err)
        } else {
          setSession(new Session(
            authResult.accessToken,
            authResult.idToken,
            (1000 * authResult.expiresIn) + new Date().getTime(),
            (authResult.scope || scopeString).split(' ')
          ))
          resolve()
        }
      })
    })
  }

  logout () {
    clearSession()
    this.auth0.logout({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: process.env.REACT_APP_AUTH0_RETURN_TO
    })
  }

  isAuthenticated () {
    return getSession().isAuthenticated()
  }

  getAccessToken () {
    const accessToken = getSession().accessToken

    if (!accessToken) {
      throw new Error('No access token found')
    }

    return accessToken
  }

  isAllowedToReadWords () {
    const scope = applicationScopes.readWords
    return getSession().hasScope(scope)
  }

  isAllowedToWriteWords () {
    const scope = applicationScopes.writeWords
    return getSession().hasScope(scope)
  }

  isAllowedToReadFragments () {
    const scope = applicationScopes.readFragments
    return getSession().hasScope(scope)
  }

  isAllowedToTransliterateFragments () {
    const scope = applicationScopes.transliterateFragments
    return getSession().hasScope(scope)
  }
}

export default Auth
