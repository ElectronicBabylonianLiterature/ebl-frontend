import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import { fragment, fragmentDto } from 'test-support/test-fragment'
import { stringify } from 'querystring'
import { FragmentQuery } from 'query/FragmentQuery'
import {
  apiClient,
  fragmentAfoRegisterQueryResult,
  fragmentId,
  fragmentRepository,
  lemmas,
  queryResult,
  queryResultDto,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

const queryTestCases: FragmentQuery[] = [
  { lemmas: 'foo I' },
  { lemmaOperator: 'and', lemmas: lemmas },
  { lemmaOperator: 'or', lemmas: lemmas },
  { lemmaOperator: 'line', lemmas: lemmas },
  { lemmaOperator: 'phrase', lemmas: lemmas },
  { transliteration: 'me lik' },
  { bibId: 'foo' },
  { bibId: 'foo', pages: '1-2' },
  { number: 'X.1' },
  { latest: true },
]

const queryTestData: TestData<FragmentRepository>[] = queryTestCases.map(
  (query) =>
    new TestData(
      'query',
      [query],
      apiClient.fetchJson,
      queryResult,
      [`/fragments/query?${stringify(query)}`, false],
      Promise.resolve(queryResultDto),
    ),
)

describe('Query FragmentRepository', () =>
  testDelegation(fragmentRepository, queryTestData))

describe('FragmentRepository queryLatest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps latest query result', async () => {
    apiClient.fetchJson.mockResolvedValueOnce(queryResultDto)

    await expect(fragmentRepository.queryLatest()).resolves.toEqual(queryResult)
    expect(apiClient.fetchJson).toHaveBeenCalledWith('/fragments/latest', false)
  })

  it('maps prefetched fragment from query item payload', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      matchCountTotal: 1,
      items: [
        {
          museumNumber: fragmentDto.museumNumber,
          matchingLines: [],
          matchCount: 0,
          fragment: fragmentDto,
        },
      ],
    })

    const latestQueryResult = await fragmentRepository.queryLatest()
    const latestQueryItem = latestQueryResult.items[0] as {
      museumNumber: string
      fragment?: { number: string }
    }

    expect(latestQueryItem.museumNumber).toEqual(fragment.number)
    expect(latestQueryItem.fragment?.number).toEqual(fragment.number)
  })

  it('maps prefetched fragment from top-level fragments payload', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      matchCountTotal: 1,
      items: [
        {
          museumNumber: fragmentDto.museumNumber,
          matchingLines: [],
          matchCount: 0,
        },
      ],
      fragments: [fragmentDto],
    })

    const latestQueryResult = await fragmentRepository.queryLatest()
    const latestQueryItem = latestQueryResult.items[0] as {
      museumNumber: string
      fragment?: { number: string }
    }

    expect(latestQueryItem.museumNumber).toEqual(fragment.number)
    expect(latestQueryItem.fragment?.number).toEqual(fragment.number)
  })
})

const queryByTraditionalReferencesTestData: TestData<FragmentRepository>[] = [
  new TestData(
    'queryByTraditionalReferences',
    ['text 1'],
    apiClient.postJson,
    fragmentAfoRegisterQueryResult,
    [
      `/fragments/query-by-traditional-references`,
      { traditionalReferences: 'text 1' },
      false,
    ],
    Promise.resolve(fragmentAfoRegisterQueryResult),
  ),
]

describe('Query FragmentRepository by traditional references', () =>
  testDelegation(fragmentRepository, queryByTraditionalReferencesTestData))

describe('FragmentRepository findInCorpus', () => {
  test('Defaults missing arrays to empty lists', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({})

    await expect(fragmentRepository.findInCorpus(fragmentId)).resolves.toEqual({
      manuscriptAttestations: [],
      uncertainFragmentAttestations: [],
    })

    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      `/fragments/${encodeURIComponent(fragmentId)}/corpus`,
      false,
    )
  })

  test('Handles missing uncertainFragmentAttestations array', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      manuscriptAttestations: [],
    })

    await expect(fragmentRepository.findInCorpus(fragmentId)).resolves.toEqual({
      manuscriptAttestations: [],
      uncertainFragmentAttestations: [],
    })
  })
})

describe('FragmentRepository provenances', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('fetches provenance list', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])

    await expect(fragmentRepository.fetchProvenances()).resolves.toEqual([])
    expect(apiClient.fetchJson).toHaveBeenCalledWith('/provenances', false)
  })

  test('fetches provenance by id', async () => {
    const record = {
      id: 'uruk',
      longName: 'Uruk',
      abbreviation: 'Urk',
      parent: 'Babylonia',
      sortKey: 10,
      polygonCoordinates: [
        { latitude: 31.3, longitude: 45.6 },
        { latitude: 31.35, longitude: 45.63 },
        { latitude: 31.32, longitude: 45.67 },
      ],
    }
    apiClient.fetchJson.mockResolvedValueOnce(record)

    await expect(fragmentRepository.fetchProvenance('uruk')).resolves.toEqual(
      record,
    )
    expect(apiClient.fetchJson).toHaveBeenCalledWith('/provenances/uruk', false)
  })

  test('fetches provenance children by id', async () => {
    const records = [
      {
        id: 'babylon',
        longName: 'Babylon',
        abbreviation: 'Bab',
        parent: 'Babylonia',
        sortKey: 10,
        coordinates: {
          latitude: 32.54,
          longitude: 44.42,
        },
      },
    ]
    apiClient.fetchJson.mockResolvedValueOnce(records)

    await expect(
      fragmentRepository.fetchProvenanceChildren('babylonia'),
    ).resolves.toEqual(records)
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/provenances/babylonia/children',
      false,
    )
  })
})
