import Promise from 'bluebird'
import { FragmentQuery } from 'query/FragmentQuery'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryResult } from 'query/QueryResult'
import {
  fragmentRepository,
  number,
  query,
  reorderedQuery,
  setupCacheTest,
  withExpiredCacheTimestamp,
} from 'fragmentarium/application/fragmentServiceCache.testSupport'

let service: FragmentService
let cachedFragment: Fragment
let queryResult: QueryResult
let updatedQueryResult: QueryResult

beforeEach(() => {
  ;({ service, cachedFragment, queryResult, updatedQueryResult } =
    setupCacheTest())
})

describe('query result caching', () => {
  test('caches completed query results', async () => {
    fragmentRepository.query.mockReturnValue(Promise.resolve(queryResult))

    await expect(service.query(query)).resolves.toEqual(queryResult)
    await expect(service.query(query)).resolves.toEqual(queryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(1)
  })

  test('serves prefetched fragments from regular query results', async () => {
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

    fragmentRepository.query.mockReturnValue(
      Promise.resolve(queryResultWithPrefetchedFragment),
    )

    await expect(service.query(query)).resolves.toEqual(
      queryResultWithPrefetchedFragment,
    )
    await expect(service.find(number, [1, 2, 3], false)).resolves.toMatchObject(
      {
        number: cachedFragment.number,
      },
    )

    expect(fragmentRepository.find).toHaveBeenCalledTimes(0)
  })

  test('refreshes expired query results', async () => {
    fragmentRepository.query
      .mockReturnValueOnce(Promise.resolve(queryResult))
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    await withExpiredCacheTimestamp(async (expireCache) => {
      await expect(service.query(query)).resolves.toEqual(queryResult)
      expireCache()
      await expect(service.query(query)).resolves.toEqual(updatedQueryResult)
    })

    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })

  test('evicts oldest query cache entry when max size is exceeded', async () => {
    fragmentRepository.query.mockImplementation(
      (fragmentQuery: FragmentQuery) =>
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
      await service.query({ number: `K.${index}` })
    }

    await service.query({ number: 'K.0' })

    expect(fragmentRepository.query).toHaveBeenCalledTimes(252)
  })

  test('shares in-flight query requests by stable query key', async () => {
    fragmentRepository.query.mockReturnValue(Promise.resolve(queryResult))

    const firstResult = service.query(query)
    const secondResult = service.query(reorderedQuery)

    await expect(firstResult).resolves.toEqual(queryResult)
    await expect(secondResult).resolves.toEqual(queryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(1)
  })

  test('does not return cancelled in-flight query when re-requested', async () => {
    const deferredQuery = new Promise<QueryResult>(() => {})

    fragmentRepository.query
      .mockReturnValueOnce(deferredQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    const firstQuery = service.query(query)

    firstQuery.cancel()

    const secondQuery = service.query(query)

    await expect(secondQuery).resolves.toEqual(updatedQueryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })
})
