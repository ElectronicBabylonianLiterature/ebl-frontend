import Promise from 'bluebird'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import { ApiError } from 'http/ApiClient'
import _ from 'lodash'

interface FoundEntry {
  readonly entry: BibliographyEntry
}

interface MissingEntry {
  readonly error: ApiError
}

type EntryResult = FoundEntry | MissingEntry

type BatchRequest = Promise<ReadonlyMap<string, EntryResult>>
type EntryRequest = Promise<EntryResult>
type CacheEntry = (
  id: string,
  entry: BibliographyEntry,
  generation: number,
) => void

export function isNotFoundError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 404
}

export default class BibliographyBatchLoader {
  private readonly cachedRequests = new Map<string, BatchRequest>()
  private readonly inFlightRequestsById = new Map<string, EntryRequest>()

  constructor(
    private readonly bibliographyRepository: BibliographyRepository,
    private readonly cacheEntry: CacheEntry,
  ) {}

  load(
    ids: readonly string[],
    generation: number,
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    const sortedUniqueIds = _.uniq(ids).sort()
    const requestKey = JSON.stringify(sortedUniqueIds)
    const cachedRequest = this.cachedRequests.get(requestKey)
    if (cachedRequest) {
      return this.onlyFoundEntries(cachedRequest)
    }

    const entriesByIdRequest = this.bibliographyRepository
      .findMany(sortedUniqueIds)
      .then((entries) => {
        entries.forEach((entry) => this.cacheEntry(entry.id, entry, generation))
        return new Map(entries.map((entry) => [entry.id, entry]))
      })
    const entryRequests = new Map(
      sortedUniqueIds.map(
        (id) =>
          [id, this.resolveEntry(id, entriesByIdRequest, generation)] as const,
      ),
    )
    const requestReference: { current?: BatchRequest } = {}
    const request = Promise.all(
      [...entryRequests].map(([id, entryRequest]) =>
        entryRequest.then((result) => ({ id, result })),
      ),
    )
      .then(
        (results) =>
          new Map(results.map(({ id, result }) => [id, result] as const)),
      )
      .finally(() => {
        if (this.cachedRequests.get(requestKey) === requestReference.current) {
          this.cachedRequests.delete(requestKey)
        }
        entryRequests.forEach((entryRequest, id) => {
          if (this.inFlightRequestsById.get(id) === entryRequest) {
            this.inFlightRequestsById.delete(id)
          }
        })
      })

    requestReference.current = request
    this.cachedRequests.set(requestKey, request)
    entryRequests.forEach((entryRequest, id) => {
      if (!this.inFlightRequestsById.has(id)) {
        this.inFlightRequestsById.set(id, entryRequest)
      }
    })
    return this.onlyFoundEntries(request)
  }

  findInFlight(id: string): Promise<BibliographyEntry> | undefined {
    const request = this.inFlightRequestsById.get(id)
    return request?.then((result) => {
      if ('entry' in result) {
        return result.entry
      }
      throw result.error
    })
  }

  findManyInFlight(
    id: string,
  ): Promise<BibliographyEntry | undefined> | undefined {
    const request = this.inFlightRequestsById.get(id)
    return request?.then((result) => {
      return 'entry' in result ? result.entry : undefined
    })
  }

  clear(): void {
    this.cachedRequests.clear()
    this.inFlightRequestsById.clear()
  }

  private resolveEntry(
    id: string,
    entriesByIdRequest: Promise<ReadonlyMap<string, BibliographyEntry>>,
    generation: number,
  ): EntryRequest {
    return entriesByIdRequest.then((entriesById) => {
      const entry = entriesById.get(id)
      return entry ? { entry } : this.findMissingEntry(id, generation)
    })
  }

  private findMissingEntry(id: string, generation: number): EntryRequest {
    return this.bibliographyRepository
      .find(id)
      .then((entry) => {
        this.cacheEntry(id, entry, generation)
        this.cacheEntry(entry.id, entry, generation)
        return { entry }
      })
      .catch((error) => {
        if (isNotFoundError(error)) {
          return { error }
        }
        throw error
      })
  }

  private onlyFoundEntries(
    request: BatchRequest,
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    return request.then((results) => {
      const entries = new Map<string, BibliographyEntry>()
      results.forEach((result, id) => {
        if ('entry' in result) {
          entries.set(id, result.entry)
        }
      })
      return entries
    })
  }
}
