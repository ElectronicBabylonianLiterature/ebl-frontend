import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryResult } from 'query/QueryResult'
import {
  createScopedService,
  fragmentRepository,
  number,
  setupCacheTest,
  withExpiredCacheTimestamp,
} from 'fragmentarium/application/fragmentServiceCache.testSupport'

let service: FragmentService
let cachedFragment: Fragment
let updatedFragment: Fragment
let queryResult: QueryResult
let updatedQueryResult: QueryResult

beforeEach(() => {
  ;({
    service,
    cachedFragment,
    updatedFragment,
    queryResult,
    updatedQueryResult,
  } = setupCacheTest())
})

describe('latest query caching', () => {
  test('caches latest query results', async () => {
    fragmentRepository.queryLatest.mockReturnValue(Promise.resolve(queryResult))

    await expect(service.queryLatest()).resolves.toEqual(queryResult)
    await expect(service.queryLatest()).resolves.toEqual(queryResult)

    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(1)
  })

  test('refreshes expired latest query results', async () => {
    fragmentRepository.queryLatest
      .mockReturnValueOnce(Promise.resolve(queryResult))
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    await withExpiredCacheTimestamp(async (expireCache) => {
      await expect(service.queryLatest()).resolves.toEqual(queryResult)
      expireCache()
      await expect(service.queryLatest()).resolves.toEqual(updatedQueryResult)
    })

    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(2)
  })

  test('shares in-flight latest query requests', async () => {
    fragmentRepository.queryLatest.mockReturnValue(Promise.resolve(queryResult))

    const firstResult = service.queryLatest()
    const secondResult = service.queryLatest()

    await expect(firstResult).resolves.toEqual(queryResult)
    await expect(secondResult).resolves.toEqual(queryResult)

    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(1)
  })

  test('serves prefetched latest fragments without repository reads', async () => {
    const queryResultWithPrefetchedFragment: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [1, 2, 3, 4],
          matchCount: 1,
          fragment: cachedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )

    await expect(service.queryLatest()).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      {
        number: cachedFragment.number,
      },
    )
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      {
        number: cachedFragment.number,
      },
    )

    expect(fragmentRepository.find).toHaveBeenCalledTimes(0)
  })

  test('stores prefetched latest fragments after cache scope changes', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    const queryResultWithPrefetchedFragment: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [1, 2, 3, 4],
          matchCount: 1,
          fragment: updatedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )

    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    cacheScope = 'authenticated:user'

    await expect(scopedService.queryLatest()).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(
      scopedService.find(number, [1, 2, 3], false),
    ).resolves.toMatchObject({
      number: updatedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('falls back to repository reads when prefetched latest key does not match', async () => {
    const queryResultWithPrefetchedFragment: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [8, 9],
          matchCount: 1,
          fragment: cachedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )
    fragmentRepository.find.mockReturnValue(Promise.resolve(updatedFragment))

    await expect(service.queryLatest()).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
    expect(fragmentRepository.find).toHaveBeenCalledWith(
      number,
      [1, 2, 3],
      false,
    )
  })

  test('normalizes prefetched fragment errors using onError', async () => {
    const queryResultWithPrefetchedFragment: QueryResult = {
      items: [
        {
          museumNumber: number,
          matchingLines: [1, 2, 3, 4],
          matchCount: 1,
          fragment: cachedFragment,
        } as QueryResult['items'][number],
      ],
      matchCountTotal: 1,
    }
    const injectReferencesMock = jest
      .spyOn(
        service as unknown as {
          injectReferences: (fragment: Fragment) => Promise<Fragment>
        },
        'injectReferences',
      )
      .mockReturnValue(Promise.reject(new Error('403 Forbidden')))
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )

    await expect(service.queryLatest()).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(service.find(number, [1, 2, 3], false)).rejects.toThrow(
      "You don't have permissions to view this fragment.",
    )

    expect(fragmentRepository.find).toHaveBeenCalledTimes(0)
    injectReferencesMock.mockRestore()
  })
})
