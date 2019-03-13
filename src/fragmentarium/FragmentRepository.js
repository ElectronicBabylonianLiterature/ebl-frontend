import queryString from 'query-string'
import { fromJS, List } from 'immutable'
import { Fragment, Measures, Measure, RecordEntry, Line, Text, Folio } from 'fragmentarium/fragment'

function createFragment (dto) {
  return new Fragment({
    ...dto,
    number: dto._id,
    measures: new Measures({
      length: new Measure(dto.length),
      width: new Measure(dto.width),
      thickness: new Measure(dto.thickness)
    }),
    folios: dto.folios.map(folioDto => new Folio(folioDto)),
    record: dto.record.map(recordEntryDto => new RecordEntry(recordEntryDto)),
    text: new Text({ lines: List(dto.text.lines).map(lineDto => new Line(lineDto)) }),
    references: dto.references.map(reference => fromJS(reference)),
    matchingLines: dto.matching_lines
      ? dto.matching_lines.map(line => fromJS(line))
      : []
  })
}

function createFragments (dtos) {
  return dtos.map(createFragment)
}

function createFragmentPath (number, ...subResources) {
  return [
    '/fragments',
    encodeURIComponent(number),
    ...subResources
  ].join('/')
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
      .fetchJson(createFragmentPath(number), true)
      .then(createFragment)
  }

  random () {
    return this._fetch({ random: true })
  }

  interesting () {
    return this._fetch({ interesting: true })
  }

  fetchLatestTransliterations () {
    return this._fetch({ latest: true })
  }

  searchNumber (number) {
    return this._fetch({ number })
  }

  searchTransliteration (transliteration) {
    return this._fetch({ transliteration })
  }

  _fetch (params) {
    return this.apiClient
      .fetchJson(`/fragments?${queryString.stringify(params)}`, true)
      .then(createFragments)
  }

  updateTransliteration (number, transliteration, notes) {
    const path = createFragmentPath(number, 'transliteration')
    return this.apiClient.postJson(
      path,
      {
        transliteration: transliteration,
        notes: notes
      }
    ).then(createFragment)
  }

  updateLemmatization (number, lemmatization) {
    const path = createFragmentPath(number, 'lemmatization')
    return this.apiClient
      .postJson(path, { lemmatization: lemmatization })
      .then(createFragment)
  }

  updateReferences (number, references) {
    const path = createFragmentPath(number, 'references')
    return this.apiClient
      .postJson(path, { references: references })
      .then(createFragment)
  }

  folioPager (folio, number) {
    return this.apiClient
      .fetchJson(`/pager/folios/${encodeURIComponent(folio.name)}/${encodeURIComponent(folio.number)}/${encodeURIComponent(number)}`, true)
  }

  findLemmas (word) {
    return this.apiClient
      .fetchJson(`/lemmas?word=${encodeURIComponent(word)}`, true)
  }
}

export default FragmentRepository
