import Promise from 'bluebird'
import { CacheEntry, getCachedValue, setCachedValue } from 'common/utils/cache'
import { isRealiaId, RealiaEntry } from 'realia/domain/RealiaEntry'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'

const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
const maximumCachedEntries = 100

export default class RealiaService {
  private readonly realiaRepository: RealiaRepository

  private readonly cachedEntries = new Map<string, CacheEntry<RealiaEntry>>()

  constructor(realiaRepository: RealiaRepository) {
    this.realiaRepository = realiaRepository
  }

  find(id: string): Promise<RealiaEntry> {
    const cachedEntry = getCachedValue(this.cachedEntries, id)
    return cachedEntry
      ? Promise.resolve(cachedEntry)
      : this.fetchEntry(id).then((entry) => this.cacheEntry(id, entry))
  }

  private fetchEntry(id: string): Promise<RealiaEntry> {
    return isRealiaId(id)
      ? this.realiaRepository.findByRealiaId(id)
      : this.realiaRepository.find(id)
  }

  private cacheEntry(requestedId: string, entry: RealiaEntry): RealiaEntry {
    new Set([requestedId, entry.id]).forEach((key) =>
      setCachedValue({
        cache: this.cachedEntries,
        key,
        value: entry,
        maximumCacheSize: maximumCachedEntries,
        cacheEntryLifetimeInMilliseconds,
      }),
    )
    return entry
  }

  search(query: string): Promise<readonly RealiaEntry[]> {
    return this.realiaRepository.search(query)
  }
}
