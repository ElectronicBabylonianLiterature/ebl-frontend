import Promise from 'bluebird'

export default class BibliographyService {
  #bibliographyRepository

  constructor(bibliographyRepository) {
    this.#bibliographyRepository = bibliographyRepository
  }

  create(entry) {
    return this.#bibliographyRepository.create(entry)
  }

  find(id) {
    return this.#bibliographyRepository.find(id)
  }

  update(entry) {
    return this.#bibliographyRepository.update(entry)
  }

  search(query) {
    const queryRegex = /^([^\d]+)(?: (\d{4})(?: (.*))?)?$/
    const match = queryRegex.exec(query)
    return match
      ? this.#bibliographyRepository.search(
          match[1],
          match[2] || '',
          match[3] || ''
        )
      : Promise.resolve([])
  }
}
