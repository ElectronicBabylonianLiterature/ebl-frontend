import applicationScopes from './applicationScopes.json'

class Session {
  readonly accessToken: string
  readonly idToken: string
  readonly expiresAt: number
  private readonly _scopes: Set<string>

  constructor(
    accessToken: string,
    idToken: string,
    expiresAt: number,
    scopes: ReadonlyArray<string>
  ) {
    this.accessToken = accessToken
    this.idToken = idToken
    this.expiresAt = expiresAt
    this._scopes = new Set(scopes)
  }

  get scopes(): readonly string[] {
    return Array.from(this._scopes)
  }

  isAuthenticated(): boolean {
    return new Date().getTime() < this.expiresAt
  }

  getAccessToken(): string {
    if (this.accessToken) {
      return this.accessToken
    } else {
      throw new Error('No access token')
    }
  }

  hasScope(scope): boolean {
    return this.isAuthenticated() && this._scopes.has(scope)
  }

  isAllowedToReadWords(): boolean {
    return this.hasApplicationScope('readWords')
  }

  isAllowedToWriteWords(): boolean {
    return this.hasApplicationScope('writeWords')
  }

  isAllowedToReadFragments(): boolean {
    return this.hasApplicationScope('readFragments')
  }

  isAllowedToTransliterateFragments(): boolean {
    return this.hasApplicationScope('transliterateFragments')
  }

  isAllowedToLemmatizeFragments(): boolean {
    return this.hasApplicationScope('lemmatizeFragments')
  }

  isAllowedToAnnotateFragments(): boolean {
    return this.hasApplicationScope('annotateFragments')
  }

  isAllowedToReadBibliography(): boolean {
    return this.hasApplicationScope('readBibliography')
  }

  isAllowedToWriteBibliography(): boolean {
    return this.hasApplicationScope('writeBibliography')
  }

  isAllowedToWriteTexts(): boolean {
    return this.hasApplicationScope('writeTexts')
  }

  hasBetaAccess(): boolean {
    return this.hasApplicationScope('accessBeta')
  }

  private hasApplicationScope(applicationScope: string): boolean {
    const scope = applicationScopes[applicationScope]
    return this.hasScope(scope)
  }
}

export default Session
