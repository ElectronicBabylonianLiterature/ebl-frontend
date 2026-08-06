import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  cachedFragmentNumber,
  CacheTestContext,
  createCacheTestContext,
  edition,
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
const otherNumber = 'K.2'

let context: CacheTestContext

beforeEach(() => {
  context = createCacheTestContext()
})

test('keeps cached fragments for other numbers after an update', async () => {
  const {
    fragmentRepository,
    fragmentService,
    cachedFragment,
    updatedFragment,
  } = context
  const otherFragment = fragmentFactory.build({ number: otherNumber })
  fragmentRepository.find
    .mockReturnValueOnce(Promise.resolve(cachedFragment))
    .mockReturnValueOnce(Promise.resolve(otherFragment))
  fragmentRepository.updateEdition.mockReturnValue(
    Promise.resolve(updatedFragment),
  )

  await fragmentService.find(number)
  await fragmentService.find(otherNumber)
  await fragmentService.updateEdition(number, edition)

  await expect(fragmentService.find(otherNumber)).resolves.toMatchObject({
    number: otherFragment.number,
  })
  expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
})

test('keeps in-flight reads for other numbers after an update', async () => {
  const { fragmentRepository, fragmentService, updatedFragment } = context
  const otherFragment = fragmentFactory.build({ number: otherNumber })
  let resolveOtherRead: (fragment: Fragment) => void = () => undefined
  fragmentRepository.find.mockReturnValueOnce(
    new Promise<Fragment>((resolve) => {
      resolveOtherRead = resolve
    }),
  )
  fragmentRepository.updateEdition.mockReturnValue(
    Promise.resolve(updatedFragment),
  )

  const inFlightOtherRead = fragmentService.find(otherNumber)
  await fragmentService.updateEdition(number, edition)

  resolveOtherRead(otherFragment)

  await expect(inFlightOtherRead).resolves.toMatchObject({
    number: otherFragment.number,
  })
  await expect(fragmentService.find(otherNumber)).resolves.toMatchObject({
    number: otherFragment.number,
  })
  expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
})
