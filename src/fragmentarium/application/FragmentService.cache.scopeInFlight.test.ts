import { QueryResult } from 'query/QueryResult'
import {
  CacheTestContext,
  createCacheTestContext,
  query,
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

let context: CacheTestContext

beforeEach(() => {
  context = createCacheTestContext()
})

test('clears in-flight query requests when scope changes from guest to authenticated', async () => {
  const { fragmentRepository, createService, queryResult, updatedQueryResult } =
    context
  let cacheScope = 'guest'
  const scopedService = createService(() => cacheScope)
  let resolveGuestQuery: (value: QueryResult) => void = () => undefined
  const guestQuery = new Promise<QueryResult>((resolve) => {
    resolveGuestQuery = resolve
  })

  fragmentRepository.query
    .mockReturnValueOnce(guestQuery)
    .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

  const guestInFlight = scopedService.query(query)

  cacheScope = 'authenticated:user-a'
  await expect(scopedService.query(query)).resolves.toEqual(updatedQueryResult)

  resolveGuestQuery(queryResult)
  await expect(guestInFlight).resolves.toEqual(queryResult)

  expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
})

test('clears in-flight latest query requests across auth transitions', async () => {
  const { fragmentRepository, createService, queryResult, updatedQueryResult } =
    context
  let cacheScope = 'guest'
  const scopedService = createService(() => cacheScope)
  let resolveGuestQuery: (value: QueryResult) => void = () => undefined
  let resolveUserAQuery: (value: QueryResult) => void = () => undefined
  let resolveUserBQuery: (value: QueryResult) => void = () => undefined
  const guestQuery = new Promise<QueryResult>((resolve) => {
    resolveGuestQuery = resolve
  })
  const userAQuery = new Promise<QueryResult>((resolve) => {
    resolveUserAQuery = resolve
  })
  const userBQuery = new Promise<QueryResult>((resolve) => {
    resolveUserBQuery = resolve
  })

  fragmentRepository.queryLatest
    .mockReturnValueOnce(guestQuery)
    .mockReturnValueOnce(userAQuery)
    .mockReturnValueOnce(userBQuery)
    .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

  const guestInFlight = scopedService.queryLatest()

  cacheScope = 'authenticated:user-a'
  const userAInFlight = scopedService.queryLatest()

  cacheScope = 'authenticated:user-b'
  const userBInFlight = scopedService.queryLatest()

  cacheScope = 'guest'
  await expect(scopedService.queryLatest()).resolves.toEqual(updatedQueryResult)

  resolveGuestQuery(queryResult)
  resolveUserAQuery(queryResult)
  resolveUserBQuery(queryResult)

  await expect(guestInFlight).resolves.toEqual(queryResult)
  await expect(userAInFlight).resolves.toEqual(queryResult)
  await expect(userBInFlight).resolves.toEqual(queryResult)

  expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(4)
})
