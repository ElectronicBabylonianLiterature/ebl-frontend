import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import { ApiError } from 'http/ApiClient'
import _ from 'lodash'

interface FoundEntry {
  readonly entry: BibliographyEntry
}

interface MissingEntry {
  readonly error: Error
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

export function handleLookupError(
  error: Error,
  reportError?: (error: Error) => void,
  ignoreNotFound = true,
): undefined {
  if (!ignoreNotFound || !isNotFoundError(error)) {
    if (!reportError) {
      throw error
    }
    reportError(error)
  }
  return undefined
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
    reportError?: (error: Error) => void,
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    const sortedUniqueIds = _.uniq(ids).sort()
    const requestKey = JSON.stringify(sortedUniqueIds)
    const cachedRequest = this.cachedRequests.get(requestKey)
    if (cachedRequest) {
      return this.onlyFoundEntries(cachedRequest, reportError)
    }

    const batchRequest = this.bibliographyRepository.findMany(sortedUniqueIds)
    const entriesByIdRequest = batchRequest.then((entries) => {
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
    return this.onlyFoundEntries(request, reportError)
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
    reportError?: (error: Error) => void,
  ): Promise<BibliographyEntry | undefined> | undefined {
    const request = this.inFlightRequestsById.get(id)
    return request?.then(
      (result) =>
        'entry' in result
          ? result.entry
          : handleLookupError(result.error, reportError),
      (error: Error) => handleLookupError(error, reportError, false),
    )
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
    const request = this.bibliographyRepository.find(id)
    return request
      .then((entry) => {
        this.cacheEntry(id, entry, generation)
        this.cacheEntry(entry.id, entry, generation)
        return { entry }
      })
      .catch((error: Error) => ({ error }))
  }

  private onlyFoundEntries(
    request: BatchRequest,
    reportError?: (error: Error) => void,
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    return request.then(
      (results) => {
        const entries = new Map<string, BibliographyEntry>()
        results.forEach((result, id) => {
          if ('entry' in result) {
            entries.set(id, result.entry)
          } else {
            handleLookupError(result.error, reportError)
          }
        })
        return entries
      },
      (error: Error) => {
        handleLookupError(error, reportError, false)
        return new Map<string, BibliographyEntry>()
      },
    )
  }
}
