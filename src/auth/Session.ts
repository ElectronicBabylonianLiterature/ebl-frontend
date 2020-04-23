import applicationScopes from './applicationScopes.json'

export interface Session {
  isAllowedToReadWords(): boolean

  isAllowedToWriteWords(): boolean

  isAllowedToReadFragments(): boolean

  isAllowedToTransliterateFragments(): boolean

  isAllowedToLemmatizeFragments(): boolean

  isAllowedToAnnotateFragments(): boolean

  isAllowedToReadBibliography(): boolean

  isAllowedToWriteBibliography(): boolean

  isAllowedToWriteTexts(): boolean

  hasBetaAccess(): boolean
}

class GuestSession implements Session {
  isAllowedToReadWords(): boolean {
    return false
  }

  isAllowedToWriteWords(): boolean {
    return false
  }

  isAllowedToReadFragments(): boolean {
    return false
  }

  isAllowedToTransliterateFragments(): boolean {
    return false
  }

  isAllowedToLemmatizeFragments(): boolean {
    return false
  }

  isAllowedToAnnotateFragments(): boolean {
    return false
  }

  isAllowedToReadBibliography(): boolean {
    return false
  }

  isAllowedToWriteBibliography(): boolean {
    return false
  }

  isAllowedToWriteTexts(): boolean {
    return false
  }

  hasBetaAccess(): boolean {
    return false
  }
}

export const guestSession = new GuestSession()

export default class MemorySession implements Session {
  private readonly scopes: ReadonlySet<string>

  constructor(scopes: readonly string[]) {
    this.scopes = new Set(scopes)
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
    return this.scopes.has(scope)
  }
}
