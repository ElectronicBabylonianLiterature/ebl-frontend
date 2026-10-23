import {
  CacheEntry,
  getCachedValue,
  setCachedValueForKeys,
} from 'common/utils/cache'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import {
  SumerianDictionaryStatistics,
  SumerianSearchResult,
  SumerianWordQuery,
  SumerianWordSummary,
} from 'sumerian-dictionary/domain/SumerianWordSummary'
import SumerianDictionaryRepository from 'sumerian-dictionary/infrastructure/SumerianDictionaryRepository'

const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
const maximumCachedEntries = 100

export default class SumerianDictionaryService {
  private readonly repository: SumerianDictionaryRepository

  private readonly cachedWords = new Map<string, CacheEntry<SumerianWord>>()

  constructor(repository: SumerianDictionaryRepository) {
    this.repository = repository
  }

  find(id: string, signal?: AbortSignal): Promise<SumerianWord> {
    const cachedWord = getCachedValue(this.cachedWords, id)
    return cachedWord
      ? Promise.resolve(cachedWord)
      : this.repository
          .find(id, signal)
          .then((word) => this.cacheWord(id, word))
  }

  private cacheWord(requestedId: string, word: SumerianWord): SumerianWord {
    return setCachedValueForKeys({
      cache: this.cachedWords,
      keys: [requestedId, word.id],
      value: word,
      maximumCacheSize: maximumCachedEntries,
      cacheEntryLifetimeInMilliseconds,
    })
  }

  search(
    query: SumerianWordQuery,
    signal?: AbortSignal,
  ): Promise<SumerianSearchResult> {
    return this.repository.search(query, signal)
  }

  findSummaries(
    ids: readonly string[],
    signal?: AbortSignal,
  ): Promise<readonly SumerianWordSummary[]> {
    return this.repository.findSummaries(ids, signal)
  }

  statistics(signal?: AbortSignal): Promise<SumerianDictionaryStatistics> {
    return this.repository.statistics(signal)
  }

  listAllIds(): Promise<string[]> {
    return this.repository.listAllIds()
  }
}
