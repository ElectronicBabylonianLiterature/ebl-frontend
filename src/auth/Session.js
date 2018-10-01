class Session {
  constructor (accessToken, idToken, expiresAt, scopes) {
    this.accessToken = accessToken
    this.idToken = idToken
    this.expiresAt = expiresAt
    this.scopes = scopes
  }

  isAuthenticated () {
    return new Date().getTime() < this.expiresAt
  }

  hasScope (scope) {
    return this.isAuthenticated() && this.scopes.includes(scope)
  }
}

export default Session
