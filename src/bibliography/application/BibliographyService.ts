import Promise from 'bluebird'
import BibliographyBatchLoader, {
  isNotFoundError,
} from 'bibliography/application/BibliographyBatchLoader'
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

interface MutationWinner {
  readonly sequence: number
  readonly entry: BibliographyEntry
}

export default class BibliographyService implements BibliographySearch {
  private readonly bibliographyRepository: BibliographyRepository
  private cacheScope: string | null = null
  private cacheGeneration = 0
  private scopeGeneration = 0
  private mutationSequence = 0
  private readonly mutationWinners = new Map<string, MutationWinner>()
  private readonly cachedEntries = new Map<
    string,
    CacheEntry<BibliographyEntry>
  >()
  private readonly cachedFindRequests = new Map<
    string,
    Promise<BibliographyEntry>
  >()

  private readonly batchLoader: BibliographyBatchLoader
  constructor(
    bibliographyRepository: BibliographyRepository,
    private readonly getCacheScope: () => string = () => defaultCacheScope,
  ) {
    this.bibliographyRepository = bibliographyRepository
    this.batchLoader = new BibliographyBatchLoader(
      bibliographyRepository,
      (id, entry, generation) => {
        this.cacheEntryForGeneration(id, entry, generation)
      },
    )
  }

  create(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.mutate(() => this.bibliographyRepository.create(entry))
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

    const inFlightBatchRequest = this.batchLoader.findInFlight(id)
    if (inFlightBatchRequest) {
      return inFlightBatchRequest
    }

    const requestReference: { current?: Promise<BibliographyEntry> } = {}
    const generation = this.cacheGeneration
    const request = this.bibliographyRepository
      .find(id)
      .then((entry) =>
        generation === this.cacheGeneration &&
        this.cachedFindRequests.get(id) === requestReference.current
          ? this.cacheEntry(id, entry)
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
    return this.findManyById(ids).then((entriesById) =>
      ids
        .map((id) => entriesById.get(id))
        .filter((entry): entry is BibliographyEntry => entry !== undefined),
    )
  }

  findManyById(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    this.clearCachesWhenScopeChanges()

    const uniqueIds = _.uniq(ids)
    if (_.isEmpty(uniqueIds)) {
      return Promise.resolve(new Map<string, BibliographyEntry>())
    }

    return this.loadEntriesByIds(uniqueIds)
  }

  update(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.mutate(() => this.bibliographyRepository.update(entry))
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

      const directFindRequest = this.cachedFindRequests.get(id)
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
      : this.batchLoader.load(missingIds, this.cacheGeneration)

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

  private mutate(
    request: () => Promise<BibliographyEntry>,
  ): Promise<BibliographyEntry> {
    this.clearCachesWhenScopeChanges()
    const scopeGeneration = this.scopeGeneration
    const sequence = ++this.mutationSequence
    return request().then((entry) => {
      this.clearCachesWhenScopeChanges()
      if (scopeGeneration === this.scopeGeneration) {
        this.applyMutation(sequence, entry)
      }
      return entry
    })
  }

  private applyMutation(sequence: number, entry: BibliographyEntry): void {
    this.invalidateEntryCaches(entry.id)
    const currentWinner = this.mutationWinners.get(entry.id)
    const winner =
      currentWinner && currentWinner.sequence > sequence
        ? currentWinner
        : { sequence, entry }
    this.mutationWinners.set(entry.id, winner)
    this.cacheEntry(entry.id, winner.entry)
  }

  private cacheEntryForGeneration(
    id: string,
    entry: BibliographyEntry,
    generation: number,
  ): BibliographyEntry {
    return generation === this.cacheGeneration
      ? this.cacheEntry(id, entry)
      : entry
  }

  private cacheEntry(id: string, entry: BibliographyEntry): BibliographyEntry {
    return setCachedValue({
      cache: this.cachedEntries,
      key: id,
      value: entry,
      maximumCacheSize: maximumCachedEntries,
      cacheEntryLifetimeInMilliseconds,
    })
  }

  private invalidateEntryCaches(id: string): void {
    this.invalidateInFlightRequests()
    this.cachedEntries.forEach((cachedEntry, key) => {
      if (cachedEntry.value.id === id) {
        this.cachedEntries.delete(key)
      }
    })
  }

  private invalidateCaches(): void {
    this.invalidateInFlightRequests()
    this.cachedEntries.clear()
    this.mutationWinners.clear()
  }

  private invalidateInFlightRequests(): void {
    this.cacheGeneration += 1
    this.cachedFindRequests.clear()
    this.batchLoader.clear()
  }

  private clearCachesWhenScopeChanges(): void {
    const nextScope = this.resolveCacheScope()
    if (this.cacheScope === null) {
      this.cacheScope = nextScope
      return
    }

    if (this.cacheScope !== nextScope) {
      this.cacheScope = nextScope
      this.scopeGeneration += 1
      this.invalidateCaches()
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
