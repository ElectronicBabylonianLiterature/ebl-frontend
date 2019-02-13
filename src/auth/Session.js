import applicationScopes from './applicationScopes.json'
import { Set } from 'immutable'

class Session {
  constructor (accessToken, idToken, expiresAt, scopes) {
    this.accessToken = accessToken
    this.idToken = idToken
    this.expiresAt = expiresAt
    this.scopes = Set(scopes)
    Object.freeze(this)
  }

  isAuthenticated () {
    return new Date().getTime() < this.expiresAt
  }

  getAccessToken () {
    if (this.accessToken) {
      return this.accessToken
    } else {
      throw new Error('No access token')
    }
  }

  hasScope (scope) {
    return this.isAuthenticated() && this.scopes.has(scope)
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
