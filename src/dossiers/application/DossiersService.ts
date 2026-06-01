import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord, {
  DossierRecordSuggestion,
} from 'dossiers/domain/DossierRecord'
import Bluebird from 'bluebird'

const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
const defaultMaximumCachedDossiers = 250
const defaultCacheScope = 'default'

export interface DossiersSearch {
  queryByIds(query: string[]): Bluebird<readonly DossierRecord[]>
  searchSuggestions(
    query: string,
    filters?: {
      provenance?: string | null
      scriptPeriod?: string | null
      genre?: string | null
    },
  ): Bluebird<readonly DossierRecordSuggestion[]>
  fetchAllDossiers(): Bluebird<readonly DossierRecord[]>
  fetchFilteredDossiers(filters: {
    provenance?: string
    scriptPeriod?: string
    genre?: string
  }): Bluebird<readonly DossierRecord[]>
}

type PendingQueryByIdsRequest = {
  readonly ids: readonly string[]
  readonly resolve: (records: readonly DossierRecord[]) => void
  readonly reject: (error: unknown) => void
}

type CacheEntry<Value> = {
  readonly value: Value
  readonly expiresAt: number
}

type PendingQueryByIdsBatch = {
  ids: Set<string>
  requests: PendingQueryByIdsRequest[]
  inFlightRequest: Bluebird<readonly DossierRecord[]> | null
  flushScheduled: boolean
}

export default class DossiersService implements DossiersSearch {
  private readonly dossiersRepository: DossiersRepository
  private readonly cachedDossiersById = new Map<
    string,
    CacheEntry<DossierRecord>
  >()
  private pendingQueryByIdsBatch = this.createPendingQueryByIdsBatch()
  private cacheScope: string | null = null
  private cacheGeneration = 0

  constructor(
    dossiersRepository: DossiersRepository,
    private readonly getCacheScope: () => string = () => defaultCacheScope,
    private readonly getCurrentTime: () => number = () => Date.now(),
    private readonly maximumCachedDossiers: number = defaultMaximumCachedDossiers,
  ) {
    this.dossiersRepository = dossiersRepository
  }

  queryByIds(query: string[]): Bluebird<readonly DossierRecord[]> {
    this.clearCachesWhenScopeChanges()

    const ids = Array.from(new Set(query.filter((id) => id.length > 0)))

    if (ids.length === 0) {
      return Bluebird.resolve([])
    }

    const missingIds = ids.filter((id) => !this.hasFreshCachedDossier(id))

    if (missingIds.length === 0) {
      return Bluebird.resolve(this.selectCachedDossiers(ids))
    }

    return new Bluebird<readonly DossierRecord[]>((resolve, reject) => {
      this.addToPendingQueryByIdsBatch(ids, missingIds, resolve, reject)
    })
  }

  searchSuggestions(
    query: string,
    filters?: {
      provenance?: string | null
      scriptPeriod?: string | null
      genre?: string | null
    },
  ): Bluebird<readonly DossierRecordSuggestion[]> {
    return this.dossiersRepository.searchSuggestions(query, filters)
  }

  fetchAllDossiers(): Bluebird<readonly DossierRecord[]> {
    return this.dossiersRepository.fetchAllDossiers()
  }

  fetchFilteredDossiers(filters: {
    provenance?: string
    scriptPeriod?: string
    genre?: string
  }): Bluebird<readonly DossierRecord[]> {
    return this.dossiersRepository.fetchFilteredDossiers(filters)
  }

  private addToPendingQueryByIdsBatch(
    ids: readonly string[],
    missingIds: readonly string[],
    resolve: (records: readonly DossierRecord[]) => void,
    reject: (error: unknown) => void,
  ): void {
    const pendingBatch = this.pendingQueryByIdsBatch

    missingIds.forEach((id) => pendingBatch.ids.add(id))
    pendingBatch.requests.push({ ids, resolve, reject })
    this.schedulePendingQueryByIdsFlush(pendingBatch)
  }

  private flushPendingQueryByIdsBatch(): void {
    const pendingBatch = this.pendingQueryByIdsBatch

    if (pendingBatch.inFlightRequest) {
      return
    }

    const idsToFetch = Array.from(pendingBatch.ids.values()).filter(
      (id) => !this.hasFreshCachedDossier(id),
    )
    const requestsToResolve = pendingBatch.requests

    pendingBatch.ids = new Set<string>()
    pendingBatch.requests = []

    if (requestsToResolve.length === 0) {
      return
    }

    if (idsToFetch.length === 0) {
      this.resolvePendingRequestsFromCache(requestsToResolve)
      return
    }

    const requestGeneration = this.cacheGeneration
    pendingBatch.inFlightRequest = Bluebird.resolve(
      this.dossiersRepository.queryByIds(idsToFetch),
    )

    pendingBatch.inFlightRequest
      .then((records) => {
        if (requestGeneration !== this.cacheGeneration) {
          this.resolvePendingRequestsFromRecords(requestsToResolve, records)
          return
        }

        records.forEach((record) => {
          this.setCachedDossier(record)
        })

        this.resolvePendingRequestsFromCache(requestsToResolve)
      })
      .catch((error) => {
        requestsToResolve.forEach(({ reject }) => reject(error))
      })
      .finally(() => {
        if (requestGeneration !== this.cacheGeneration) {
          return
        }

        pendingBatch.inFlightRequest = null

        if (pendingBatch.ids.size > 0 || pendingBatch.requests.length > 0) {
          this.schedulePendingQueryByIdsFlush(pendingBatch)
        }
      })
  }

  private selectCachedDossiers(
    ids: readonly string[],
  ): readonly DossierRecord[] {
    return ids.flatMap((id) => {
      const record = this.readCachedDossier(id)
      return record ? [record] : []
    })
  }

  private resolvePendingRequestsFromCache(
    requests: readonly PendingQueryByIdsRequest[],
  ): void {
    requests.forEach(({ ids, resolve }) => {
      resolve(this.selectCachedDossiers(ids))
    })
  }

  private resolvePendingRequestsFromRecords(
    requests: readonly PendingQueryByIdsRequest[],
    records: readonly DossierRecord[],
  ): void {
    const recordsById = new Map<string, DossierRecord>(
      records.map((record) => [record.id, record]),
    )

    requests.forEach(({ ids, resolve }) => {
      resolve(
        ids.flatMap((id) => {
          const record = recordsById.get(id)
          return record ? [record] : []
        }),
      )
    })
  }

  private setCachedDossier(record: DossierRecord): void {
    this.cachedDossiersById.delete(record.id)
    this.cachedDossiersById.set(record.id, {
      value: record,
      expiresAt: this.getCurrentTime() + cacheEntryLifetimeInMilliseconds,
    })
    this.trimCachedDossiers()
  }

  private hasFreshCachedDossier(id: string): boolean {
    return this.readCachedDossier(id) !== null
  }

  private readCachedDossier(id: string): DossierRecord | null {
    const cacheEntry = this.cachedDossiersById.get(id)

    if (!cacheEntry) {
      return null
    }

    if (cacheEntry.expiresAt <= this.getCurrentTime()) {
      this.cachedDossiersById.delete(id)
      return null
    }

    this.cachedDossiersById.delete(id)
    this.cachedDossiersById.set(id, cacheEntry)

    return cacheEntry.value
  }

  private trimCachedDossiers(): void {
    while (this.cachedDossiersById.size > this.maximumCachedDossiers) {
      const oldestId = this.cachedDossiersById.keys().next().value

      if (oldestId === undefined) {
        return
      }

      this.cachedDossiersById.delete(oldestId)
    }
  }

  private schedulePendingQueryByIdsFlush(
    pendingBatch: PendingQueryByIdsBatch,
  ): void {
    if (pendingBatch.flushScheduled) {
      return
    }

    pendingBatch.flushScheduled = true
    Promise.resolve().then(() => {
      if (this.pendingQueryByIdsBatch !== pendingBatch) {
        return
      }

      pendingBatch.flushScheduled = false
      this.flushPendingQueryByIdsBatch()
    })
  }

  private clearAllCaches(): void {
    this.cachedDossiersById.clear()
    this.pendingQueryByIdsBatch = this.createPendingQueryByIdsBatch()
    this.cacheGeneration += 1
  }

  private createPendingQueryByIdsBatch(): PendingQueryByIdsBatch {
    return {
      ids: new Set<string>(),
      requests: [],
      inFlightRequest: null,
      flushScheduled: false,
    }
  }

  private clearCachesWhenScopeChanges(): void {
    const nextScope = this.resolveCacheScope()

    if (this.cacheScope === null) {
      this.cacheScope = nextScope
      return
    }

    if (this.cacheScope !== nextScope) {
      this.cacheScope = nextScope
      this.clearAllCaches()
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
