import _ from 'lodash'
import { stringify } from 'query-string'
import { produce } from 'immer'
import Folio from 'fragmentarium/domain/Folio'
import Annotation, {
  AnnotationData,
  Geometry,
} from 'fragmentarium/domain/annotation'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { fromManuscriptDto } from 'corpus/application/dtos'
import { FolioPagerData, FragmentPagerData } from 'fragmentarium/domain/pager'
import Word from 'dictionary/domain/Word'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryResult, FragmentAfoRegisterQueryResult } from 'query/QueryResult'
import { fromDto as fromTextDto } from 'corpus/application/dtos'
import { LemmaSuggestions } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import { createFragmentPath } from 'fragmentarium/infrastructure/createFragment'
import {
  createQueryResult,
  createLatestQueryResult,
  LatestQueryResultDto,
  QueryResultDto,
} from 'fragmentarium/infrastructure/createQueryResult'

import ApiFragmentQueryRepository from 'fragmentarium/infrastructure/ApiFragmentQueryRepository'

export {
  createScript,
  createJoins,
  createFragment,
  createFragmentInfo,
  createFragmentPath,
  createLineToVecRanking,
} from 'fragmentarium/infrastructure/createFragment'

export class ApiFragmentReadRepository extends ApiFragmentQueryRepository {
  folioPager(
    folio: Folio,
    number: string,
    signal?: AbortSignal,
  ): Promise<FolioPagerData> {
    return this.apiClient.fetchJson<FolioPagerData>(
      `/fragments/${encodeURIComponent(number)}/pager/${encodeURIComponent(
        folio.name,
      )}/${encodeURIComponent(folio.number)}`,
      false,
      signal,
    )
  }

  fragmentPager(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<FragmentPagerData> {
    return this.apiClient.fetchJson<FragmentPagerData>(
      `/fragments/${encodeURIComponent(fragmentNumber)}/pager`,
      false,
      signal,
    )
  }

  findLemmas(word: string, isNormalized: boolean): Promise<Word[][]> {
    return this.apiClient.fetchJson<Word[][]>(
      `/lemmas?word=${encodeURIComponent(
        word,
      )}&isNormalized=${encodeURIComponent(isNormalized)}`,
      false,
    )
  }

  findAnnotations(
    number: string,
    generateAnnotations = false,
    signal?: AbortSignal,
  ): Promise<readonly Annotation[]> {
    return this.apiClient
      .fetchJson<{
        annotations: { geometry: Geometry; data: AnnotationData }[]
      }>(
        `${createFragmentPath(
          number,
        )}/annotations?generateAnnotations=${generateAnnotations}`,
        false,
        signal,
      )
      .then(({ annotations }) =>
        annotations.map(
          ({ geometry, data }) =>
            new Annotation({ ...geometry, type: 'RECTANGLE' }, data),
        ),
      )
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Promise<readonly Annotation[]> {
    return this.apiClient.postJson<readonly Annotation[]>(
      `${createFragmentPath(number)}/annotations`,
      {
        fragmentNumber: number,
        annotations: annotations.map(
          produce((annotation) => ({
            geometry: _.omit(annotation.geometry, 'type'),
            data: annotation.data,
          })),
        ),
      },
    )
  }

  findInCorpus(
    number: string,
    signal?: AbortSignal,
  ): Promise<{
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
      }>(`${createFragmentPath(number)}/corpus`, false, signal)
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

  query(fragmentQuery: FragmentQuery): Promise<QueryResult> {
    return this.apiClient
      .fetchJson<QueryResultDto>(
        `/fragments/query?${stringify(fragmentQuery)}`,
        false,
      )
      .then(createQueryResult)
  }

  queryLatest(): Promise<QueryResult> {
    return this.apiClient
      .fetchJson<LatestQueryResultDto>('/fragments/latest', false)
      .then(createLatestQueryResult)
  }

  queryByTraditionalReferences(
    traditionalReferences: string[],
  ): Promise<FragmentAfoRegisterQueryResult> {
    return this.apiClient.postJson<FragmentAfoRegisterQueryResult>(
      `/fragments/query-by-traditional-references`,
      {
        traditionalReferences,
      },
      false,
    )
  }

  listAllFragments(): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>(`/fragments/all`, false)
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

  fetchNamedEntityAnnotations(
    number: string,
    signal?: AbortSignal,
  ): Promise<readonly ApiEntityAnnotationSpan[]> {
    return this.apiClient.fetchJson<readonly ApiEntityAnnotationSpan[]>(
      createFragmentPath(number, 'named-entities'),
      false,
      signal,
    )
  }
}

export default ApiFragmentReadRepository
