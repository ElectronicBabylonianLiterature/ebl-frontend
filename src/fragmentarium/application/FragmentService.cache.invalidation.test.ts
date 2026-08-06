import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryResult } from 'query/QueryResult'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  buildQueryResultWithPrefetchedFragment,
  cachedFragmentNumber,
  CacheTestContext,
  createCacheTestContext,
  edition,
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

const number = cachedFragmentNumber

let context: CacheTestContext

beforeEach(() => {
  context = createCacheTestContext()
})

test('invalidates fragment and query caches after update', async () => {
  const {
    fragmentRepository,
    fragmentService,
    cachedFragment,
    updatedFragment,
    queryResult,
    updatedQueryResult,
  } = context
  fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))
  fragmentRepository.query.mockReturnValue(Promise.resolve(queryResult))
  fragmentRepository.queryLatest.mockReturnValue(Promise.resolve(queryResult))
  fragmentRepository.updateEdition.mockReturnValue(
    Promise.resolve(updatedFragment),
  )

  await fragmentService.find(number)
  await fragmentService.query(query)
  await fragmentService.queryLatest()
  await expect(
    fragmentService.updateEdition(number, edition),
  ).resolves.toMatchObject({ number: updatedFragment.number })
  fragmentRepository.query.mockReturnValue(Promise.resolve(updatedQueryResult))
  fragmentRepository.queryLatest.mockReturnValue(
    Promise.resolve(updatedQueryResult),
  )

  await expect(fragmentService.find(number)).resolves.toMatchObject({
    number: updatedFragment.number,
  })
  await expect(fragmentService.query(query)).resolves.toEqual(
    updatedQueryResult,
  )
  await expect(fragmentService.queryLatest()).resolves.toEqual(
    updatedQueryResult,
  )

  expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(2)
})

test('does not cache stale fragment reads that resolve after update', async () => {
  const { fragmentRepository, fragmentService, updatedFragment } = context
  let resolveStaleRead: (value: Fragment) => void = () => undefined
  const staleRead = new Promise<Fragment>((resolve) => {
    resolveStaleRead = resolve
  })
  const staleFragment = fragmentFactory.build({ number: number })
  fragmentRepository.find.mockReturnValue(staleRead)
  fragmentRepository.updateEdition.mockReturnValue(
    Promise.resolve(updatedFragment),
  )

  const inFlightRead = fragmentService.find(number)
  await expect(
    fragmentService.updateEdition(number, edition),
  ).resolves.toMatchObject({ number: updatedFragment.number })
  resolveStaleRead(staleFragment)

  await expect(inFlightRead).resolves.toMatchObject({
    number: staleFragment.number,
  })
  await expect(fragmentService.find(number)).resolves.toMatchObject({
    number: updatedFragment.number,
  })
  expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
})

test('does not cache stale query results that resolve after update', async () => {
  const {
    fragmentRepository,
    fragmentService,
    updatedFragment,
    queryResult,
    updatedQueryResult,
  } = context
  let resolveStaleQuery: (value: QueryResult) => void = () => undefined
  const staleQuery = new Promise<QueryResult>((resolve) => {
    resolveStaleQuery = resolve
  })
  fragmentRepository.query
    .mockReturnValueOnce(staleQuery)
    .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
  fragmentRepository.updateEdition.mockReturnValue(
    Promise.resolve(updatedFragment),
  )

  const inFlightQuery = fragmentService.query(query)
  await expect(
    fragmentService.updateEdition(number, edition),
  ).resolves.toMatchObject({ number: updatedFragment.number })
  resolveStaleQuery(queryResult)

  await expect(inFlightQuery).resolves.toEqual(queryResult)
  await expect(fragmentService.query(query)).resolves.toEqual(
    updatedQueryResult,
  )
  expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
})

test('clears in-flight query requests after annotation updates', async () => {
  const {
    fragmentRepository,
    fragmentService,
    queryResult,
    updatedQueryResult,
  } = context
  let resolveStaleQuery: (value: QueryResult) => void = () => undefined
  const staleQuery = new Promise<QueryResult>((resolve) => {
    resolveStaleQuery = resolve
  })
  fragmentRepository.query
    .mockReturnValueOnce(staleQuery)
    .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
  fragmentRepository.updateAnnotations.mockReturnValue(Promise.resolve([]))

  const inFlightQuery = fragmentService.query(query)
  await expect(fragmentService.updateAnnotations(number, [])).resolves.toEqual(
    [],
  )
  resolveStaleQuery(queryResult)

  await expect(inFlightQuery).resolves.toEqual(queryResult)
  await expect(fragmentService.query(query)).resolves.toEqual(
    updatedQueryResult,
  )

  expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
})

test('does not cache stale latest query results that resolve after update', async () => {
  const {
    fragmentRepository,
    fragmentService,
    updatedFragment,
    queryResult,
    updatedQueryResult,
  } = context
  let resolveStaleLatestQuery: (value: QueryResult) => void = () => undefined
  const staleLatestQuery = new Promise<QueryResult>((resolve) => {
    resolveStaleLatestQuery = resolve
  })
  fragmentRepository.queryLatest
    .mockReturnValueOnce(staleLatestQuery)
    .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
  fragmentRepository.updateEdition.mockReturnValue(
    Promise.resolve(updatedFragment),
  )

  const inFlightLatestQuery = fragmentService.queryLatest()
  await expect(
    fragmentService.updateEdition(number, edition),
  ).resolves.toMatchObject({ number: updatedFragment.number })
  resolveStaleLatestQuery(queryResult)

  await expect(inFlightLatestQuery).resolves.toEqual(queryResult)
  await expect(fragmentService.queryLatest()).resolves.toEqual(
    updatedQueryResult,
  )
  expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(2)
})

test('does not repopulate prefetched latest fragments from stale latest query after update', async () => {
  const {
    fragmentRepository,
    fragmentService,
    cachedFragment,
    updatedFragment,
    updatedQueryResult,
  } = context
  let resolveStaleLatestQuery: (value: QueryResult) => void = () => undefined
  const staleLatestQuery = new Promise<QueryResult>((resolve) => {
    resolveStaleLatestQuery = resolve
  })
  const staleLatestQueryResult = buildQueryResultWithPrefetchedFragment(
    cachedFragment,
    [1, 2, 3, 4],
  )

  fragmentRepository.queryLatest
    .mockReturnValueOnce(staleLatestQuery)
    .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
  fragmentRepository.find.mockReturnValue(Promise.resolve(updatedFragment))
  fragmentRepository.updateEdition.mockReturnValue(
    Promise.resolve(updatedFragment),
  )

  const inFlightLatestQuery = fragmentService.queryLatest()
  await expect(
    fragmentService.updateEdition(number, edition),
  ).resolves.toMatchObject({ number: updatedFragment.number })
  await expect(fragmentService.queryLatest()).resolves.toEqual(
    updatedQueryResult,
  )

  resolveStaleLatestQuery(staleLatestQueryResult)

  await expect(inFlightLatestQuery).resolves.toEqual(staleLatestQueryResult)
  await expect(
    fragmentService.find(number, [1, 2, 3], false),
  ).resolves.toMatchObject({ number: updatedFragment.number })
  expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  expect(fragmentRepository.find).toHaveBeenCalledWith(number, [1, 2, 3], false)
})
