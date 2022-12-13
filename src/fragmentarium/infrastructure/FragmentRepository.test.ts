import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentRepository, { createScript } from './FragmentRepository'
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
const introduction = 'Introduction'

const references = [
  { id: 'RN52', type: 'DISCUSSION', pages: '', notes: '', linesCited: [] },
  { id: 'RN54', type: 'COPY', pages: '', notes: '', linesCited: [] },
]

const script = {
  period: 'Neo-Assyrian',
  periodModifier: 'None',
  uncertain: false,
}

const fragmentInfo = {
  number: 'K.1',
  accession: '1234',
  script: script,
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
  script: script,
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
    [fragmentId, '', '', '', 0],
    apiClient.fetchJson,
    {
      fragmentInfos: [{ ...fragmentInfo, genres: new Genres([]) }],
      totalCount: 2,
    },
    [
      `/fragments?bibliographyId=&number=${encodeURIComponent(
        fragmentId
      )}&pages=&paginationIndex=0&transliteration=`,
      true,
    ],
    Promise.resolve({ fragmentInfos: [fragmentInfo], totalCount: 2 })
  ),
  new TestData(
    'searchFragmentarium',
    ['', transliterationQuery, '', '', 0],
    apiClient.fetchJson,
    {
      fragmentInfos: [
        {
          ...fragmentInfoWithLines,
          genres: new Genres([]),
          matchingLines: new Text({ lines: [textLineFixture] }),
        },
      ],
      totalCount: 2,
    },
    [
      `/fragments?bibliographyId=&number=&pages=&paginationIndex=0&transliteration=${encodeURIComponent(
        transliterationQuery
      )}`,
      true,
    ],
    Promise.resolve({ fragmentInfos: [fragmentInfoWithLines], totalCount: 2 })
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
    'updateScript',
    [fragmentId, createScript(script)],
    apiClient.postJson,
    fragment,
    [`/fragments/${encodeURIComponent(fragmentId)}/script`, { script: script }],
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
  new TestData(
    'updateIntroduction',
    [fragmentId, introduction],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/introduction`,
      { introduction: introduction },
    ],
    Promise.resolve(fragmentDto)
  ),
]

describe('FragmentRepository', () =>
  testDelegation(fragmentRepository, testData))
