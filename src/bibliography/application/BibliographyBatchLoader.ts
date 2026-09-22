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

interface RequestedEntryResult {
  readonly id: string
  readonly result: EntryResult
}

type BatchRequest = Promise<ReadonlyMap<string, EntryResult>>
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
  private readonly inFlightRequestsById = new Map<string, BatchRequest>()

  constructor(
    private readonly bibliographyRepository: BibliographyRepository,
    private readonly cacheEntry: CacheEntry,
  ) {}

  load(
    ids: readonly string[],
    generation: number,
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    const sortedUniqueIds = _.uniq(ids).sort()
    const requestKey = sortedUniqueIds.join('|')
    const cachedRequest = this.cachedRequests.get(requestKey)
    if (cachedRequest) {
      return this.onlyFoundEntries(cachedRequest)
    }

    const requestReference: { current?: BatchRequest } = {}
    const request = this.bibliographyRepository
      .findMany(sortedUniqueIds)
      .then((entries) =>
        this.resolveEntries(sortedUniqueIds, entries, generation),
      )
      .finally(() => {
        if (this.cachedRequests.get(requestKey) === requestReference.current) {
          this.cachedRequests.delete(requestKey)
        }
        sortedUniqueIds.forEach((id) => {
          if (this.inFlightRequestsById.get(id) === requestReference.current) {
            this.inFlightRequestsById.delete(id)
          }
        })
      })

    requestReference.current = request
    this.cachedRequests.set(requestKey, request)
    sortedUniqueIds.forEach((id) => {
      if (!this.inFlightRequestsById.has(id)) {
        this.inFlightRequestsById.set(id, request)
      }
    })
    return this.onlyFoundEntries(request)
  }

  findInFlight(id: string): Promise<BibliographyEntry> | undefined {
    const request = this.inFlightRequestsById.get(id)
    return request?.then((results) => {
      const result = results.get(id)!
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
    return request?.then((results) => {
      const result = results.get(id)!
      return 'entry' in result ? result.entry : undefined
    })
  }

  clear(): void {
    this.cachedRequests.clear()
    this.inFlightRequestsById.clear()
  }

  private resolveEntries(
    ids: readonly string[],
    entries: readonly BibliographyEntry[],
    generation: number,
  ): Promise<ReadonlyMap<string, EntryResult>> {
    entries.forEach((entry) => this.cacheEntry(entry.id, entry, generation))
    const entriesById = _.keyBy(entries, 'id')

    return Promise.all(
      ids.map((id) => {
        const entry = entriesById[id]
        return entry
          ? Promise.resolve<RequestedEntryResult>({
              id,
              result: { entry },
            })
          : this.findMissingEntry(id, generation)
      }),
    ).then(
      (results) =>
        new Map(results.map(({ id, result }) => [id, result] as const)),
    )
  }

  private findMissingEntry(
    id: string,
    generation: number,
  ): Promise<RequestedEntryResult> {
    return this.bibliographyRepository
      .find(id)
      .then((entry) => {
        this.cacheEntry(id, entry, generation)
        this.cacheEntry(entry.id, entry, generation)
        return { id, result: { entry } }
      })
      .catch((error) => {
        if (isNotFoundError(error)) {
          return { id, result: { error } }
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
