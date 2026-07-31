import Promise from 'bluebird'
import {
  defaultCacheScope,
  FragmentCache,
} from 'fragmentarium/application/fragmentCache'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  fragmentRepository,
  setupCacheTest,
} from 'fragmentarium/application/fragmentServiceCache.testSupport'

let service: FragmentService
let cachedFragment: Fragment
let updatedFragment: Fragment

beforeEach(() => {
  ;({ service, cachedFragment, updatedFragment } = setupCacheTest())
})

describe('cache eviction', () => {
  test('evicts oldest provenance by id cache entry when max size is exceeded', async () => {
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
      await service.fetchProvenance(`P.${index}`)
    }

    await service.fetchProvenance('P.0')

    expect(fragmentRepository.fetchProvenance).toHaveBeenCalledTimes(252)
  })

  test('evicts oldest provenance children cache entry when max size is exceeded', async () => {
    fragmentRepository.fetchProvenanceChildren.mockImplementation(
      (id: string) =>
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
      await service.fetchProvenanceChildren(`PC.${index}`)
    }

    await service.fetchProvenanceChildren('PC.0')

    expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledTimes(
      252,
    )
  })

  test('returns when trim cache finds no oldest key', () => {
    const cache = new Map<string, { expiresAt: number; value: Fragment }>()
    cache.set('K.1', { expiresAt: Date.now() + 1, value: cachedFragment })
    cache.set('K.2', { expiresAt: Date.now() + 1, value: updatedFragment })

    const emptyKeys = new Map<
      string,
      { expiresAt: number; value: Fragment }
    >().keys()
    const keysSpy = jest.spyOn(cache, 'keys').mockReturnValue(emptyKeys)

    new FragmentCache(() => defaultCacheScope).trimCache(cache, 1)

    expect(cache.size).toBe(2)
    keysSpy.mockRestore()
  })
})
