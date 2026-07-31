import Promise from 'bluebird'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  fragmentRepository,
  imageRepository,
  number,
  setupCacheTest,
  withExpiredCacheTimestamp,
} from 'fragmentarium/application/fragmentServiceCache.testSupport'

let service: FragmentService
let cachedFragment: Fragment

beforeEach(() => {
  ;({ service, cachedFragment } = setupCacheTest())
})

describe('thumbnail caching', () => {
  test('caches thumbnails by fragment number and size', async () => {
    const thumbnail = { blob: null }
    imageRepository.findThumbnail.mockReturnValue(Promise.resolve(thumbnail))

    await expect(service.findThumbnail(cachedFragment, 'small')).resolves.toBe(
      thumbnail,
    )
    await expect(service.findThumbnail(cachedFragment, 'small')).resolves.toBe(
      thumbnail,
    )

    expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(1)
    expect(imageRepository.findThumbnail).toHaveBeenCalledWith(number, 'small')
  })

  test('refreshes expired thumbnails', async () => {
    const thumbnail = { blob: null }
    const refreshedThumbnail = { blob: new Blob(['refreshed']) }
    imageRepository.findThumbnail
      .mockReturnValueOnce(Promise.resolve(thumbnail))
      .mockReturnValueOnce(Promise.resolve(refreshedThumbnail))

    await withExpiredCacheTimestamp(async (expireCache) => {
      await expect(
        service.findThumbnail(cachedFragment, 'small'),
      ).resolves.toBe(thumbnail)
      expireCache()
      await expect(
        service.findThumbnail(cachedFragment, 'small'),
      ).resolves.toBe(refreshedThumbnail)
    })

    expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(2)
  })

  test('evicts oldest thumbnail cache entry when max size is exceeded', async () => {
    imageRepository.findThumbnail.mockImplementation((fragmentNumber: string) =>
      Promise.resolve({ blob: new Blob([fragmentNumber]) }),
    )

    for (let index = 0; index <= 250; index += 1) {
      await service.findThumbnail(
        fragmentFactory.build({ number: `K.${index}` }),
        'small',
      )
    }

    await service.findThumbnail(
      fragmentFactory.build({ number: 'K.0' }),
      'small',
    )

    expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(252)
  })

  test('caches empty provenance list results', async () => {
    fragmentRepository.fetchProvenances.mockReturnValue(Promise.resolve([]))

    await expect(service.fetchProvenances()).resolves.toEqual([])
    await expect(service.fetchProvenances()).resolves.toEqual([])

    expect(fragmentRepository.fetchProvenances).toHaveBeenCalledTimes(1)
  })

  test('caches empty provenance children results', async () => {
    fragmentRepository.fetchProvenanceChildren.mockReturnValue(
      Promise.resolve([]),
    )

    await expect(service.fetchProvenanceChildren('P.empty')).resolves.toEqual(
      [],
    )
    await expect(service.fetchProvenanceChildren('P.empty')).resolves.toEqual(
      [],
    )

    expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledTimes(1)
    expect(fragmentRepository.fetchProvenanceChildren).toHaveBeenCalledWith(
      'P.empty',
    )
  })
})
