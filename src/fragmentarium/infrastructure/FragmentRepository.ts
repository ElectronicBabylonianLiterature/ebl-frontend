import Promise from 'bluebird'
import { stringify } from 'query-string'
import { Fragment, RecordEntry, Folio } from 'fragmentarium/domain/fragment'
import { Text } from 'fragmentarium/domain/text'
import Museum from 'fragmentarium/domain/museum'
import {
  FragmentRepository,
  CdliInfo,
  AnnotationRepository
} from 'fragmentarium/application/FragmentService'
import Annotation from 'fragmentarium/domain/annotation'
import {
  FragmentInfosPromise,
  FragmentInfoRepository
} from 'fragmentarium/application/FragmentSearchService'

function createFragment(dto): Fragment {
  return new Fragment({
    ...dto,
    number: dto._id,
    museum: Museum.of(dto.museum),
    joins: dto.joins,
    measures: {
      length: dto.length.value || null,
      width: dto.width.value || null,
      thickness: dto.thickness.value || null
    },
    folios: dto.folios.map(folioDto => new Folio(folioDto)),
    record: dto.record.map(recordDto => new RecordEntry(recordDto)),
    text: new Text({ lines: dto.text.lines }),
    references: dto.references,
    uncuratedReferences: dto.uncuratedReferences
  })
}

function createFragmentPath(number, ...subResources) {
  return ['/fragments', encodeURIComponent(number), ...subResources].join('/')
}

class ApiFragmentRepository
  implements FragmentInfoRepository, FragmentRepository, AnnotationRepository {
  readonly apiClient

  constructor(apiClient: {
    fetchJson: (url: string, authorize: boolean) => Promise<any>
    postJson: (url: string, body: any) => Promise<any>
  }) {
    this.apiClient = apiClient
  }

  statistics() {
    return this.apiClient.fetchJson(`/statistics`, false)
  }

  find(number: string): Promise<Fragment> {
    return this.apiClient
      .fetchJson(createFragmentPath(number), true)
      .then(createFragment)
  }

  random(): FragmentInfosPromise {
    return this._fetch({ random: true })
  }

  interesting(): FragmentInfosPromise {
    return this._fetch({ interesting: true })
  }

  fetchLatestTransliterations(): FragmentInfosPromise {
    return this._fetch({ latest: true })
  }

  fetchNeedsRevision(): FragmentInfosPromise {
    return this._fetch({ needsRevision: true })
  }

  searchNumber(number: string): FragmentInfosPromise {
    return this._fetch({ number })
  }

  searchTransliteration(transliteration: string): FragmentInfosPromise {
    return this._fetch({ transliteration })
  }

  _fetch(params: any): FragmentInfosPromise {
    return this.apiClient.fetchJson(`/fragments?${stringify(params)}`, true)
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

  updateLemmatization(number: string, lemmatization: {}) {
    const path = createFragmentPath(number, 'lemmatization')
    return this.apiClient
      .postJson(path, { lemmatization: lemmatization })
      .then(createFragment)
  }

  updateReferences(number: string, references: {}) {
    const path = createFragmentPath(number, 'references')
    return this.apiClient
      .postJson(path, { references: references })
      .then(createFragment)
  }

  folioPager(folio: Folio, number: string) {
    return this.apiClient.fetchJson(
      `/fragments/${encodeURIComponent(number)}/pager/${encodeURIComponent(
        folio.name
      )}/${encodeURIComponent(folio.number)}`,
      true
    )
  }

  fragmentPager(fragmentNumber: string) {
    return this.apiClient.fetchJson(
      `/fragments/${encodeURIComponent(fragmentNumber)}/pager`,
      true
    )
  }

  findLemmas(word: string) {
    return this.apiClient.fetchJson(
      `/lemmas?word=${encodeURIComponent(word)}`,
      true
    )
  }

  fetchCdliInfo(cdliNumber: string): Promise<CdliInfo> {
    return this.apiClient
      .fetchJson(`/cdli/${encodeURIComponent(cdliNumber)}`, true)
      .catch((error: Error) => {
        if (error.name === 'ApiError') {
          return { photoUrl: null, lineArtUrl: null, detailLineArtUrl: null }
        } else {
          throw error
        }
      })
  }

  findAnnotations(number: string): Promise<readonly Annotation[]> {
    return this.apiClient.fetchJson(
      `${createFragmentPath(number)}/annotations`,
      true
    )
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[]
  ): Promise<readonly Annotation[]> {
    return this.apiClient.postJson(
      `${createFragmentPath(number)}/annotations`,
      {
        fragmentNumber: number,
        annotations: annotations
      }
    )
  }
}

export default ApiFragmentRepository
