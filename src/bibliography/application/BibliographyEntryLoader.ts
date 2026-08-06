import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import _ from 'lodash'
import { CacheEntry, getCachedValue, setCachedValue } from 'common/utils/cache'

export const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
export const maximumCachedEntries = 500
export const defaultCacheScope = 'default'

export default class BibliographyEntryLoader {
  private readonly cachedEntries = new Map<
    string,
    CacheEntry<BibliographyEntry>
  >()

  private readonly cachedFindRequests = new Map<
    string,
    Promise<BibliographyEntry>
  >()

  private readonly cachedFindManyRequests = new Map<
    string,
    Promise<readonly BibliographyEntry[]>
  >()

  constructor(
    private readonly bibliographyRepository: BibliographyRepository,
  ) {}

  find(id: string): Promise<BibliographyEntry> {
    const cachedEntry = getCachedValue(this.cachedEntries, id)
    if (cachedEntry) {
      return Promise.resolve(cachedEntry)
    }

    const inFlightRequest = this.cachedFindRequests.get(id)
    if (inFlightRequest) {
      return inFlightRequest.then((entry) => entry)
    }

    const requestReference: { current?: Promise<BibliographyEntry> } = {}
    const request = this.bibliographyRepository
      .find(id)
      .then((entry) =>
        this.cachedFindRequests.get(id) === requestReference.current
          ? this.cacheEntry(entry)
          : entry,
      )
      .finally(() => {
        if (this.cachedFindRequests.get(id) === requestReference.current) {
          this.cachedFindRequests.delete(id)
        }
      })

    requestReference.current = request
    this.cachedFindRequests.set(id, request)
    return request.then((entry) => entry)
  }

  loadEntriesByIds(
    ids: readonly string[],
  ): Promise<Map<string, BibliographyEntry>> {
    const entriesById = new Map<string, BibliographyEntry>()
    const missingIds: string[] = []
    const inFlightRequests: Array<Promise<void>> = []

    ids.forEach((id) => {
      const cachedEntry = getCachedValue(this.cachedEntries, id)
      if (cachedEntry) {
        entriesById.set(id, cachedEntry)
        return
      }

      const inFlight = this.cachedFindRequests.get(id)
      if (inFlight) {
        inFlightRequests.push(
          inFlight.then((entry) => {
            entriesById.set(id, entry)
          }),
        )
        return
      }

      missingIds.push(id)
    })

    const fetchMissingEntries = _.isEmpty(missingIds)
      ? Promise.resolve([] as readonly BibliographyEntry[])
      : this.fetchMany(missingIds)

    return Promise.all([
      Promise.all(inFlightRequests),
      fetchMissingEntries,
    ]).then(([, fetchedEntries]) => {
      fetchedEntries.forEach((entry) => {
        entriesById.set(entry.id, entry)
      })
      return entriesById
    })
  }

  cacheUpdatedEntry(entry: BibliographyEntry): BibliographyEntry {
    this.cachedFindManyRequests.clear()
    this.cacheEntry(entry)
    return entry
  }

  clear(): void {
    this.cachedEntries.clear()
    this.cachedFindRequests.clear()
    this.cachedFindManyRequests.clear()
  }

  private cacheEntry(entry: BibliographyEntry): BibliographyEntry {
    return setCachedValue({
      cache: this.cachedEntries,
      key: entry.id,
      value: entry,
      maximumCacheSize: maximumCachedEntries,
      cacheEntryLifetimeInMilliseconds,
    })
  }

  private fetchMany(
    ids: readonly string[],
  ): Promise<readonly BibliographyEntry[]> {
    const sortedUniqueIds = _.uniq(ids).sort()
    const requestKey = sortedUniqueIds.join('|')
    const cachedRequest = this.cachedFindManyRequests.get(requestKey)
    if (cachedRequest) {
      return cachedRequest.then((entries) => entries)
    }

    const requestReference: {
      current?: Promise<readonly BibliographyEntry[]>
    } = {}
    const request = this.bibliographyRepository
      .findMany(sortedUniqueIds)
      .then((entries) => {
        entries.forEach((entry) => this.cacheEntry(entry))

        const entriesById = _.keyBy(entries, 'id')
        return Promise.all(
          sortedUniqueIds.map((id) => {
            const entry = entriesById[id]
            return entry
              ? entry
              : this.bibliographyRepository
                  .find(id)
                  .then((resolvedEntry) => this.cacheEntry(resolvedEntry))
          }),
        )
      })
      .finally(() => {
        if (
          this.cachedFindManyRequests.get(requestKey) ===
          requestReference.current
        ) {
          this.cachedFindManyRequests.delete(requestKey)
        }
      })

    requestReference.current = request
    this.cachedFindManyRequests.set(requestKey, request)

    sortedUniqueIds.forEach((id) => this.trackIdRequest(id, request))

    return request
  }

  private trackIdRequest(
    id: string,
    request: Promise<readonly BibliographyEntry[]>,
  ): void {
    if (this.cachedFindRequests.has(id)) {
      return
    }

    const idRequestReference: { current?: Promise<BibliographyEntry> } = {}
    const idRequest = request
      .then((entries) => {
        const entry = entries.find((currentEntry) => currentEntry.id === id)
        return entry
          ? entry
          : this.bibliographyRepository
              .find(id)
              .then((resolvedEntry) => this.cacheEntry(resolvedEntry))
      })
      .finally(() => {
        if (this.cachedFindRequests.get(id) === idRequestReference.current) {
          this.cachedFindRequests.delete(id)
        }
      })

    idRequestReference.current = idRequest
    this.cachedFindRequests.set(id, idRequest)
  }
}
