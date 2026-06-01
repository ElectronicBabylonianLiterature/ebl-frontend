import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord, {
  DossierRecordSuggestion,
} from 'dossiers/domain/DossierRecord'
import Bluebird from 'bluebird'

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

type PendingQueryByIdsBatch = {
  readonly ids: Set<string>
  readonly requests: PendingQueryByIdsRequest[]
}

export default class DossiersService implements DossiersSearch {
  private readonly dossiersRepository: DossiersRepository
  private readonly cachedDossiersById = new Map<string, DossierRecord>()
  private pendingQueryByIdsBatch: PendingQueryByIdsBatch | null = null

  constructor(afoRegisterRepository: DossiersRepository) {
    this.dossiersRepository = afoRegisterRepository
  }

  queryByIds(query: string[]): Bluebird<readonly DossierRecord[]> {
    const ids = Array.from(new Set(query.filter((id) => id.length > 0)))

    if (ids.length === 0) {
      return Bluebird.resolve([])
    }

    const missingIds = ids.filter((id) => !this.cachedDossiersById.has(id))

    if (missingIds.length === 0) {
      return Bluebird.resolve(this.selectCachedDossiers(ids))
    }

    return Bluebird.resolve(
      new Promise<readonly DossierRecord[]>((resolve, reject) => {
        this.addToPendingQueryByIdsBatch(ids, missingIds, resolve, reject)
      }),
    )
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
    if (!this.pendingQueryByIdsBatch) {
      this.pendingQueryByIdsBatch = {
        ids: new Set<string>(),
        requests: [],
      }
      queueMicrotask(() => this.flushPendingQueryByIdsBatch())
    }

    const pendingBatch = this.pendingQueryByIdsBatch

    if (!pendingBatch) {
      return
    }

    missingIds.forEach((id) => pendingBatch.ids.add(id))
    pendingBatch.requests.push({ ids, resolve, reject })
  }

  private flushPendingQueryByIdsBatch(): void {
    const pendingBatch = this.pendingQueryByIdsBatch
    this.pendingQueryByIdsBatch = null

    if (!pendingBatch) {
      return
    }

    const idsToFetch = Array.from(pendingBatch.ids.values())
    const recordsRequest =
      idsToFetch.length === 0
        ? Bluebird.resolve<readonly DossierRecord[]>([])
        : this.dossiersRepository.queryByIds(idsToFetch)

    Bluebird.resolve(recordsRequest)
      .then((records) => {
        records.forEach((record) => {
          this.cachedDossiersById.set(record.id, record)
        })

        pendingBatch.requests.forEach(({ ids, resolve }) =>
          resolve(this.selectCachedDossiers(ids)),
        )
      })
      .catch((error) => {
        pendingBatch.requests.forEach(({ reject }) => reject(error))
      })
  }

  private selectCachedDossiers(
    ids: readonly string[],
  ): readonly DossierRecord[] {
    return ids.flatMap((id) => {
      const record = this.cachedDossiersById.get(id)
      return record ? [record] : []
    })
  }
}
