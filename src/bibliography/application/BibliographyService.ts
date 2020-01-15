import Promise from 'bluebird'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

export interface BibliographySearch {
  search(query: string): Promise<readonly BibliographyEntry[]>
}

export default class BibliographyService implements BibliographySearch {
  private readonly bibliographyRepository

  constructor(bibliographyRepository) {
    this.bibliographyRepository = bibliographyRepository
  }

  create(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.bibliographyRepository.create(entry)
  }

  find(id: string): Promise<BibliographyEntry> {
    return this.bibliographyRepository.find(id)
  }

  update(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.bibliographyRepository.update(entry)
  }

  search(query: string): Promise<readonly BibliographyEntry[]> {
    const queryRegex = /^([^\d]+)(?: (\d{4})(?: (.*))?)?$/
    const match = queryRegex.exec(query)
    return match
      ? this.bibliographyRepository.search(
          match[1],
          match[2] || '',
          match[3] || ''
        )
      : Promise.resolve([])
  }
}
