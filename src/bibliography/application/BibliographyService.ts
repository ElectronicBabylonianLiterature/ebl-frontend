import Promise from 'bluebird'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'

export interface BibliographySearch {
  search(query: string): Promise<readonly BibliographyEntry[]>
}

export default class BibliographyService implements BibliographySearch {
  private readonly bibliographyRepository: BibliographyRepository

  constructor(bibliographyRepository: BibliographyRepository) {
    this.bibliographyRepository = bibliographyRepository
  }

  create(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.bibliographyRepository.create(entry)
  }

  find(id: string): Promise<BibliographyEntry> {
    return this.bibliographyRepository.find(id)
  }

  findMany(ids: readonly string[]): Promise<readonly BibliographyEntry[]> {
    return this.bibliographyRepository.findMany(ids)
  }

  update(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.bibliographyRepository.update(entry)
  }

  search(query: string): Promise<readonly BibliographyEntry[]> {
    return this.bibliographyRepository.search(query)
  }

  listAllBibliography(): Promise<string[]> {
    return this.bibliographyRepository.listAllBibliography()
  }
}
