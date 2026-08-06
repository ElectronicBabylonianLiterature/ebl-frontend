import { Fragment } from 'fragmentarium/domain/fragment'
import {
  buildQueryResultWithPrefetchedFragment,
  cachedFragmentNumber,
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

const number = cachedFragmentNumber

let context: CacheTestContext

beforeEach(() => {
  context = createCacheTestContext()
})

test('serves prefetched latest fragments without repository reads', async () => {
  const { fragmentRepository, fragmentService, cachedFragment } = context
  const queryResultWithPrefetchedFragment =
    buildQueryResultWithPrefetchedFragment(cachedFragment, [1, 2, 3, 4])
  fragmentRepository.queryLatest.mockReturnValue(
    Promise.resolve(queryResultWithPrefetchedFragment),
  )

  await expect(fragmentService.queryLatest()).resolves.toEqual(
    queryResultWithPrefetchedFragment,
  )
  await expect(
    fragmentService.find(number, [1, 2, 3], false),
  ).resolves.toMatchObject({ number: cachedFragment.number })
  await expect(
    fragmentService.find(number, [1, 2, 3], false),
  ).resolves.toMatchObject({ number: cachedFragment.number })

  expect(fragmentRepository.find).toHaveBeenCalledTimes(0)
})

test('stores prefetched latest fragments after cache scope changes', async () => {
  const { fragmentRepository, createService, cachedFragment, updatedFragment } =
    context
  let cacheScope = 'guest'
  const scopedService = createService(() => cacheScope)
  const queryResultWithPrefetchedFragment =
    buildQueryResultWithPrefetchedFragment(updatedFragment, [1, 2, 3, 4])
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
  ).resolves.toMatchObject({ number: updatedFragment.number })

  expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
})

test('falls back to repository reads when prefetched latest key does not match', async () => {
  const {
    fragmentRepository,
    fragmentService,
    cachedFragment,
    updatedFragment,
  } = context
  const queryResultWithPrefetchedFragment =
    buildQueryResultWithPrefetchedFragment(cachedFragment, [8, 9])
  fragmentRepository.queryLatest.mockReturnValue(
    Promise.resolve(queryResultWithPrefetchedFragment),
  )
  fragmentRepository.find.mockReturnValue(Promise.resolve(updatedFragment))

  await expect(fragmentService.queryLatest()).resolves.toEqual(
    queryResultWithPrefetchedFragment,
  )
  await expect(
    fragmentService.find(number, [1, 2, 3], false),
  ).resolves.toMatchObject({ number: updatedFragment.number })

  expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  expect(fragmentRepository.find).toHaveBeenCalledWith(number, [1, 2, 3], false)
})

test('normalizes prefetched fragment errors using onError', async () => {
  const { fragmentRepository, fragmentService, cachedFragment } = context
  const queryResultWithPrefetchedFragment =
    buildQueryResultWithPrefetchedFragment(cachedFragment, [1, 2, 3, 4])
  const injectReferencesMock = jest
    .spyOn(
      (
        fragmentService as unknown as {
          queryLoader: {
            injectReferences: (fragment: Fragment) => Promise<Fragment>
          }
        }
      ).queryLoader,
      'injectReferences',
    )
    .mockReturnValue(Promise.reject(new Error('403 Forbidden')))
  fragmentRepository.queryLatest.mockReturnValue(
    Promise.resolve(queryResultWithPrefetchedFragment),
  )

  await expect(fragmentService.queryLatest()).resolves.toEqual(
    queryResultWithPrefetchedFragment,
  )
  await expect(fragmentService.find(number, [1, 2, 3], false)).rejects.toThrow(
    "You don't have permissions to view this fragment.",
  )

  expect(fragmentRepository.find).toHaveBeenCalledTimes(0)
  injectReferencesMock.mockRestore()
})

test('serves prefetched fragments from regular query results', async () => {
  const { fragmentRepository, fragmentService, cachedFragment } = context
  const queryResultWithPrefetchedFragment =
    buildQueryResultWithPrefetchedFragment(cachedFragment, [1, 2, 3, 4])

  fragmentRepository.query.mockReturnValue(
    Promise.resolve(queryResultWithPrefetchedFragment),
  )

  await expect(fragmentService.query(query)).resolves.toEqual(
    queryResultWithPrefetchedFragment,
  )
  await expect(
    fragmentService.find(number, [1, 2, 3], false),
  ).resolves.toMatchObject({ number: cachedFragment.number })

  expect(fragmentRepository.find).toHaveBeenCalledTimes(0)
})
