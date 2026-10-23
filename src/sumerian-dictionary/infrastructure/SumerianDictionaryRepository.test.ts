import ApiClient from 'http/ApiClient'
import SumerianDictionaryRepository from 'sumerian-dictionary/infrastructure/SumerianDictionaryRepository'
import {
  fullWordDto,
  minimalWordDto,
  summaryDto,
} from 'sumerian-dictionary/infrastructure/sumerianWordDtoTestData'

jest.mock('http/ApiClient')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const repository = new SumerianDictionaryRepository(apiClient)
const signal = new AbortController().signal

beforeEach(() => jest.clearAllMocks())

describe('find', () => {
  it('requests the encoded id with the token and the signal', async () => {
    apiClient.fetchJson.mockResolvedValueOnce(minimalWordDto)
    await repository.find('sux 006/390', signal)
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/sumerian-words/sux%20006%2F390',
      true,
      signal,
    )
  })

  it('fills every optional field the API leaves out', async () => {
    apiClient.fetchJson.mockResolvedValueOnce(minimalWordDto)
    const word = await repository.find('sux-006390')
    expect(word).toMatchObject({
      id: 'sux-006390',
      atf: '',
      truncated: false,
      head: null,
      signs: [
        {
          signList: '',
          characterList: '',
          knownWrongCharacter: false,
          determinative: false,
          unresolved: false,
          formOf: [],
        },
      ],
      renderings: [
        {
          unrendered: [],
          printed: '',
          signLists: [],
          knownWrongCharacters: [],
        },
      ],
      crossReferences: [
        {
          ambiguous: false,
          targets: [
            { id: 'o0029228', citationForm: 'gub', homonym: '', guideWord: '' },
          ],
        },
      ],
      aliases: [{ meanings: [], uncertain: false }],
      akkadianEquivalents: [{ indexNumbers: '' }],
      citations: [{ passage: '', etcsl: '', compositionId: '' }],
      attestation: { count: 0, periods: [] },
      sources: { attinger: null, epsd2: null },
      match: { curatedOid: '', curatedStatus: '', oidStatus: '', review: [] },
    })
    expect(word).not.toHaveProperty('_id')
  })

  it('keeps every optional field the API sends', async () => {
    apiClient.fetchJson.mockResolvedValueOnce(fullWordDto)
    const { _id, ...rest } = fullWordDto
    expect(await repository.find(_id)).toEqual({ ...rest, id: _id })
  })
})

describe('search', () => {
  it('sends the query without empty values and maps the summaries', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      total: 1,
      entries: [summaryDto],
    })
    const result = await repository.search(
      { query: 'dug₄', kind: 'all', source: 'any', limit: 25, offset: 0 },
      signal,
    )
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      '/sumerian-words?kind=all&limit=25&offset=0&query=dug%E2%82%84&source=any',
      true,
      signal,
    )
    const { _id, ...rest } = summaryDto
    expect(result).toEqual({
      total: 1,
      entries: [{ ...rest, id: _id, matchedAlias: '' }],
    })
  })
})

it('finds summaries by id, keeping a matched alias', async () => {
  apiClient.fetchJson.mockResolvedValueOnce([
    { ...summaryDto, matchedAlias: 'lu-gal' },
  ])
  const summaries = await repository.findSummaries(['o1', 'sux-2'], signal)
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    '/sumerian-words?ids=o1%2Csux-2',
    true,
    signal,
  )
  expect(summaries[0]).toMatchObject({ id: 'o0033341', matchedAlias: 'lu-gal' })
})

it('answers an empty id list without a request', async () => {
  expect(await repository.findSummaries([], signal)).toEqual([])
  expect(apiClient.fetchJson).not.toHaveBeenCalled()
})

it('fetches the statistics', async () => {
  const statistics = { lemmas: 1 }
  apiClient.fetchJson.mockResolvedValueOnce(statistics)
  expect(await repository.statistics(signal)).toBe(statistics)
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    '/sumerian-words/statistics',
    true,
    signal,
  )
})

it('lists all ids', async () => {
  apiClient.fetchJson.mockResolvedValueOnce(['o1'])
  expect(await repository.listAllIds()).toEqual(['o1'])
  expect(apiClient.fetchJson).toHaveBeenCalledWith('/sumerian-words/all', true)
})
