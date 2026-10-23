export type SumerianSource = 'attinger' | 'epsd2'
export type RenderingKind = 'key' | 'variant' | 'form'
export type SignListName = 'ebl' | 'ogsl'
export type CrossReferenceRelation = 'see' | 'compare'
export type AliasRelation = 'see' | 'equals'
export type SumerianLanguage = 'SUMERIAN' | 'EMESAL'

export interface AttingerSense {
  readonly meaning: string
  readonly lang: string
  readonly entryId: string
}

export interface Epsd2Sense {
  readonly num: string
  readonly meaning: string
  readonly lang: string
}

export interface AttingerForm {
  readonly spelling: string
  readonly nonStandard: boolean
  readonly attestations: string
}

export interface Epsd2Form {
  readonly spelling: string
  readonly count: number
  readonly percent: number
}

export interface EmesalForm {
  readonly form: string
  readonly source: string
}

export interface SignSpelling {
  readonly source: SumerianSource
  readonly spelling: string
}

export interface SignEntry {
  readonly reading: string
  readonly name: string
  readonly utf8: string
  readonly ambiguous: boolean
  readonly sources: readonly SignSpelling[]
  readonly signList: SignListName | ''
  readonly characterList: SignListName | ''
  readonly knownWrongCharacter: boolean
  readonly determinative: boolean
  readonly unresolved: boolean
  readonly formOf: readonly string[]
}

export interface UnrenderedToken {
  readonly token: string
  readonly reason: string
}

export interface Rendering {
  readonly spelling: string
  readonly source: SumerianSource
  readonly kind: RenderingKind
  readonly cuneiform: readonly string[]
  readonly complete: boolean
  readonly unrendered: readonly UnrenderedToken[]
  readonly printed: string
  readonly signLists: readonly string[]
  readonly knownWrongCharacters: readonly string[]
}

export interface WordLink {
  readonly id: string
  readonly citationForm: string
  readonly homonym: string
  readonly guideWord: string
}

export interface CrossReference {
  readonly relation: CrossReferenceRelation
  readonly target: string
  readonly targets: readonly WordLink[]
  readonly nameTargets: readonly WordLink[]
  readonly method: string
  readonly ambiguous: boolean
}

export interface Alias {
  readonly form: string
  readonly relation: AliasRelation
  readonly entryId: string
  readonly method: string
  readonly source: string
  readonly meanings: readonly string[]
  readonly uncertain: boolean
}

export interface Citation {
  readonly work: string
  readonly passage: string
  readonly etcsl: string
  readonly compositionId: string
}

export interface AkkadianEquivalent {
  readonly wordId: string
  readonly source: string
  readonly indexNumbers: string
}

export interface Attestation {
  readonly count: number
  readonly periods: readonly string[]
}

export interface AttingerHeadword {
  readonly text: string
  readonly display: string
  readonly marks: readonly (readonly [number, number, string])[]
}

export interface AttingerSourceInfo {
  readonly entryId: string
  readonly node: string
  readonly letter: string
  readonly depth: number
  readonly partOfSpeech: string
  readonly headword: AttingerHeadword
}

export interface Epsd2SourceInfo {
  readonly oid: string
  readonly headword: string
  readonly builds: readonly string[]
}

export interface WordSources {
  readonly attinger: AttingerSourceInfo | null
  readonly epsd2: Epsd2SourceInfo | null
}

export interface Match {
  readonly tier: string
  readonly method: string
  readonly spelling: string
  readonly candidateCount: number
  readonly curated: boolean
  readonly curatedOid: string
  readonly curatedStatus: string
  readonly oidStatus: string
  readonly review: readonly string[]
}
