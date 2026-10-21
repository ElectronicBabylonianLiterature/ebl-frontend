import ApiClient from 'http/ApiClient'
import { stringify } from 'common/utils/queryString'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import {
  SumerianDictionaryStatistics,
  SumerianSearchResult,
  SumerianWordQuery,
  SumerianWordSummary,
} from 'sumerian-dictionary/domain/SumerianWordSummary'
import {
  SumerianWordDto,
  SumerianWordSummaryDto,
  toSumerianWord,
  toSumerianWordSummary,
} from 'sumerian-dictionary/infrastructure/sumerianWordDto'

const basePath = '/sumerian-words'
const authenticate = true

export default class SumerianDictionaryRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  find(id: string, signal?: AbortSignal): Promise<SumerianWord> {
    return this.apiClient
      .fetchJson<SumerianWordDto>(
        `${basePath}/${encodeURIComponent(id)}`,
        authenticate,
        signal,
      )
      .then(toSumerianWord)
  }

  search(
    query: SumerianWordQuery,
    signal?: AbortSignal,
  ): Promise<SumerianSearchResult> {
    return this.apiClient
      .fetchJson<{
        total: number
        entries: readonly SumerianWordSummaryDto[]
      }>(
        `${basePath}?${stringify(query, { skipEmptyString: true })}`,
        authenticate,
        signal,
      )
      .then(({ total, entries }) => ({
        total,
        entries: entries.map(toSumerianWordSummary),
      }))
  }

  findSummaries(
    ids: readonly string[],
    signal?: AbortSignal,
  ): Promise<readonly SumerianWordSummary[]> {
    return this.apiClient
      .fetchJson<
        readonly SumerianWordSummaryDto[]
      >(`${basePath}?ids=${encodeURIComponent(ids.join(','))}`, authenticate, signal)
      .then((summaries) => summaries.map(toSumerianWordSummary))
  }

  statistics(signal?: AbortSignal): Promise<SumerianDictionaryStatistics> {
    return this.apiClient.fetchJson<SumerianDictionaryStatistics>(
      `${basePath}/statistics`,
      authenticate,
      signal,
    )
  }

  listAllIds(): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>(`${basePath}/all`, authenticate)
  }
}
