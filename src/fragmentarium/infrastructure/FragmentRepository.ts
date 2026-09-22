import _ from 'lodash'
import { stringify } from 'query-string'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import {
  AnnotationRepository,
  FragmentRepository,
} from 'fragmentarium/application/FragmentService'
import Annotation, {
  AnnotationData,
  Geometry,
} from 'fragmentarium/domain/annotation'
import { FragmentInfoRepository } from 'fragmentarium/application/FragmentSearchService'
import { FolioPagerData } from 'fragmentarium/domain/pager'
import Word from 'dictionary/domain/Word'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import {
  createLatestQueryResult,
  createQueryResult,
  LatestQueryResultDto,
  QueryResultDto,
} from 'fragmentarium/infrastructure/fragmentQueryMapping'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryResult, FragmentAfoRegisterQueryResult } from 'query/QueryResult'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  createFragment,
  createFragmentPath,
} from 'fragmentarium/infrastructure/fragmentFactories'

import { ApiFragmentUpdates } from 'fragmentarium/infrastructure/fragmentRepositoryUpdates'

export {
  createFragment,
  createFragmentInfo,
  createJoins,
  createScript,
} from 'fragmentarium/infrastructure/fragmentFactories'

class ApiFragmentRepository
  extends ApiFragmentUpdates
  implements FragmentInfoRepository, FragmentRepository, AnnotationRepository
{
  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): Promise<Fragment> {
    const params = _.omitBy(
      { lines: lines, excludeLines: excludeLines },
      (value) => _.isNil(value),
    )
    return this.apiClient
      .fetchJson<FragmentDto>(
        `/fragments/${encodeURIComponent(number)}${
          _.isEmpty(params) ? '' : `?${stringify(params)}`
        }`,
        false,
      )
      .then(createFragment)
  }

  fetchGenres(signal?: AbortSignal): Promise<string[][]> {
    return this.apiClient.fetchJson<string[][]>('/genres', false, signal)
  }

  fetchProvenances(): Promise<readonly ProvenanceRecord[]> {
    return this.apiClient.fetchJson<readonly ProvenanceRecord[]>(
      '/provenances',
      false,
    )
  }

  fetchProvenance(id: string): Promise<ProvenanceRecord> {
    return this.apiClient.fetchJson<ProvenanceRecord>(
      `/provenances/${encodeURIComponent(id)}`,
      false,
    )
  }

  fetchProvenanceChildren(id: string): Promise<readonly ProvenanceRecord[]> {
    return this.apiClient.fetchJson<readonly ProvenanceRecord[]>(
      `/provenances/${encodeURIComponent(id)}/children`,
      false,
    )
  }

  fetchColophonNames(query: string): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>(
      `/fragments/colophon-names?${stringify({ query })}`,
      false,
    )
  }

  fetchPeriods(signal?: AbortSignal): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>('/periods', false, signal)
  }

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
}

export default ApiFragmentRepository
