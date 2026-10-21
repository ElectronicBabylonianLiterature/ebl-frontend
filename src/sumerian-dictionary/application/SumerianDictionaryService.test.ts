import { testDelegation, TestData } from 'test-support/utils'
import SumerianDictionaryRepository from 'sumerian-dictionary/infrastructure/SumerianDictionaryRepository'
import SumerianDictionaryService from 'sumerian-dictionary/application/SumerianDictionaryService'
import {
  sumerianStatisticsFactory,
  sumerianWordFactory,
  sumerianWordSummaryFactory,
} from 'test-support/sumerian-dictionary-fixtures'

jest.mock('sumerian-dictionary/infrastructure/SumerianDictionaryRepository')

const repository = new (SumerianDictionaryRepository as jest.Mock<
  jest.Mocked<SumerianDictionaryRepository>
>)()
const signal = new AbortController().signal
const word = sumerianWordFactory.build({ id: 'o0033341' })
const summaries = sumerianWordSummaryFactory.buildList(2)
const query = {
  query: 'lugal',
  kind: 'all' as const,
  source: 'any' as const,
  limit: 25,
  offset: 0,
}
const result = { total: 2, entries: summaries }
const statistics = sumerianStatisticsFactory.build()

function createService(): SumerianDictionaryService {
  return new SumerianDictionaryService(repository)
}

const testData: TestData<SumerianDictionaryService>[] = [
  new TestData(
    'find',
    ['o0033341', signal],
    repository.find,
    word,
    ['o0033341', signal],
    Promise.resolve(word),
  ),
  new TestData(
    'search',
    [query, signal],
    repository.search,
    result,
    [query, signal],
    Promise.resolve(result),
  ),
  new TestData(
    'findSummaries',
    [['o1'], signal],
    repository.findSummaries,
    summaries,
    [['o1'], signal],
    Promise.resolve(summaries),
  ),
  new TestData(
    'statistics',
    [signal],
    repository.statistics,
    statistics,
    [signal],
    Promise.resolve(statistics),
  ),
  new TestData(
    'listAllIds',
    [],
    repository.listAllIds,
    ['o1'],
    [],
    Promise.resolve(['o1']),
  ),
]

describe('SumerianDictionaryService', () =>
  testDelegation(createService, testData))

describe('SumerianDictionaryService.find caching', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    repository.find.mockResolvedValue(word)
  })

  afterEach(() => jest.useRealTimers())

  it('serves a repeated lookup from the cache', async () => {
    const service = createService()
    await service.find('o0033341')
    await expect(service.find('o0033341')).resolves.toEqual(word)
    expect(repository.find).toHaveBeenCalledTimes(1)
  })

  it('refetches once the cached word has expired', async () => {
    const service = createService()
    await service.find('o0033341')
    jest.advanceTimersByTime(5 * 60 * 1000 + 1)
    await service.find('o0033341')
    expect(repository.find).toHaveBeenCalledTimes(2)
  })
})
