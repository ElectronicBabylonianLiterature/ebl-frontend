import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import _ from 'lodash'
import BibliographyEntryLoader, {
  defaultCacheScope,
} from 'bibliography/application/BibliographyEntryLoader'

export interface BibliographySearch {
  search(
    query: string,
    signal?: AbortSignal,
  ): Promise<readonly BibliographyEntry[]>
}

export default class BibliographyService implements BibliographySearch {
  private readonly bibliographyRepository: BibliographyRepository
  private readonly entryLoader: BibliographyEntryLoader

  private cacheScope: string | null = null

  constructor(
    bibliographyRepository: BibliographyRepository,
    private readonly getCacheScope: () => string = () => defaultCacheScope,
  ) {
    this.bibliographyRepository = bibliographyRepository
    this.entryLoader = new BibliographyEntryLoader(bibliographyRepository)
  }

  create(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.bibliographyRepository
      .create(entry)
      .then((createdEntry) => this.cacheUpdatedEntry(createdEntry))
  }

  find(id: string): Promise<BibliographyEntry> {
    this.clearCachesWhenScopeChanges()
    return this.entryLoader.find(id)
  }

  findMany(ids: readonly string[]): Promise<readonly BibliographyEntry[]> {
    this.clearCachesWhenScopeChanges()

    const uniqueIds = _.uniq(ids)
    if (_.isEmpty(uniqueIds)) {
      return Promise.resolve([])
    }

    return this.entryLoader
      .loadEntriesByIds(uniqueIds)
      .then((entriesById) =>
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

  search(
    query: string,
    signal?: AbortSignal,
  ): Promise<readonly BibliographyEntry[]> {
    return this.bibliographyRepository.search(query, signal)
  }

  listAllBibliography(): Promise<string[]> {
    return this.bibliographyRepository.listAllBibliography()
  }

  private cacheUpdatedEntry(entry: BibliographyEntry): BibliographyEntry {
    this.clearCachesWhenScopeChanges()
    return this.entryLoader.cacheUpdatedEntry(entry)
  }

  private clearCachesWhenScopeChanges(): void {
    const nextScope = this.resolveCacheScope()
    if (this.cacheScope === null) {
      this.cacheScope = nextScope
      return
    }

    if (this.cacheScope !== nextScope) {
      this.cacheScope = nextScope
      this.entryLoader.clear()
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
