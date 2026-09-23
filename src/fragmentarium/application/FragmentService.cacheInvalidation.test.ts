import Promise from 'bluebird'
import { fragmentFactory } from 'test-support/fragment-fixtures'
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

describe('cache invalidation after updates', () => {
  test('invalidates fragment and query caches after update', async () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))
    fragmentRepository.query.mockReturnValue(Promise.resolve(queryResult))
    fragmentRepository.queryLatest.mockReturnValue(Promise.resolve(queryResult))
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    await service.find(number)
    await service.query(query)
    await service.queryLatest()
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    fragmentRepository.query.mockReturnValue(
      Promise.resolve(updatedQueryResult),
    )
    fragmentRepository.queryLatest.mockReturnValue(
      Promise.resolve(updatedQueryResult),
    )

    await expect(service.find(number)).resolves.toMatchObject({
      number: updatedFragment.number,
    })
    await expect(service.query(query)).resolves.toEqual(updatedQueryResult)
    await expect(service.queryLatest()).resolves.toEqual(updatedQueryResult)

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(2)
  })

  test('keeps other fragments cached when one of them is updated', async () => {
    const otherNumber = 'K.2'
    const otherFragment = fragmentFactory.build({ number: otherNumber })
    fragmentRepository.find.mockImplementation((requested: string) =>
      Promise.resolve(requested === number ? cachedFragment : otherFragment),
    )
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    await service.find(number)
    await service.find(otherNumber)
    await service.updateEdition(number, edition)

    await expect(service.find(otherNumber)).resolves.toMatchObject({
      number: otherNumber,
    })
    await expect(service.find(number)).resolves.toMatchObject({
      number: updatedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
  })

  test('leaves an in-flight read for another fragment alone during an update', async () => {
    const otherNumber = 'K.2'
    const otherFragment = fragmentFactory.build({ number: otherNumber })
    let resolveOtherRead: (value: Fragment) => void = () => undefined
    const otherRead = new Promise<Fragment>((resolve) => {
      resolveOtherRead = resolve
    })
    fragmentRepository.find.mockImplementation((requested: string) =>
      requested === otherNumber ? otherRead : Promise.resolve(cachedFragment),
    )
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    const pendingOther = service.find(otherNumber)
    await service.updateEdition(number, edition)
    resolveOtherRead(otherFragment)

    await expect(pendingOther).resolves.toMatchObject({ number: otherNumber })
    await expect(service.find(otherNumber)).resolves.toMatchObject({
      number: otherNumber,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('does not cache stale fragment reads that resolve after update', async () => {
    let resolveStaleRead: (value: Fragment) => void = () => undefined
    const staleRead = new Promise<Fragment>((resolve) => {
      resolveStaleRead = resolve
    })
    const staleFragment = fragmentFactory.build({ number: number })
    fragmentRepository.find.mockReturnValue(staleRead)
    fragmentRepository.updateEdition.mockReturnValue(
      Promise.resolve(updatedFragment),
    )

    const inFlightRead = service.find(number)
    await expect(service.updateEdition(number, edition)).resolves.toMatchObject(
      {
        number: updatedFragment.number,
      },
    )
    resolveStaleRead(staleFragment)

    await expect(inFlightRead).resolves.toMatchObject({
      number: staleFragment.number,
    })
    await expect(service.find(number)).resolves.toMatchObject({
      number: updatedFragment.number,
    })
    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })
})
