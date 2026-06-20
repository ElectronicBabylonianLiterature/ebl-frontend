import _ from 'lodash'
import Reference from 'bibliography/domain/Reference'

export interface RealiaCrossReference {
  readonly id: string
  readonly lemma: string
}

export interface AfoRegisterEntry {
  readonly mainWord: string
  readonly note: string
  readonly AfO: string
  readonly reference: string
  readonly crossReference: string
}

export interface ReallexikonEntry {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly reference: Reference | null
}

export interface RealiaEntry {
  readonly id: string
  readonly relatedTerms: readonly string[]
  readonly type: readonly string[]
  readonly wikidataId: readonly string[]
  readonly afoRegister: readonly AfoRegisterEntry[]
  readonly reallexikon: readonly ReallexikonEntry[]
  readonly crossReferences: readonly RealiaCrossReference[]
  readonly afoCrossReferences: readonly RealiaCrossReference[]
  readonly references: readonly Reference[]
}

export function getRealiaCrossReferences(
  entry: RealiaEntry,
): readonly RealiaCrossReference[] {
  return _.uniqBy(
    [...entry.crossReferences, ...entry.afoCrossReferences],
    (crossReference) => crossReference.id,
  )
}
