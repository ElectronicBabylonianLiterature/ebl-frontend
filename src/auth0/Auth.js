import auth0 from 'auth0-js'

const scopes = [
  'openid',
  'profile',
  'read:words',
  'write:words',
  'read:fragments',
  'transliterate:fragments'
]

class Auth {
  auth0 = new auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
    redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
    audience: 'dictionary-api',
    responseType: 'token id_token',
    scope: scopes.join(' ')
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
          this.setSession(authResult)
          resolve()
        }
      })
    })
  }

  setSession (authResult) {
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime())
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)
    localStorage.setItem('scopes', authResult.scope || scopes.join(' '))
  }

  logout () {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('scopes')
    this.auth0.logout({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: process.env.REACT_APP_AUTH0_RETURN_TO
    })
  }

  isAuthenticated () {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }

  getAccessToken () {
    const accessToken = localStorage.getItem('access_token')

    if (!accessToken) {
      throw new Error('No access token found')
    }

    return accessToken
  }

  isAllowedTo (scope) {
    const scopes = (localStorage.getItem('scopes') || '').split(' ')
    return this.isAuthenticated() && scopes.includes(scope)
  }
}

export default Auth
