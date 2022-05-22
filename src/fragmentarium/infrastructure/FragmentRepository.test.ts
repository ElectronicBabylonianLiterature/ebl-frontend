import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentRepository from './FragmentRepository'
import Folio from 'fragmentarium/domain/Folio'
import { fragment, fragmentDto } from 'test-support/test-fragment'
import { ApiError } from 'http/ApiClient'
import { annotations, annotationsDto } from 'test-support/test-annotation'
import { Genres } from 'fragmentarium/domain/Genres'
import { Text } from 'transliteration/domain/text'
import textLineFixture from 'test-support/lines/text-line'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
}
const fragmentRepository = new FragmentRepository(apiClient)

const fragmentId = 'K 23+1234'
const cdliNumber = 'P 1234'
const transliterationQuery = 'kur\nkur kur'
const transliteration = 'transliteration'
const lemmatization = [[{ value: 'kur', uniqueLemma: [] }]]
const notes = 'notes'
const resultStub = {}
const folio = new Folio({ name: 'MJG', number: 'K1' })
const word = 'šim'

const references = [
  { id: 'RN52', type: 'DISCUSSION', pages: '', notes: '', linesCited: [] },
  { id: 'RN54', type: 'COPY', pages: '', notes: '', linesCited: [] },
]

const fragmentInfo = {
  number: 'K.1',
  accession: '1234',
  script: 'NA',
  description: 'a fragment',
  matchingLines: null,
  editor: 'Editor',
  // eslint-disable-next-line camelcase
  edition_date: '2019-09-10T13:03:37.575580',
  references: [],
  genres: [],
}

const fragmentInfoWithLines = {
  number: 'K.1',
  accession: '1234',
  script: 'NA',
  description: 'a fragment',
  matchingLines: {
    lines: [textLineFixture],
  },
  editor: 'Editor',
  // eslint-disable-next-line camelcase
  edition_date: '2019-09-10T13:03:37.575580',
  references: [],
  genres: [],
}

const testData: TestData<FragmentRepository>[] = [
  new TestData(
    'statistics',
    [],
    apiClient.fetchJson,
    resultStub,
    ['/statistics', false],
    Promise.resolve(resultStub)
  ),
  new TestData(
    'lineToVecRanking',
    [fragmentId],
    apiClient.fetchJson,
    resultStub,
    [`/fragments/${encodeURIComponent(fragmentId)}/match`, true],
    Promise.resolve(resultStub)
  ),
  new TestData(
    'find',
    [fragmentId],
    apiClient.fetchJson,
    fragment,
    [`/fragments/${encodeURIComponent(fragmentId)}`, true],
    Promise.resolve(fragmentDto)
  ),
  new TestData(
    'random',
    [],
    apiClient.fetchJson,
    [fragmentInfo],
    ['/fragments?random=true', true],
    Promise.resolve([fragmentInfo])
  ),
  new TestData(
    'interesting',
    [],
    apiClient.fetchJson,
    [fragmentInfo],
    ['/fragments?interesting=true', true],
    Promise.resolve([fragmentInfo])
  ),
  new TestData(
    'fetchLatestTransliterations',
    [],
    apiClient.fetchJson,
    [fragmentInfo],
    ['/fragments?latest=true', true],
    Promise.resolve([fragmentInfo])
  ),
  new TestData(
    'fetchNeedsRevision',
    [],
    apiClient.fetchJson,
    [fragmentInfo],
    ['/fragments?needsRevision=true', true],
    Promise.resolve([fragmentInfo])
  ),
  new TestData(
    'searchFragmentarium',
    [fragmentId, '', '', ''],
    apiClient.fetchJson,
    [{ ...fragmentInfo, genres: new Genres([]) }],
    [
      `/fragments?bibliographyId=&number=${encodeURIComponent(
        fragmentId
      )}&pages=&transliteration=`,
      true,
    ],
    Promise.resolve([fragmentInfo])
  ),
  new TestData(
    'searchFragmentarium',
    ['', transliterationQuery, '', ''],
    apiClient.fetchJson,
    [
      {
        ...fragmentInfoWithLines,
        genres: new Genres([]),
        matchingLines: new Text({ lines: [textLineFixture] }),
      },
    ],
    [
      `/fragments?bibliographyId=&number=&pages=&transliteration=${encodeURIComponent(
        transliterationQuery
      )}`,
      true,
    ],
    Promise.resolve([fragmentInfoWithLines])
  ),
  new TestData(
    'updateTransliteration',
    [fragmentId, transliteration, notes],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/transliteration`,
      {
        transliteration,
        notes,
      },
    ],
    Promise.resolve(fragmentDto)
  ),
  new TestData(
    'updateLemmatization',
    [fragmentId, lemmatization],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/lemmatization`,
      { lemmatization: lemmatization },
    ],
    Promise.resolve(fragmentDto)
  ),
  new TestData(
    'updateReferences',
    [fragmentId, references],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/references`,
      { references: references },
    ],
    Promise.resolve(fragmentDto)
  ),
  new TestData(
    'folioPager',
    [folio, fragmentId],
    apiClient.fetchJson,
    resultStub,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/pager/${encodeURIComponent(
        folio.name
      )}/${encodeURIComponent(folio.number)}`,
      true,
    ],
    Promise.resolve(resultStub)
  ),
  new TestData(
    'fragmentPager',
    [fragmentId],
    apiClient.fetchJson,
    resultStub,
    [`/fragments/${encodeURIComponent(fragmentId)}/pager`, true],
    Promise.resolve(resultStub)
  ),
  new TestData(
    'findLemmas',
    [word, true],
    apiClient.fetchJson,
    resultStub,
    [`/lemmas?word=${encodeURIComponent(word)}&isNormalized=true`, true],
    Promise.resolve(resultStub)
  ),
  new TestData(
    'fetchCdliInfo',
    [cdliNumber],
    apiClient.fetchJson,
    resultStub,
    [`/cdli/${encodeURIComponent(cdliNumber)}`, true],
    Promise.resolve(resultStub)
  ),
  new TestData(
    'fetchCdliInfo',
    [cdliNumber],
    apiClient.fetchJson,
    { photoUrl: null, lineArtUrl: null, detailLineArtUrl: null },
    [`/cdli/${encodeURIComponent(cdliNumber)}`, true],
    Promise.reject(new ApiError('Error', {}))
  ),
  new TestData(
    'findAnnotations',
    [fragmentId, true],
    apiClient.fetchJson,
    annotations,
    [
      `/fragments/${encodeURIComponent(
        fragmentId
      )}/annotations?generateAnnotations=true`,
      true,
    ],
    Promise.resolve({ annotations: annotationsDto })
  ),
  new TestData(
    'findAnnotations',
    [fragmentId],
    apiClient.fetchJson,
    annotations,
    [
      `/fragments/${encodeURIComponent(
        fragmentId
      )}/annotations?generateAnnotations=false`,
      true,
    ],
    Promise.resolve({ annotations: annotationsDto })
  ),
  new TestData(
    'updateAnnotations',
    [fragmentId, annotations],
    apiClient.postJson,
    annotations,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/annotations`,
      { fragmentNumber: fragmentId, annotations: annotationsDto },
    ],
    Promise.resolve(annotations)
  ),
]

describe('FragmentRepository', () =>
  testDelegation(fragmentRepository, testData))
