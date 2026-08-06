import _ from 'lodash'
import { stringify } from 'query-string'
import { Fragment, FragmentInfoDto } from 'fragmentarium/domain/fragment'
import {
  FragmentInfoRepository,
  FragmentInfosDtoPromise,
  FragmentInfosPromise,
} from 'fragmentarium/application/FragmentSearchService'
import {
  LineToVecRanking,
  LineToVecRankingDto,
} from 'fragmentarium/domain/lineToVecRanking'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import { JsonApiClient } from 'index'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  createFragment,
  createFragmentInfo,
  createFragmentPath,
  createLineToVecRanking,
} from 'fragmentarium/infrastructure/createFragment'

export {
  createScript,
  createJoins,
  createFragment,
  createFragmentInfo,
  createFragmentPath,
  createLineToVecRanking,
} from 'fragmentarium/infrastructure/createFragment'

export class ApiFragmentQueryRepository implements FragmentInfoRepository {
  constructor(protected readonly apiClient: JsonApiClient) {}

  statistics(signal?: AbortSignal): Promise<{
    transliteratedFragments: number
    lines: number
    totalFragments: number
  }> {
    return this.apiClient.fetchJson<{
      transliteratedFragments: number
      lines: number
      totalFragments: number
    }>(`/statistics`, false, signal)
  }

  lineToVecRanking(
    number: string,
    signal?: AbortSignal,
  ): Promise<LineToVecRanking> {
    return this.apiClient
      .fetchJson<LineToVecRankingDto>(
        createFragmentPath(number, 'match'),
        false,
        signal,
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

  random(signal?: AbortSignal): FragmentInfosPromise {
    return this._fetch({ random: true }, signal).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo),
    )
  }

  interesting(signal?: AbortSignal): FragmentInfosPromise {
    return this._fetch({ interesting: true }, signal).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo),
    )
  }

  fetchNeedsRevision(signal?: AbortSignal): FragmentInfosPromise {
    return this._fetch({ needsRevision: true }, signal).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo),
    )
  }

  _fetch(
    params: Record<string, unknown>,
    signal?: AbortSignal,
  ): FragmentInfosDtoPromise {
    return this.apiClient.fetchJson<ReadonlyArray<FragmentInfoDto>>(
      `/fragments?${stringify(params)}`,
      false,
      signal,
    )
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
}

export default ApiFragmentQueryRepository
