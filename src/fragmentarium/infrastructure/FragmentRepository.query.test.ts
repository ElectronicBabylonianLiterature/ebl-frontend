import { testDelegation, TestData } from 'test-support/utils'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import { fragment, fragmentDto } from 'test-support/test-fragment'
import { stringify } from 'querystring'
import { FragmentQuery } from 'query/FragmentQuery'
import {
  createFragmentRepositoryTestContext,
  fragmentId,
  lemmas,
  queryResult,
  queryResultDto,
} from 'fragmentarium/infrastructure/FragmentRepository.testSupport'

const { apiClient, fragmentRepository } = createFragmentRepositoryTestContext()

const fragmentAfoRegisterQueryResult = {
  items: [
    {
      traditionalReference: fragment.traditionalReferences[0],
      fragmentNumbers: [fragment.number],
    },
  ],
}

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
      undefined,
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
