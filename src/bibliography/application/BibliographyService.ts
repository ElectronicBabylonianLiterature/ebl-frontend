import Promise from 'bluebird'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import _ from 'lodash'
import { CacheEntry, getCachedValue, setCachedValue } from 'common/utils/cache'

const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
const maximumCachedEntries = 500
const defaultCacheScope = 'default'

export interface BibliographySearch {
  search(query: string): Promise<readonly BibliographyEntry[]>
}

export default class BibliographyService implements BibliographySearch {
  private readonly bibliographyRepository: BibliographyRepository

  private cacheScope: string | null = null

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
    bibliographyRepository: BibliographyRepository,
    private readonly getCacheScope: () => string = () => defaultCacheScope,
  ) {
    this.bibliographyRepository = bibliographyRepository
  }

  create(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.bibliographyRepository
      .create(entry)
      .then((createdEntry) => this.cacheUpdatedEntry(createdEntry))
  }

  find(id: string): Promise<BibliographyEntry> {
    this.clearCachesWhenScopeChanges()

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
          ? setCachedValue({
              cache: this.cachedEntries,
              key: id,
              value: entry,
              maximumCacheSize: maximumCachedEntries,
              cacheEntryLifetimeInMilliseconds,
            })
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

  findMany(ids: readonly string[]): Promise<readonly BibliographyEntry[]> {
    this.clearCachesWhenScopeChanges()

    const uniqueIds = _.uniq(ids)
    if (_.isEmpty(uniqueIds)) {
      return Promise.resolve([])
    }

    return this.loadEntriesByIds(uniqueIds).then((entriesById) =>
      ids
        .map((id) => entriesById.get(id))
        .filter((entry): entry is BibliographyEntry => entry !== undefined),
    )
  }

  update(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.bibliographyRepository
      .update(entry)
      .then((updatedEntry) => this.cacheUpdatedEntry(updatedEntry))
  }

  search(query: string): Promise<readonly BibliographyEntry[]> {
    return this.bibliographyRepository.search(query)
  }

  listAllBibliography(): Promise<string[]> {
    return this.bibliographyRepository.listAllBibliography()
  }

  private loadEntriesByIds(
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
        entries.forEach((entry) => {
          setCachedValue({
            cache: this.cachedEntries,
            key: entry.id,
            value: entry,
            maximumCacheSize: maximumCachedEntries,
            cacheEntryLifetimeInMilliseconds,
          })
        })

        const entriesById = _.keyBy(entries, 'id')
        return Promise.all(
          sortedUniqueIds.map((id) => {
            const entry = entriesById[id]
            return entry
              ? entry
              : this.bibliographyRepository.find(id).then((resolvedEntry) =>
                  setCachedValue({
                    cache: this.cachedEntries,
                    key: resolvedEntry.id,
                    value: resolvedEntry,
                    maximumCacheSize: maximumCachedEntries,
                    cacheEntryLifetimeInMilliseconds,
                  }),
                )
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

    sortedUniqueIds.forEach((id) => {
      if (this.cachedFindRequests.has(id)) {
        return
      }

      const idRequestReference: { current?: Promise<BibliographyEntry> } = {}
      const idRequest = request
        .then((entries) => {
          const entry = entries.find((currentEntry) => currentEntry.id === id)
          return entry
            ? entry
            : this.bibliographyRepository.find(id).then((resolvedEntry) =>
                setCachedValue({
                  cache: this.cachedEntries,
                  key: resolvedEntry.id,
                  value: resolvedEntry,
                  maximumCacheSize: maximumCachedEntries,
                  cacheEntryLifetimeInMilliseconds,
                }),
              )
        })
        .finally(() => {
          if (this.cachedFindRequests.get(id) === idRequestReference.current) {
            this.cachedFindRequests.delete(id)
          }
        })

      idRequestReference.current = idRequest
      this.cachedFindRequests.set(id, idRequest)
    })

    return request
  }

  private cacheUpdatedEntry(entry: BibliographyEntry): BibliographyEntry {
    this.clearCachesWhenScopeChanges()
    this.cachedFindManyRequests.clear()
    setCachedValue({
      cache: this.cachedEntries,
      key: entry.id,
      value: entry,
      maximumCacheSize: maximumCachedEntries,
      cacheEntryLifetimeInMilliseconds,
    })
    return entry
  }

  private clearAllCaches(): void {
    this.cachedEntries.clear()
    this.cachedFindRequests.clear()
    this.cachedFindManyRequests.clear()
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
