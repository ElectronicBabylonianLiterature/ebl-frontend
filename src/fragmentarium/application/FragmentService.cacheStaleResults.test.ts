import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryResult } from 'query/QueryResult'
import {
  edition,
  fragmentRepository,
  number,
  query,
  setupCacheTest,
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

describe('stale results after updates', () => {
  test('does not cache stale query results that resolve after update', async () => {
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

    const inFlightQuery = service.query(query)
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    resolveStaleQuery(queryResult)

    await expect(inFlightQuery).resolves.toEqual(queryResult)
    await expect(service.query(query)).resolves.toEqual(updatedQueryResult)
    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })

  test('clears in-flight query requests after annotation updates', async () => {
    let resolveStaleQuery: (value: QueryResult) => void = () => undefined
    const staleQuery = new Promise<QueryResult>((resolve) => {
      resolveStaleQuery = resolve
    })
    fragmentRepository.query
      .mockReturnValueOnce(staleQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
    fragmentRepository.updateAnnotations.mockReturnValue(Promise.resolve([]))

    const inFlightQuery = service.query(query)
    await expect(service.updateAnnotations(number, [])).resolves.toEqual([])
    resolveStaleQuery(queryResult)

    await expect(inFlightQuery).resolves.toEqual(queryResult)
    await expect(service.query(query)).resolves.toEqual(updatedQueryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })

  test('does not cache stale latest query results that resolve after update', async () => {
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

    const inFlightLatestQuery = service.queryLatest()
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    resolveStaleLatestQuery(queryResult)

    await expect(inFlightLatestQuery).resolves.toEqual(queryResult)
    await expect(service.queryLatest()).resolves.toEqual(updatedQueryResult)
    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(2)
  })

  test('does not repopulate prefetched latest fragments from stale latest query after update', async () => {
    let resolveStaleLatestQuery: (value: QueryResult) => void = () => undefined
    const staleLatestQuery = new Promise<QueryResult>((resolve) => {
      resolveStaleLatestQuery = resolve
    })
    const staleLatestQueryResult: QueryResult = {
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

    fragmentRepository.queryLatest
      .mockReturnValueOnce(staleLatestQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))
    fragmentRepository.find.mockReturnValue(Promise.resolve(updatedFragment))
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    const inFlightLatestQuery = service.queryLatest()
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    await expect(service.queryLatest()).resolves.toEqual(updatedQueryResult)

    resolveStaleLatestQuery(staleLatestQueryResult)

    await expect(inFlightLatestQuery).resolves.toEqual(staleLatestQueryResult)
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
})
