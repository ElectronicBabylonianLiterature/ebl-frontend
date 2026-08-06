import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  cachedFragmentNumber,
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

const number = cachedFragmentNumber

const buildProvenanceList = (
  id: string,
  longName: string,
  abbreviation: string,
  parent: string,
): readonly ProvenanceRecord[] => [
  {
    id: id,
    longName: longName,
    abbreviation: abbreviation,
    parent: parent,
    sortKey: 1,
  },
]

let context: CacheTestContext

beforeEach(() => {
  context = createCacheTestContext()
})

test('clears cached fragment values when cache scope changes', async () => {
  const { fragmentRepository, createService, cachedFragment, updatedFragment } =
    context
  let cacheScope = 'guest'
  const scopedService = createService(() => cacheScope)
  fragmentRepository.find
    .mockReturnValueOnce(Promise.resolve(cachedFragment))
    .mockReturnValueOnce(Promise.resolve(updatedFragment))

  await expect(scopedService.find(number)).resolves.toMatchObject({
    number: cachedFragment.number,
  })
  await expect(scopedService.find(number)).resolves.toMatchObject({
    number: cachedFragment.number,
  })

  cacheScope = 'authenticated:user'
  await expect(scopedService.find(number)).resolves.toMatchObject({
    number: updatedFragment.number,
  })

  expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
})

test('uses default cache scope when cache scope resolver throws', async () => {
  const { fragmentRepository, createService, cachedFragment } = context
  const scopedService = createService(() => {
    throw new Error('scope resolver failed')
  })
  fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

  await expect(scopedService.find(number)).resolves.toMatchObject({
    number: cachedFragment.number,
  })
  await expect(scopedService.find(number)).resolves.toMatchObject({
    number: cachedFragment.number,
  })

  expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
})

test('clears cached thumbnail values across auth transitions', async () => {
  const { imageRepository, createService, cachedFragment } = context
  let cacheScope = 'guest'
  const scopedService = createService(() => cacheScope)
  const guestThumbnail = { blob: new Blob(['guest']) }
  const userAThumbnail = { blob: new Blob(['user-a']) }
  const userBThumbnail = { blob: new Blob(['user-b']) }
  const guestThumbnailAfterLogout = { blob: new Blob(['guest-after']) }

  imageRepository.findThumbnail
    .mockReturnValueOnce(Promise.resolve(guestThumbnail))
    .mockReturnValueOnce(Promise.resolve(userAThumbnail))
    .mockReturnValueOnce(Promise.resolve(userBThumbnail))
    .mockReturnValueOnce(Promise.resolve(guestThumbnailAfterLogout))

  await expect(
    scopedService.findThumbnail(cachedFragment, 'small'),
  ).resolves.toBe(guestThumbnail)
  await expect(
    scopedService.findThumbnail(cachedFragment, 'small'),
  ).resolves.toBe(guestThumbnail)

  cacheScope = 'authenticated:user-a'
  await expect(
    scopedService.findThumbnail(cachedFragment, 'small'),
  ).resolves.toBe(userAThumbnail)

  cacheScope = 'authenticated:user-b'
  await expect(
    scopedService.findThumbnail(cachedFragment, 'small'),
  ).resolves.toBe(userBThumbnail)

  cacheScope = 'guest'
  await expect(
    scopedService.findThumbnail(cachedFragment, 'small'),
  ).resolves.toBe(guestThumbnailAfterLogout)

  expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(4)
})

test('clears cached provenance values across auth transitions', async () => {
  const { fragmentRepository, createService } = context
  let cacheScope = 'guest'
  const scopedService = createService(() => cacheScope)
  const guestProvenances = buildProvenanceList(
    'guest-site',
    'Guest Site',
    'GS',
    'Guest',
  )
  const userAProvenances = buildProvenanceList(
    'user-a-site',
    'User A Site',
    'UA',
    'User A',
  )
  const userBProvenances = buildProvenanceList(
    'user-b-site',
    'User B Site',
    'UB',
    'User B',
  )
  const guestProvenancesAfterLogout = buildProvenanceList(
    'guest-site-after',
    'Guest Site After',
    'GSA',
    'Guest',
  )

  fragmentRepository.fetchProvenances
    .mockReturnValueOnce(Promise.resolve(guestProvenances))
    .mockReturnValueOnce(Promise.resolve(userAProvenances))
    .mockReturnValueOnce(Promise.resolve(userBProvenances))
    .mockReturnValueOnce(Promise.resolve(guestProvenancesAfterLogout))

  await expect(scopedService.fetchProvenances()).resolves.toEqual(
    guestProvenances,
  )
  await expect(scopedService.fetchProvenances()).resolves.toEqual(
    guestProvenances,
  )

  cacheScope = 'authenticated:user-a'
  await expect(scopedService.fetchProvenances()).resolves.toEqual(
    userAProvenances,
  )

  cacheScope = 'authenticated:user-b'
  await expect(scopedService.fetchProvenances()).resolves.toEqual(
    userBProvenances,
  )

  cacheScope = 'guest'
  await expect(scopedService.fetchProvenances()).resolves.toEqual(
    guestProvenancesAfterLogout,
  )

  expect(fragmentRepository.fetchProvenances).toHaveBeenCalledTimes(4)
})
