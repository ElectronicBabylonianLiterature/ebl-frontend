import Promise from 'bluebird'
import _ from 'lodash'
import { ChapterId } from 'transliteration/domain/chapter-id'
import {
  fromDto as fromTextDto,
  fromManuscriptDto,
} from 'corpus/application/dtos'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import { LemmaSuggestions } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import Word from 'dictionary/domain/Word'
import { JsonApiClient } from 'index'
import { createFragmentPath } from 'fragmentarium/infrastructure/fragmentFactories'

export class ApiFragmentAttestations {
  constructor(protected readonly apiClient: JsonApiClient) {}

  findInCorpus(number: string): Promise<{
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }> {
    return this.apiClient
      .fetchJson<{
        manuscriptAttestations: Array<{
          text: Record<string, unknown>
          chapterId: ChapterId
          manuscript: Record<string, unknown>
          manuscriptSiglum: string
        }>
        uncertainFragmentAttestations: Array<{
          text: Record<string, unknown>
          chapterId: ChapterId
        }>
      }>(`${createFragmentPath(number)}/corpus`, false)
      .then((response) => ({
        manuscriptAttestations: (response.manuscriptAttestations ?? []).map(
          (manuscriptAttestation) =>
            new ManuscriptAttestation(
              fromTextDto(manuscriptAttestation.text),
              manuscriptAttestation.chapterId,
              fromManuscriptDto(manuscriptAttestation.manuscript),
              manuscriptAttestation.manuscriptSiglum,
            ),
        ),
        uncertainFragmentAttestations: (
          response.uncertainFragmentAttestations ?? []
        ).map(
          (uncertain) =>
            new UncertainFragmentAttestation(
              fromTextDto(uncertain.text),
              uncertain.chapterId,
            ),
        ),
      }))
  }

  collectLemmaSuggestions(number: string): Promise<LemmaSuggestions> {
    return this.apiClient
      .fetchJson<
        Record<string, Word[]>
      >(`${createFragmentPath(number)}/collect-lemmas`, false)
      .then((suggestions) => {
        return new Map(
          Object.entries(
            _.mapValues(suggestions, (wordDtos) =>
              wordDtos.map((word) => new LemmaOption(word, true)),
            ),
          ),
        )
      })
  }
}
