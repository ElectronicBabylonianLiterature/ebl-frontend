import { stringify } from 'query-string'
import { FragmentInfoDto } from 'fragmentarium/domain/fragment'
import {
  FragmentInfosDtoPromise,
  FragmentInfosPromise,
} from 'fragmentarium/application/FragmentSearchService'
import { FragmentPagerData } from 'fragmentarium/domain/pager'
import {
  LineToVecRanking,
  LineToVecRankingDto,
} from 'fragmentarium/domain/lineToVecRanking'
import { FragmentStatistics } from 'fragmentarium/application/fragmentServicePorts'
import {
  createFragmentInfo,
  createFragmentPath,
  createLineToVecRanking,
} from 'fragmentarium/infrastructure/fragmentFactories'
import { ApiFragmentAttestations } from 'fragmentarium/infrastructure/fragmentRepositoryAttestations'

export class ApiFragmentInfo extends ApiFragmentAttestations {
  statistics(signal?: AbortSignal): Promise<FragmentStatistics> {
    return this.apiClient.fetchJson<FragmentStatistics>(
      '/statistics',
      false,
      signal,
    )
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

  fragmentPager(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<FragmentPagerData> {
    return this.apiClient.fetchJson<FragmentPagerData>(
      `${createFragmentPath(fragmentNumber, 'pager')}`,
      false,
      signal,
    )
  }

  random(signal?: AbortSignal): FragmentInfosPromise {
    return this.fetchFragmentInfos({ random: true }, signal)
  }

  interesting(signal?: AbortSignal): FragmentInfosPromise {
    return this.fetchFragmentInfos({ interesting: true }, signal)
  }

  fetchNeedsRevision(signal?: AbortSignal): FragmentInfosPromise {
    return this.fetchFragmentInfos({ needsRevision: true }, signal)
  }

  private fetchFragmentInfos(
    params: Record<string, unknown>,
    signal?: AbortSignal,
  ): FragmentInfosPromise {
    return this._fetch(params, signal).then((fragmentInfos) =>
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
}
