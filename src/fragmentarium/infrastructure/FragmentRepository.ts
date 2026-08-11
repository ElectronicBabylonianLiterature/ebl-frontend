import Promise from 'bluebird'
import _ from 'lodash'
import { stringify } from 'query-string'
import { Fragment, FragmentInfoDto } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import {
  AnnotationRepository,
  FragmentRepository,
} from 'fragmentarium/application/FragmentService'
import Annotation, {
  AnnotationData,
  Geometry,
} from 'fragmentarium/domain/annotation'
import {
  FragmentInfoRepository,
  FragmentInfosDtoPromise,
  FragmentInfosPromise,
} from 'fragmentarium/application/FragmentSearchService'
import { FolioPagerData, FragmentPagerData } from 'fragmentarium/domain/pager'
import Word from 'dictionary/domain/Word'
import {
  LineToVecRanking,
  LineToVecRankingDto,
} from 'fragmentarium/domain/lineToVecRanking'
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
  createFragmentInfo,
  createFragmentPath,
  createLineToVecRanking,
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
  statistics(): Promise<{
    transliteratedFragments: number
    lines: number
    totalFragments: number
  }> {
    return this.apiClient.fetchJson<{
      transliteratedFragments: number
      lines: number
      totalFragments: number
    }>(`/statistics`, false)
  }

  lineToVecRanking(number: string): Promise<LineToVecRanking> {
    return this.apiClient
      .fetchJson<LineToVecRankingDto>(
        createFragmentPath(number, 'match'),
        false,
      )
      .then(createLineToVecRanking)
  }

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

  random(): FragmentInfosPromise {
    return this._fetch({ random: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo),
    )
  }

  interesting(): FragmentInfosPromise {
    return this._fetch({ interesting: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo),
    )
  }

  fetchNeedsRevision(): FragmentInfosPromise {
    return this._fetch({ needsRevision: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo),
    )
  }

  _fetch(params: Record<string, unknown>): FragmentInfosDtoPromise {
    return this.apiClient.fetchJson<ReadonlyArray<FragmentInfoDto>>(
      `/fragments?${stringify(params)}`,
      false,
    )
  }

  fetchGenres(): Promise<string[][]> {
    return this.apiClient.fetchJson<string[][]>('/genres', false)
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

  fetchPeriods(): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>('/periods', false)
  }

  folioPager(folio: Folio, number: string): Promise<FolioPagerData> {
    return this.apiClient.fetchJson<FolioPagerData>(
      `/fragments/${encodeURIComponent(number)}/pager/${encodeURIComponent(
        folio.name,
      )}/${encodeURIComponent(folio.number)}`,
      false,
    )
  }

  fragmentPager(fragmentNumber: string): Promise<FragmentPagerData> {
    return this.apiClient.fetchJson<FragmentPagerData>(
      `/fragments/${encodeURIComponent(fragmentNumber)}/pager`,
      false,
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
  ): Promise<readonly Annotation[]> {
    return this.apiClient
      .fetchJson<{
        annotations: { geometry: Geometry; data: AnnotationData }[]
      }>(
        `${createFragmentPath(
          number,
        )}/annotations?generateAnnotations=${generateAnnotations}`,
        false,
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
