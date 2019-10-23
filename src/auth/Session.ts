import applicationScopes from './applicationScopes.json'

class Session {
  readonly accessToken: string
  readonly idToken: string
  readonly expiresAt: number
  private readonly _scopes: Set<string>

  constructor(accessToken: string, idToken: string, expiresAt: number, scopes: ReadonlyArray<string>) {
    this.accessToken = accessToken
    this.idToken = idToken
    this.expiresAt = expiresAt
    this._scopes = new Set(scopes)
  }

  get scopes() {
    return Array.from(this._scopes)
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
    return this.isAuthenticated() && this._scopes.has(scope)
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
