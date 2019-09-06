// @flow
import Promise from 'bluebird'
import queryString from 'query-string'
import { fromJS, List } from 'immutable'
import {
  Fragment,
  Measures,
  RecordEntry,
  Line,
  Text,
  Folio,
  UncuratedReference
} from './fragment'
import type { FragmentInfo } from './fragment'

function createMeasures(dto) {
  return Measures({
    length: dto.length.value,
    width: dto.width.value,
    thickness: dto.thickness.value
  })
}

function createText(dto) {
  return new Text({
    lines: List(dto.text.lines).map(dto =>
      Line({
        ...dto,
        content: List(dto.content).map(token => fromJS(token))
      })
    )
  })
}

function createUncuratedReferences(dto) {
  return (
    dto.uncuratedReferences &&
    List(dto.uncuratedReferences).map(reference =>
      UncuratedReference({
        document: reference.document,
        pages: List(reference.pages)
      })
    )
  )
}

function createMatchingLines(dto) {
  return dto.matching_lines
    ? List(dto.matching_lines).map(line => fromJS(line))
    : List()
}

function createFragment(dto) {
  return new Fragment({
    ...dto,
    number: dto._id,
    joins: List(dto.joins),
    measures: createMeasures(dto),
    folios: List(dto.folios).map(folioDto => new Folio(folioDto)),
    record: List(dto.record).map(recordDto => new RecordEntry(recordDto)),
    text: createText(dto),
    references: List(dto.references).map(reference => fromJS(reference)),
    uncuratedReferences: createUncuratedReferences(dto),
    matchingLines: createMatchingLines(dto)
  })
}

function createFragmentPath(number, ...subResources) {
  return ['/fragments', encodeURIComponent(number), ...subResources].join('/')
}

class FragmentRepository {
  +apiClient

  constructor(apiClient: {
    fetchJson: (string, boolean) => Promise<any>,
    postJson: (string, any) => Promise<any>
  }) {
    this.apiClient = apiClient
  }

  statistics() {
    return this.apiClient.fetchJson(`/statistics`, false)
  }

  find(number: string) {
    return this.apiClient
      .fetchJson(createFragmentPath(number), true)
      .then(createFragment)
  }

  random(): $ReadOnlyArray<FragmentInfo> {
    return this._fetch({ random: true })
  }

  interesting(): $ReadOnlyArray<FragmentInfo> {
    return this._fetch({ interesting: true })
  }

  fetchLatestTransliterations(): $ReadOnlyArray<FragmentInfo> {
    return this._fetch({ latest: true })
  }

  searchNumber(number: string): $ReadOnlyArray<FragmentInfo> {
    return this._fetch({ number })
  }

  searchTransliteration(transliteration: string): $ReadOnlyArray<FragmentInfo> {
    return this._fetch({ transliteration })
  }

  _fetch(params: any): Promise<$ReadOnlyArray<FragmentInfo>> {
    return this.apiClient
      .fetchJson(`/fragments?${queryString.stringify(params)}`, true)
      .then(infos =>
        infos.map(info => ({
          number: info.number || info._id,
          accession: info.accession,
          script: info.script,
          description: info.description,
          matchingLines: info.matchingLines || info.matching_lines || []
        }))
      )
  }

  updateTransliteration(
    number: string,
    transliteration: string,
    notes: string
  ) {
    const path = createFragmentPath(number, 'transliteration')
    return this.apiClient
      .postJson(path, {
        transliteration: transliteration,
        notes: notes
      })
      .then(createFragment)
  }

  updateLemmatization(number: string, lemmatization: string) {
    const path = createFragmentPath(number, 'lemmatization')
    return this.apiClient
      .postJson(path, { lemmatization: lemmatization })
      .then(createFragment)
  }

  updateReferences(number: string, references: string) {
    const path = createFragmentPath(number, 'references')
    return this.apiClient
      .postJson(path, { references: references })
      .then(createFragment)
  }

  folioPager(folio: Folio, number: string) {
    return this.apiClient.fetchJson(
      `/pager/folios/${encodeURIComponent(folio.name)}/${encodeURIComponent(
        folio.number
      )}/${encodeURIComponent(number)}`,
      true
    )
  }

  findLemmas(word: string) {
    return this.apiClient.fetchJson(
      `/lemmas?word=${encodeURIComponent(word)}`,
      true
    )
  }
}

export default FragmentRepository
