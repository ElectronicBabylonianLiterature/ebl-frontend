import Promise from 'bluebird'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  fragmentRepository,
  number,
  setupCacheTest,
  withExpiredCacheTimestamp,
} from 'fragmentarium/application/fragmentServiceCache.testSupport'

let service: FragmentService
let cachedFragment: Fragment
let updatedFragment: Fragment

beforeEach(() => {
  ;({ service, cachedFragment, updatedFragment } = setupCacheTest())
})

describe('fragment read caching', () => {
  test('caches fragment reads by number and line options', async () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await expect(service.find(number, [1], true)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    await expect(service.find(number, [1], true)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
    expect(fragmentRepository.find).toHaveBeenCalledWith(number, [1], true)
  })

  test('fetches fragment reads separately for different line options', async () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await service.find(number, [1], true)
    await service.find(number, [2], true)

    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
  })

  test('shares in-flight fragment reads', async () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    const firstResult = service.find(number)
    const secondResult = service.find(number)

    await expect(firstResult).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    await expect(secondResult).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('does not cache failed fragment reads', async () => {
    fragmentRepository.find
      .mockReturnValueOnce(Promise.reject(new Error('failed')))
      .mockReturnValueOnce(Promise.resolve(cachedFragment))

    await expect(service.find(number)).rejects.toThrow('failed')
    await expect(service.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
  })

  test('refreshes expired fragment reads', async () => {
    fragmentRepository.find
      .mockReturnValueOnce(Promise.resolve(cachedFragment))
      .mockReturnValueOnce(Promise.resolve(updatedFragment))

    await withExpiredCacheTimestamp(async (expireCache) => {
      await expect(service.find(number)).resolves.toMatchObject({
        number: cachedFragment.number,
      })
      expireCache()
      await expect(service.find(number)).resolves.toMatchObject({
        number: updatedFragment.number,
      })
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
  })

  test('evicts oldest fragment cache entry when max size is exceeded', async () => {
    fragmentRepository.find.mockImplementation((fragmentNumber: string) =>
      Promise.resolve(fragmentFactory.build({ number: fragmentNumber })),
    )

    for (let index = 0; index <= 250; index += 1) {
      await service.find(`K.${index}`)
    }

    await service.find('K.0')

    expect(fragmentRepository.find).toHaveBeenCalledTimes(252)
  })
})
