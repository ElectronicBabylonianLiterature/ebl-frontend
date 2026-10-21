import _ from 'lodash'
import { createAbortError } from 'common/utils/abortError'

import BibliographyBatchLoader, {
  isNotFoundError,
} from 'bibliography/application/BibliographyBatchLoader'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import { CacheEntry, getCachedValue, setCachedValue } from 'common/utils/cache'

export const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
export const maximumCachedEntries = 500

export { defaultCacheScope } from 'common/utils/cache'

export default class BibliographyEntryLoader {
  private generation = 0
  private readonly entries = new Map<string, CacheEntry<BibliographyEntry>>()
  private readonly findRequests = new Map<string, Promise<BibliographyEntry>>()
  private readonly batchLoader: BibliographyBatchLoader

  constructor(private readonly bibliographyRepository: BibliographyRepository) {
    this.batchLoader = new BibliographyBatchLoader(
      bibliographyRepository,
      (id, entry, generation) => {
        if (generation === this.generation) {
          this.cacheEntry(id, entry)
        }
      },
    )
  }

  find(id: string, signal?: AbortSignal): Promise<BibliographyEntry> {
    if (signal?.aborted) return Promise.reject(createAbortError(signal))
    return signal
      ? this.bibliographyRepository.find(id, signal)
      : this.findCachedEntry(id)
  }

  private findCachedEntry(id: string): Promise<BibliographyEntry> {
    const cachedEntry = getCachedValue(this.entries, id)
    if (cachedEntry) {
      return Promise.resolve(cachedEntry)
    }

    const inFlightRequest =
      this.findRequests.get(id) ?? this.batchLoader.findInFlight(id)
    return (inFlightRequest ?? this.fetchEntry(id)).then((entry) => entry)
  }

  private fetchEntry(id: string): Promise<BibliographyEntry> {
    const requestReference: { current?: Promise<BibliographyEntry> } = {}
    const generation = this.generation
    const request = this.bibliographyRepository
      .find(id)
      .then((entry) =>
        generation === this.generation &&
        this.findRequests.get(id) === requestReference.current
          ? this.cacheEntry(id, entry)
          : entry,
      )
      .finally(() => {
        if (this.findRequests.get(id) === requestReference.current) {
          this.findRequests.delete(id)
        }
      })

    requestReference.current = request
    this.findRequests.set(id, request)
    return request
  }

  findManyById(
    ids: readonly string[],
    signal?: AbortSignal,
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    const uniqueIds = _.uniq(ids)
    return _.isEmpty(uniqueIds)
      ? Promise.resolve(new Map<string, BibliographyEntry>())
      : this.loadEntriesByIds(uniqueIds, signal)
  }

  cacheEntry(id: string, entry: BibliographyEntry): BibliographyEntry {
    return setCachedValue({
      cache: this.entries,
      key: id,
      value: entry,
      maximumCacheSize: maximumCachedEntries,
      cacheEntryLifetimeInMilliseconds,
    })
  }

  cacheUpdatedEntry(entry: BibliographyEntry): BibliographyEntry {
    this.invalidateEntryCaches(entry.id)
    return this.cacheEntry(entry.id, entry)
  }

  invalidateEntryCaches(id: string): void {
    this.invalidateInFlightRequests()
    this.entries.forEach((cachedEntry, key) => {
      if (cachedEntry.value.id === id) {
        this.entries.delete(key)
      }
    })
  }

  clear(): void {
    this.invalidateInFlightRequests()
    this.entries.clear()
  }

  loadEntriesByIds(
    ids: readonly string[],
    signal?: AbortSignal,
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    if (signal?.aborted) return Promise.reject(createAbortError(signal))
    if (signal) {
      return new BibliographyBatchLoader(
        this.bibliographyRepository,
        () => undefined,
        signal,
      ).load(ids, this.generation)
    }
    const entriesById = new Map<string, BibliographyEntry>()
    const missingIds: string[] = []
    const inFlightRequests: Array<Promise<void>> = []

    ids.forEach((id) => {
      const existingEntry = this.findAvailableEntry(id)
      if (existingEntry) {
        inFlightRequests.push(
          existingEntry.then((entry) => {
            if (entry) {
              entriesById.set(id, entry)
            }
          }),
        )
      } else {
        missingIds.push(id)
      }
    })

    const fetchMissingEntries = _.isEmpty(missingIds)
      ? Promise.resolve(new Map<string, BibliographyEntry>())
      : this.batchLoader.load(missingIds, this.generation)

    return Promise.all([
      Promise.all(inFlightRequests),
      fetchMissingEntries,
    ]).then(([, fetchedEntries]) => {
      fetchedEntries.forEach((entry, id) => {
        entriesById.set(id, entry)
      })
      return entriesById
    })
  }

  private findAvailableEntry(
    id: string,
  ): Promise<BibliographyEntry | undefined> | undefined {
    const cachedEntry = getCachedValue(this.entries, id)
    if (cachedEntry) {
      return Promise.resolve(cachedEntry)
    }

    const directFindRequest = this.findRequests.get(id)
    return directFindRequest
      ? directFindRequest.catch((error) => {
          if (!isNotFoundError(error)) {
            throw error
          }
          return undefined
        })
      : this.batchLoader.findManyInFlight(id)
  }

  private invalidateInFlightRequests(): void {
    this.generation += 1
    this.findRequests.clear()
    this.batchLoader.clear()
  }
}
