import Promise from 'bluebird'
import BibliographyCache from 'bibliography/application/BibliographyCache'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'

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
  private scopeGeneration = 0
  private mutationSequence = 0
  private readonly mutationWinners = new Map<string, MutationWinner>()
  private readonly cache: BibliographyCache

  constructor(
    bibliographyRepository: BibliographyRepository,
    private readonly getCacheScope: () => string = () => defaultCacheScope,
  ) {
    this.bibliographyRepository = bibliographyRepository
    this.cache = new BibliographyCache(bibliographyRepository)
  }

  create(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.mutate(() => this.bibliographyRepository.create(entry))
  }

  find(id: string): Promise<BibliographyEntry> {
    this.clearCachesWhenScopeChanges()
    return this.cache.find(id)
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
    return this.cache.findManyById(ids)
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
    this.cache.invalidateEntryCaches(entry.id)
    const currentWinner = this.mutationWinners.get(entry.id)
    const winner =
      currentWinner && currentWinner.sequence > sequence
        ? currentWinner
        : { sequence, entry }
    this.mutationWinners.set(entry.id, winner)
    this.cache.cacheEntry(entry.id, winner.entry)
  }

  private invalidateCaches(): void {
    this.cache.clear()
    this.mutationWinners.clear()
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
