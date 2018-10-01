import auth0 from 'auth0-js'
import _ from 'lodash'

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

function setSession (authResult) {
  const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime())
  localStorage.setItem('access_token', authResult.accessToken)
  localStorage.setItem('id_token', authResult.idToken)
  localStorage.setItem('expires_at', expiresAt)
  localStorage.setItem('scopes', authResult.scope || scopeString)
}

function clearSession () {
  localStorage.removeItem('access_token')
  localStorage.removeItem('id_token')
  localStorage.removeItem('expires_at')
  localStorage.removeItem('scopes')
}

function getSession () {
  const expiresAt = localStorage.getItem('expires_at')
  return {
    access_token: localStorage.getItem('access_token'),
    id_token: localStorage.getItem('id_token'),
    expires_at: expiresAt && JSON.parse(expiresAt),
    scopes: (localStorage.getItem('scopes') || '').split(' ')
  }
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
          setSession(authResult)
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
    return new Date().getTime() < getSession().expires_at
  }

  getAccessToken () {
    const accessToken = getSession().access_token

    if (!accessToken) {
      throw new Error('No access token found')
    }

    return accessToken
  }

  hasScope (scope) {
    return this.isAuthenticated() && getSession().scopes.includes(scope)
  }

  isAllowedToReadWords () {
    const scope = applicationScopes.readWords
    return this.hasScope(scope)
  }

  isAllowedToWriteWords () {
    const scope = applicationScopes.writeWords
    return this.hasScope(scope)
  }

  isAllowedToReadFragments () {
    const scope = applicationScopes.readFragments
    return this.hasScope(scope)
  }

  isAllowedToTransliterateFragments () {
    const scope = applicationScopes.transliterateFragments
    return this.hasScope(scope)
  }
}

export default Auth
