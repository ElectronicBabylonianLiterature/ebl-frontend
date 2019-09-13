import applicationScopes from './applicationScopes.json'

class Session {
  #accessToken
  #idToken
  #expiresAt
  #scopes

  constructor(accessToken, idToken, expiresAt, scopes) {
    this.#accessToken = accessToken
    this.#idToken = idToken
    this.#expiresAt = expiresAt
    this.#scopes = new Set(scopes)
  }

  get accessToken() {
    return this.#accessToken
  }
  get idToken() {
    return this.#idToken
  }
  get expiresAt() {
    return this.#expiresAt
  }
  get scopes() {
    return [...this.#scopes]
  }

  isAuthenticated() {
    return new Date().getTime() < this.expiresAt
  }

  getAccessToken() {
    if (this.accessToken) {
      return this.accessToken
    } else {
      throw new Error('No access token')
    }
  }

  hasScope(scope) {
    return this.isAuthenticated() && this.#scopes.has(scope)
  }

  isAllowedToReadWords() {
    return this.hasApplicationScope('readWords')
  }

  isAllowedToWriteWords() {
    return this.hasApplicationScope('writeWords')
  }

  isAllowedToReadFragments() {
    return this.hasApplicationScope('readFragments')
  }

  isAllowedToTransliterateFragments() {
    return this.hasApplicationScope('transliterateFragments')
  }

  isAllowedToLemmatizeFragments() {
    return this.hasApplicationScope('lemmatizeFragments')
  }

  isAllowedToReadBibliography() {
    return this.hasApplicationScope('readBibliography')
  }

  isAllowedToWriteBibliography() {
    return this.hasApplicationScope('writeBibliography')
  }

  isAllowedToWriteTexts() {
    return this.hasApplicationScope('writeTexts')
  }

  hasBetaAccess() {
    return this.hasApplicationScope('accessBeta')
  }

  hasApplicationScope(applicationScope) {
    const scope = applicationScopes[applicationScope]
    return this.hasScope(scope)
  }
}

export default Session
