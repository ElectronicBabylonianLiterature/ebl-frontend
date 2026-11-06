import {
  AkkadianEquivalent,
  Alias,
  Attestation,
  AttingerForm,
  AttingerSense,
  Citation,
  CrossReference,
  EmesalForm,
  Epsd2Form,
  Epsd2Sense,
  Match,
  Rendering,
  SignEntry,
  SumerianLanguage,
  WordLink,
  WordSources,
} from 'sumerian-dictionary/domain/SumerianWordParts'

export interface SumerianWord {
  readonly id: string
  readonly citationForm: string
  readonly lemma: readonly string[]
  readonly homonym: string
  readonly guideWord: string
  readonly pos: string
  readonly attingerPos: string
  readonly language: SumerianLanguage
  readonly atf: string
  readonly uncertain: boolean
  readonly truncated: boolean
  readonly stems: readonly string[]
  readonly determinatives: readonly string[]
  readonly caseFrame: readonly string[]
  readonly emesal: readonly EmesalForm[]
  readonly attingerSenses: readonly AttingerSense[]
  readonly epsd2Senses: readonly Epsd2Sense[]
  readonly attingerForms: readonly AttingerForm[]
  readonly epsd2Forms: readonly Epsd2Form[]
  readonly signs: readonly SignEntry[]
  readonly renderings: readonly Rendering[]
  readonly head: WordLink | null
  readonly compounds: readonly WordLink[]
  readonly nameCompounds: readonly WordLink[]
  readonly crossReferences: readonly CrossReference[]
  readonly aliases: readonly Alias[]
  readonly akkadianEquivalents: readonly AkkadianEquivalent[]
  readonly citations: readonly Citation[]
  readonly attestation: Attestation
  readonly sources: WordSources
  readonly match: Match
}
