import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossierCache from 'dossiers/application/DossierCache'

type PendingQueryByIdsRequest = {
  readonly ids: readonly string[]
  readonly resolve: (records: readonly DossierRecord[]) => void
  readonly reject: (error: unknown) => void
}

type PendingQueryByIdsBatch = {
  ids: Set<string>
  requests: PendingQueryByIdsRequest[]
  inFlightRequest: Promise<readonly DossierRecord[]> | null
  flushScheduled: boolean
}

function createPendingQueryByIdsBatch(): PendingQueryByIdsBatch {
  return {
    ids: new Set<string>(),
    requests: [],
    inFlightRequest: null,
    flushScheduled: false,
  }
}

export default class DossiersQueryByIdsBatcher {
  private pendingQueryByIdsBatch = createPendingQueryByIdsBatch()
  private cacheGeneration = 0

  constructor(
    private readonly dossiersRepository: DossiersRepository,
    private readonly cache: DossierCache,
  ) {}

  enqueue(
    ids: readonly string[],
    missingIds: readonly string[],
  ): Promise<readonly DossierRecord[]> {
    return new Promise<readonly DossierRecord[]>((resolve, reject) => {
      const pendingBatch = this.pendingQueryByIdsBatch

      missingIds.forEach((id) => pendingBatch.ids.add(id))
      pendingBatch.requests.push({ ids, resolve, reject })
      this.scheduleFlush(pendingBatch)
    })
  }

  reset(): void {
    const previousBatch = this.pendingQueryByIdsBatch
    this.pendingQueryByIdsBatch = createPendingQueryByIdsBatch()
    this.cacheGeneration += 1

    if (previousBatch.requests.length > 0) {
      const error = new Error(
        'DossiersService cache scope changed; pending queryByIds requests cancelled.',
      )
      previousBatch.requests.forEach(({ reject }) => reject(error))
    }
  }

  private flush(): void {
    const pendingBatch = this.pendingQueryByIdsBatch

    if (pendingBatch.inFlightRequest) {
      return
    }

    const idsToFetch = Array.from(pendingBatch.ids.values()).filter(
      (id) => !this.cache.hasFresh(id),
    )
    const requestsToResolve = pendingBatch.requests

    pendingBatch.ids = new Set<string>()
    pendingBatch.requests = []

    if (requestsToResolve.length === 0) {
      return
    }

    if (idsToFetch.length === 0) {
      this.resolveFromCache(requestsToResolve)
      return
    }

    const requestGeneration = this.cacheGeneration
    pendingBatch.inFlightRequest = Promise.resolve(
      this.dossiersRepository.queryByIds(idsToFetch),
    )

    pendingBatch.inFlightRequest
      .then((records) => {
        if (requestGeneration !== this.cacheGeneration) {
          this.resolveFromRecords(requestsToResolve, records)
          return
        }

        records.forEach((record) => {
          this.cache.set(record)
        })

        this.resolveFromCache(requestsToResolve)
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
          this.scheduleFlush(pendingBatch)
        }
      })
  }

  private resolveFromCache(
    requests: readonly PendingQueryByIdsRequest[],
  ): void {
    requests.forEach(({ ids, resolve }) => {
      resolve(this.cache.select(ids))
    })
  }

  private resolveFromRecords(
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

  private scheduleFlush(pendingBatch: PendingQueryByIdsBatch): void {
    if (pendingBatch.flushScheduled) {
      return
    }

    pendingBatch.flushScheduled = true
    Promise.resolve().then(() => {
      if (this.pendingQueryByIdsBatch !== pendingBatch) {
        return
      }

      pendingBatch.flushScheduled = false
      this.flush()
    })
  }
}
