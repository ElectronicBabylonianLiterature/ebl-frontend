import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  cachedFragmentNumber,
  CacheTestContext,
  createCacheTestContext,
  withExpiredCacheTimestamp,
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

test('caches fragment reads by number and line options', async () => {
  const { fragmentRepository, fragmentService, cachedFragment } = context
  fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

  await expect(fragmentService.find(number, [1], true)).resolves.toMatchObject({
    number: cachedFragment.number,
  })
  await expect(fragmentService.find(number, [1], true)).resolves.toMatchObject({
    number: cachedFragment.number,
  })

  expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  expect(fragmentRepository.find).toHaveBeenCalledWith(number, [1], true)
})

test('fetches fragment reads separately for different line options', async () => {
  const { fragmentRepository, fragmentService, cachedFragment } = context
  fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

  await fragmentService.find(number, [1], true)
  await fragmentService.find(number, [2], true)

  expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
})

test('shares in-flight fragment reads', async () => {
  const { fragmentRepository, fragmentService, cachedFragment } = context
  fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

  const firstResult = fragmentService.find(number)
  const secondResult = fragmentService.find(number)

  await expect(firstResult).resolves.toMatchObject({
    number: cachedFragment.number,
  })
  await expect(secondResult).resolves.toMatchObject({
    number: cachedFragment.number,
  })
  expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
})

test('does not cache failed fragment reads', async () => {
  const { fragmentRepository, fragmentService, cachedFragment } = context
  fragmentRepository.find
    .mockReturnValueOnce(Promise.reject(new Error('failed')))
    .mockReturnValueOnce(Promise.resolve(cachedFragment))

  await expect(fragmentService.find(number)).rejects.toThrow('failed')
  await expect(fragmentService.find(number)).resolves.toMatchObject({
    number: cachedFragment.number,
  })
  expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
})

test('refreshes expired fragment reads', async () => {
  const {
    fragmentRepository,
    fragmentService,
    cachedFragment,
    updatedFragment,
  } = context
  fragmentRepository.find
    .mockReturnValueOnce(Promise.resolve(cachedFragment))
    .mockReturnValueOnce(Promise.resolve(updatedFragment))

  await withExpiredCacheTimestamp(async (expireCache) => {
    await expect(fragmentService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    expireCache()
    await expect(fragmentService.find(number)).resolves.toMatchObject({
      number: updatedFragment.number,
    })
  })

  expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
})

test('evicts oldest fragment cache entry when max size is exceeded', async () => {
  const { fragmentRepository, fragmentService } = context
  fragmentRepository.find.mockImplementation((fragmentNumber: string) =>
    Promise.resolve(fragmentFactory.build({ number: fragmentNumber })),
  )

  for (let index = 0; index <= 250; index += 1) {
    await fragmentService.find(`K.${index}`)
  }

  await fragmentService.find('K.0')

  expect(fragmentRepository.find).toHaveBeenCalledTimes(252)
})

test('caches thumbnails by fragment number and size', async () => {
  const { imageRepository, fragmentService, cachedFragment } = context
  const thumbnail = { blob: null }
  imageRepository.findThumbnail.mockReturnValue(Promise.resolve(thumbnail))

  await expect(
    fragmentService.findThumbnail(cachedFragment, 'small'),
  ).resolves.toBe(thumbnail)
  await expect(
    fragmentService.findThumbnail(cachedFragment, 'small'),
  ).resolves.toBe(thumbnail)

  expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(1)
  expect(imageRepository.findThumbnail).toHaveBeenCalledWith(number, 'small')
})

test('refreshes expired thumbnails', async () => {
  const { imageRepository, fragmentService, cachedFragment } = context
  const thumbnail = { blob: null }
  const refreshedThumbnail = { blob: new Blob(['refreshed']) }
  imageRepository.findThumbnail
    .mockReturnValueOnce(Promise.resolve(thumbnail))
    .mockReturnValueOnce(Promise.resolve(refreshedThumbnail))

  await withExpiredCacheTimestamp(async (expireCache) => {
    await expect(
      fragmentService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(thumbnail)
    expireCache()
    await expect(
      fragmentService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(refreshedThumbnail)
  })

  expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(2)
})

test('evicts oldest thumbnail cache entry when max size is exceeded', async () => {
  const { imageRepository, fragmentService } = context
  imageRepository.findThumbnail.mockImplementation((fragmentNumber: string) =>
    Promise.resolve({ blob: new Blob([fragmentNumber]) }),
  )

  for (let index = 0; index <= 250; index += 1) {
    await fragmentService.findThumbnail(
      fragmentFactory.build({ number: `K.${index}` }),
      'small',
    )
  }

  await fragmentService.findThumbnail(
    fragmentFactory.build({ number: 'K.0' }),
    'small',
  )

  expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(252)
})
