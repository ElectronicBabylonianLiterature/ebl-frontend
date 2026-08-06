import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentCache from 'fragmentarium/application/FragmentCache'
import {
  CacheTestContext,
  createCacheTestContext,
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

test('caches empty provenance list results', async () => {
  const { fragmentRepository, fragmentService } = context
  fragmentRepository.fetchProvenances.mockReturnValue(Promise.resolve([]))

  await expect(fragmentService.fetchProvenances()).resolves.toEqual([])
  await expect(fragmentService.fetchProvenances()).resolves.toEqual([])

  expect(fragmentRepository.fetchProvenances).toHaveBeenCalledTimes(1)
})

test('caches empty provenance children results', async () => {
  const { fragmentRepository, fragmentService } = context
  fragmentRepository.fetchProvenanceChildren.mockReturnValue(
    Promise.resolve([]),
  )

  await expect(
    fragmentService.fetchProvenanceChildren('P.empty'),
  ).resolves.toEqual([])
  await expect(
    fragmentService.fetchProvenanceChildren('P.empty'),
  ).resolves.toEqual([])

  expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledTimes(1)
  expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledWith(
    'P.empty',
  )
})

test('evicts oldest provenance by id cache entry when max size is exceeded', async () => {
  const { fragmentRepository, fragmentService } = context
  fragmentRepository.fetchProvenance.mockImplementation((id: string) =>
    Promise.resolve({
      id: id,
      longName: id,
      abbreviation: id,
      parent: 'parent',
      sortKey: 1,
    }),
  )

  for (let index = 0; index <= 250; index += 1) {
    await fragmentService.fetchProvenance(`P.${index}`)
  }

  await fragmentService.fetchProvenance('P.0')

  expect(fragmentRepository.fetchProvenance).toHaveBeenCalledTimes(252)
})

test('evicts oldest provenance children cache entry when max size is exceeded', async () => {
  const { fragmentRepository, fragmentService } = context
  fragmentRepository.fetchProvenanceChildren.mockImplementation((id: string) =>
    Promise.resolve([
      {
        id: `${id}.child`,
        longName: `${id}.child`,
        abbreviation: `${id}.child`,
        parent: id,
        sortKey: 1,
      },
    ]),
  )

  for (let index = 0; index <= 250; index += 1) {
    await fragmentService.fetchProvenanceChildren(`PC.${index}`)
  }

  await fragmentService.fetchProvenanceChildren('PC.0')

  expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledTimes(252)
})

test('returns when trim cache finds no oldest key', () => {
  const { cachedFragment, updatedFragment } = context
  const cache = new Map<string, { expiresAt: number; value: Fragment }>()
  cache.set('K.1', { expiresAt: Date.now() + 1, value: cachedFragment })
  cache.set('K.2', { expiresAt: Date.now() + 1, value: updatedFragment })

  const emptyKeys = new Map<
    string,
    { expiresAt: number; value: Fragment }
  >().keys()
  const keysSpy = jest.spyOn(cache, 'keys').mockReturnValue(emptyKeys)

  new FragmentCache().trim(cache, 1)

  expect(cache.size).toBe(2)
  keysSpy.mockRestore()
})

test('uses the default cache scope when none is provided', async () => {
  const cache = new FragmentCache()
  const fragment = context.cachedFragment

  await expect(
    cache.getOrFetch(cache.fragments, cache.fragmentRequests, 'K.1', 1, () =>
      Promise.resolve(fragment),
    ),
  ).resolves.toBe(fragment)
  await expect(
    cache.getOrFetch(cache.fragments, cache.fragmentRequests, 'K.1', 1, () =>
      Promise.reject(new Error('should be cached')),
    ),
  ).resolves.toBe(fragment)
})
