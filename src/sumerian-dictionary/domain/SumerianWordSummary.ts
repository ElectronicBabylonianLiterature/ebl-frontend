export type SumerianWordKind = 'all' | 'words' | 'names'
export type SumerianSourceFilter = 'any' | 'attinger' | 'epsd2'

export const sumerianSearchPageSize = 25

export interface SumerianWordQuery {
  readonly query: string
  readonly kind: SumerianWordKind
  readonly source: SumerianSourceFilter
  readonly limit: number
  readonly offset: number
}

export interface SumerianWordSummary {
  readonly id: string
  readonly citationForm: string
  readonly homonym: string
  readonly guideWord: string
  readonly pos: string
  readonly attingerPos: string
  readonly language: string
  readonly cuneiform: string
  readonly frenchSenses: readonly string[]
  readonly englishSenses: readonly string[]
  readonly hasAttinger: boolean
  readonly hasEpsd2: boolean
  readonly epsd2FormCount: number
  readonly akkadianCount: number
  readonly citationCount: number
  readonly compoundCount: number
  readonly crossReferenceCount: number
  readonly hasEmesal: boolean
  readonly attestationCount: number
  readonly matchedAlias: string
}

export interface SumerianSearchResult {
  readonly total: number
  readonly entries: readonly SumerianWordSummary[]
}

export interface SumerianDictionaryStatistics {
  readonly lemmas: number
  readonly attinger: number
  readonly aligned: number
  readonly epsd2Only: number
  readonly properNouns: number
  readonly withAkkadian: number
}
