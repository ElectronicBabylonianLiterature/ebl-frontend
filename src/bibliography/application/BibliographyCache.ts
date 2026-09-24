import Promise from 'bluebird'
import _ from 'lodash'

import BibliographyBatchLoader, {
  isNotFoundError,
} from 'bibliography/application/BibliographyBatchLoader'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import { CacheEntry, getCachedValue, setCachedValue } from 'common/utils/cache'

const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
const maximumCachedEntries = 500

export default class BibliographyCache {
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

  find(id: string): Promise<BibliographyEntry> {
    const cachedEntry = getCachedValue(this.entries, id)
    if (cachedEntry) {
      return Promise.resolve(cachedEntry)
    }

    const inFlightRequest = this.findRequests.get(id)
    if (inFlightRequest) {
      return inFlightRequest.then((entry) => entry)
    }

    const inFlightBatchRequest = this.batchLoader.findInFlight(id)
    if (inFlightBatchRequest) {
      return inFlightBatchRequest
    }

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
    return request.then((entry) => entry)
  }

  findManyById(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    const uniqueIds = _.uniq(ids)
    return _.isEmpty(uniqueIds)
      ? Promise.resolve(new Map<string, BibliographyEntry>())
      : this.loadEntriesByIds(uniqueIds)
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

  private loadEntriesByIds(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    const entriesById = new Map<string, BibliographyEntry>()
    const missingIds: string[] = []
    const inFlightRequests: Array<Promise<void>> = []

    ids.forEach((id) => {
      const cachedEntry = getCachedValue(this.entries, id)
      if (cachedEntry) {
        entriesById.set(id, cachedEntry)
        return
      }

      const directFindRequest = this.findRequests.get(id)
      if (directFindRequest) {
        inFlightRequests.push(
          directFindRequest
            .then((entry) => {
              entriesById.set(id, entry)
            })
            .catch((error) => {
              if (!isNotFoundError(error)) {
                throw error
              }
            }),
        )
        return
      }

      const batchFindRequest = this.batchLoader.findManyInFlight(id)
      if (batchFindRequest) {
        inFlightRequests.push(
          batchFindRequest.then((entry) => {
            if (entry) {
              entriesById.set(id, entry)
            }
          }),
        )
        return
      }

      missingIds.push(id)
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

  private invalidateInFlightRequests(): void {
    this.generation += 1
    this.findRequests.clear()
    this.batchLoader.clear()
  }
}
