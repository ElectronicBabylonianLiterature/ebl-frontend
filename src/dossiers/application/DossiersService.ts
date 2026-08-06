import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord, {
  DossierRecordSuggestion,
} from 'dossiers/domain/DossierRecord'
import DossierCache, {
  defaultCacheScope,
  defaultMaximumCachedDossiers,
} from 'dossiers/application/DossierCache'
import DossiersQueryByIdsBatcher from 'dossiers/application/DossiersQueryByIdsBatcher'

export interface DossiersSearch {
  queryByIds(query: string[]): Promise<readonly DossierRecord[]>
  searchSuggestions(
    query: string,
    filters?: {
      provenance?: string | null
      scriptPeriod?: string | null
      genre?: string | null
    },
  ): Promise<readonly DossierRecordSuggestion[]>
  fetchAllDossiers(signal?: AbortSignal): Promise<readonly DossierRecord[]>
  fetchFilteredDossiers(filters: {
    provenance?: string
    scriptPeriod?: string
    genre?: string
  }): Promise<readonly DossierRecord[]>
}

export default class DossiersService implements DossiersSearch {
  private readonly dossiersRepository: DossiersRepository
  private readonly cache: DossierCache
  private readonly batcher: DossiersQueryByIdsBatcher
  private cacheScope: string | null = null

  constructor(
    dossiersRepository: DossiersRepository,
    private readonly getCacheScope: () => string = () => defaultCacheScope,
    getCurrentTime: () => number = () => Date.now(),
    maximumCachedDossiers: number = defaultMaximumCachedDossiers,
  ) {
    this.dossiersRepository = dossiersRepository
    this.cache = new DossierCache(getCurrentTime, maximumCachedDossiers)
    this.batcher = new DossiersQueryByIdsBatcher(dossiersRepository, this.cache)
  }

  queryByIds(query: string[]): Promise<readonly DossierRecord[]> {
    this.clearCachesWhenScopeChanges()

    const ids = Array.from(new Set(query.filter((id) => id.length > 0)))

    if (ids.length === 0) {
      return Promise.resolve([])
    }

    const missingIds = ids.filter((id) => !this.cache.hasFresh(id))

    if (missingIds.length === 0) {
      return Promise.resolve(this.cache.select(ids))
    }

    return this.batcher.enqueue(ids, missingIds)
  }

  searchSuggestions(
    query: string,
    filters?: {
      provenance?: string | null
      scriptPeriod?: string | null
      genre?: string | null
    },
  ): Promise<readonly DossierRecordSuggestion[]> {
    return this.dossiersRepository.searchSuggestions(query, filters)
  }

  fetchAllDossiers(signal?: AbortSignal): Promise<readonly DossierRecord[]> {
    return this.dossiersRepository.fetchAllDossiers(signal)
  }

  fetchFilteredDossiers(filters: {
    provenance?: string
    scriptPeriod?: string
    genre?: string
  }): Promise<readonly DossierRecord[]> {
    return this.dossiersRepository.fetchFilteredDossiers(filters)
  }

  private clearCachesWhenScopeChanges(): void {
    const nextScope = this.resolveCacheScope()

    if (this.cacheScope === null) {
      this.cacheScope = nextScope
      return
    }

    if (this.cacheScope !== nextScope) {
      this.cacheScope = nextScope
      this.cache.clear()
      this.batcher.reset()
    }
  }

  private resolveCacheScope(): string {
    try {
      return this.getCacheScope()
    } catch {
      return defaultCacheScope
    }
  }
}
