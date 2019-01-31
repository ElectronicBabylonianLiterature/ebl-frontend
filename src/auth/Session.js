import applicationScopes from './applicationScopes.json'

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

  isAllowedToReadWords () {
    return this.hasApplicationScope('readWords')
  }

  isAllowedToWriteWords () {
    return this.hasApplicationScope('writeWords')
  }

  isAllowedToReadFragments () {
    return this.hasApplicationScope('readFragments')
  }

  isAllowedToTransliterateFragments () {
    return this.hasApplicationScope('transliterateFragments')
  }

  isAllowedToLemmatizeFragments () {
    return this.hasApplicationScope('lemmatizeFragments')
  }

  hasBetaAccess () {
    return this.hasApplicationScope('accessBeta')
  }

  hasApplicationScope (applicationScope) {
    const scope = applicationScopes[applicationScope]
    return this.hasScope(scope)
  }
}

export default Session
