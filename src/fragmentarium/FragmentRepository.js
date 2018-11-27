import createFolio from 'fragmentarium/createFolio'

function createFragment (dto) {
  return {
    ...dto,
    folios: dto.folios.map(({ name, number }) => createFolio(name, number))
  }
}

function createFragments (dtos) {
  return dtos.map(createFragment)
}

class FragmentRepository {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  statistics () {
    return this.apiClient.fetchJson(`/statistics`, false)
  }

  find (number) {
    return this.apiClient
      .fetchJson(`/fragments/${encodeURIComponent(number)}`, true)
      .then(createFragment)
  }

  random () {
    return this.apiClient
      .fetchJson(`/fragments?random=true`, true)
      .then(createFragments)
  }

  interesting () {
    return this.apiClient
      .fetchJson(`/fragments?interesting=true`, true)
      .then(createFragments)
  }

  searchNumber (number) {
    return this.apiClient
      .fetchJson(`/fragments?number=${encodeURIComponent(number)}`, true)
      .then(createFragments)
  }

  searchTransliteration (transliteration) {
    return this.apiClient
      .fetchJson(`/fragments?transliteration=${encodeURIComponent(transliteration)}`, true)
      .then(createFragments)
  }

  updateTransliteration (number, transliteration, notes) {
    const path = `/fragments/${encodeURIComponent(number)}/transliteration`
    return this.apiClient.postJson(
      path,
      {
        transliteration: transliteration,
        notes: notes
      }
    )
  }

  updateLemmatization (number, lemmatization) {
    const path = `/fragments/${encodeURIComponent(number)}/lemmatization`
    return this.apiClient.postJson(path, lemmatization)
  }

  folioPager (folio, number) {
    return this.apiClient
      .fetchJson(`/pager/folios/${encodeURIComponent(folio.name)}/${encodeURIComponent(folio.number)}/${encodeURIComponent(number)}`, true)
  }
}

export default FragmentRepository
