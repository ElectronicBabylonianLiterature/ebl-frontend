import BibliographyEntryLoader, {
  defaultCacheScope,
} from 'bibliography/application/BibliographyEntryLoader'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'

export interface BibliographySearch {
  search(
    query: string,
    signal?: AbortSignal,
  ): Promise<readonly BibliographyEntry[]>
}

interface MutationState {
  pending: number
  winner?: { readonly sequence: number; readonly entry: BibliographyEntry }
}

export default class BibliographyService implements BibliographySearch {
  private readonly bibliographyRepository: BibliographyRepository
  private cacheScope: string | null = null
  private scopeGeneration = 0
  private mutationSequence = 0
  private readonly mutations = new Map<string, MutationState>()
  private readonly cache: BibliographyEntryLoader

  constructor(
    bibliographyRepository: BibliographyRepository,
    private readonly getCacheScope: () => string = () => defaultCacheScope,
  ) {
    this.bibliographyRepository = bibliographyRepository
    this.cache = new BibliographyEntryLoader(bibliographyRepository)
  }

  create(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.mutate(entry.id, () =>
      this.bibliographyRepository.create(entry),
    )
  }

  find(id: string): Promise<BibliographyEntry> {
    this.clearCachesWhenScopeChanges()
    return this.cache.find(id)
  }

  findManyById(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, BibliographyEntry>> {
    this.clearCachesWhenScopeChanges()
    return this.cache.findManyById(ids)
  }

  update(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.mutate(entry.id, () =>
      this.bibliographyRepository.update(entry),
    )
  }

  search(
    query: string,
    signal?: AbortSignal,
  ): Promise<readonly BibliographyEntry[]> {
    return this.bibliographyRepository.search(query, signal)
  }

  listAllBibliography(): Promise<string[]> {
    return this.bibliographyRepository.listAllBibliography()
  }

  private mutate(
    id: string,
    request: () => Promise<BibliographyEntry>,
  ): Promise<BibliographyEntry> {
    this.clearCachesWhenScopeChanges()
    const scopeGeneration = this.scopeGeneration
    const sequence = ++this.mutationSequence
    const state = this.mutations.get(id) ?? { pending: 0 }
    state.pending += 1
    this.mutations.set(id, state)
    return request()
      .then((entry) => {
        this.clearCachesWhenScopeChanges()
        if (scopeGeneration === this.scopeGeneration) {
          const winner = state.winner
          const winningMutation =
            !winner || winner.sequence < sequence ? { sequence, entry } : winner
          state.winner = winningMutation
          this.cache.cacheUpdatedEntry(winningMutation.entry)
        }
        return entry
      })
      .finally(() => {
        state.pending -= 1
        if (state.pending === 0 && this.mutations.get(id) === state) {
          this.mutations.delete(id)
        }
      })
  }

  private invalidateCaches(): void {
    this.cache.clear()
    this.mutations.clear()
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
