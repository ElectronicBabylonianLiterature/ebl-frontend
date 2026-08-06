import { FragmentQuery } from 'query/FragmentQuery'
import {
  cachedFragmentNumber,
  CacheTestContext,
  createCacheTestContext,
  query,
  withExpiredCacheTimestamp,
} from 'fragmentarium/application/FragmentService.cache.testSupport'

jest.mock('bibliography/application/BibliographyService', () => {
  return function () {
    return { find: jest.fn(), findMany: jest.fn(), search: jest.fn() }
  }
})

jest.mock('dictionary/infrastructure/WordRepository', () => {
  return function () {
    return { searchLemma: jest.fn(), find: jest.fn(), findAll: jest.fn() }
  }
})

const number = cachedFragmentNumber
const reorderedQuery: FragmentQuery = { number: number, lemmas: 'ina I' }

let context: CacheTestContext

beforeEach(() => {
  context = createCacheTestContext()
})

test('caches latest query results', async () => {
  const { fragmentRepository, fragmentService, queryResult } = context
  fragmentRepository.queryLatest.mockReturnValue(Promise.resolve(queryResult))

  await expect(fragmentService.queryLatest()).resolves.toEqual(queryResult)
  await expect(fragmentService.queryLatest()).resolves.toEqual(queryResult)

  expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(1)
})

test('refreshes expired latest query results', async () => {
  const {
    fragmentRepository,
    fragmentService,
    queryResult,
    updatedQueryResult,
  } = context
  fragmentRepository.queryLatest
    .mockReturnValueOnce(Promise.resolve(queryResult))
    .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

  await withExpiredCacheTimestamp(async (expireCache) => {
    await expect(fragmentService.queryLatest()).resolves.toEqual(queryResult)
    expireCache()
    await expect(fragmentService.queryLatest()).resolves.toEqual(
      updatedQueryResult,
    )
  })

  expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(2)
})

test('shares in-flight latest query requests', async () => {
  const { fragmentRepository, fragmentService, queryResult } = context
  fragmentRepository.queryLatest.mockReturnValue(Promise.resolve(queryResult))

  const firstResult = fragmentService.queryLatest()
  const secondResult = fragmentService.queryLatest()

  await expect(firstResult).resolves.toEqual(queryResult)
  await expect(secondResult).resolves.toEqual(queryResult)

  expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(1)
})

test('caches completed query results', async () => {
  const { fragmentRepository, fragmentService, queryResult } = context
  fragmentRepository.query.mockReturnValue(Promise.resolve(queryResult))

  await expect(fragmentService.query(query)).resolves.toEqual(queryResult)
  await expect(fragmentService.query(query)).resolves.toEqual(queryResult)

  expect(fragmentRepository.query).toHaveBeenCalledTimes(1)
})

test('refreshes expired query results', async () => {
  const {
    fragmentRepository,
    fragmentService,
    queryResult,
    updatedQueryResult,
  } = context
  fragmentRepository.query
    .mockReturnValueOnce(Promise.resolve(queryResult))
    .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

  await withExpiredCacheTimestamp(async (expireCache) => {
    await expect(fragmentService.query(query)).resolves.toEqual(queryResult)
    expireCache()
    await expect(fragmentService.query(query)).resolves.toEqual(
      updatedQueryResult,
    )
  })

  expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
})

test('evicts oldest query cache entry when max size is exceeded', async () => {
  const { fragmentRepository, fragmentService } = context
  fragmentRepository.query.mockImplementation((fragmentQuery: FragmentQuery) =>
    Promise.resolve({
      items: [
        {
          museumNumber: fragmentQuery.number ?? number,
          matchingLines: [],
          matchCount: 1,
        },
      ],
      matchCountTotal: 1,
    }),
  )

  for (let index = 0; index <= 250; index += 1) {
    await fragmentService.query({ number: `K.${index}` })
  }

  await fragmentService.query({ number: 'K.0' })

  expect(fragmentRepository.query).toHaveBeenCalledTimes(252)
})

test('shares in-flight query requests by stable query key', async () => {
  const { fragmentRepository, fragmentService, queryResult } = context
  fragmentRepository.query.mockReturnValue(Promise.resolve(queryResult))

  const firstResult = fragmentService.query(query)
  const secondResult = fragmentService.query(reorderedQuery)

  await expect(firstResult).resolves.toEqual(queryResult)
  await expect(secondResult).resolves.toEqual(queryResult)

  expect(fragmentRepository.query).toHaveBeenCalledTimes(1)
})

test('re-fetches after a failed in-flight query', async () => {
  const { fragmentRepository, fragmentService, updatedQueryResult } = context
  fragmentRepository.query
    .mockReturnValueOnce(Promise.reject(new Error('fail')))
    .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

  await expect(fragmentService.query(query)).rejects.toThrow('fail')

  const secondQuery = fragmentService.query(query)

  await expect(secondQuery).resolves.toEqual(updatedQueryResult)

  expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
})
