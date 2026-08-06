import { Fragment } from 'fragmentarium/domain/fragment'
import {
  buildFragmentWithReferences,
  createFragmentServiceTestContext,
  FragmentServiceTestContext,
  rejectBibliographyLookups,
} from 'fragmentarium/application/FragmentService.testSupport'

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

const number = 'K.1'
const genreOptions = [['ARCHIVE', 'Administrative']]
const colophonNamesOptions = [['Humbaba', 'Enkidu']]

let context: FragmentServiceTestContext
let fragment: Fragment

beforeEach(() => {
  context = createFragmentServiceTestContext()
  fragment = buildFragmentWithReferences(number)
  rejectBibliographyLookups(context.bibliographyService)
})

describe('find', () => {
  let result: Fragment

  beforeEach(async () => {
    context.fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
    result = await context.createService().find(number)
  })

  test('Returns fragment', () => expect(result).toEqual(fragment))
  test('Finds correct fragment', () => {
    expect(context.fragmentRepository.find).toHaveBeenCalledWith(
      number,
      undefined,
      undefined,
    )
  })
})

describe('Reject with permission denied', () => {
  test('Throws permission error', async () => {
    context.fragmentRepository.find.mockReturnValueOnce(
      Promise.reject(new Error('403 Forbidden')),
    )
    await expect(context.fragmentService.find('X.1')).rejects.toThrowError(
      "You don't have permissions to view this fragment.",
    )
  })
})

describe('fetch genres', () => {
  let genreResult: string[][]

  beforeEach(async () => {
    context.fragmentRepository.fetchGenres.mockReturnValue(
      Promise.resolve(genreOptions),
    )
    genreResult = await context.fragmentService.fetchGenres()
  })

  test('returns genres', () => expect(genreResult).toEqual(genreOptions))
  test('calls repository with correct parameters', () =>
    expect(context.fragmentRepository.fetchGenres).toHaveBeenCalled())
})

describe('fetch periods', () => {
  let periodsResult: string[]
  const periodsOptions = ['Old Babylonian']

  beforeEach(async () => {
    context.fragmentRepository.fetchPeriods.mockReturnValue(
      Promise.resolve(periodsOptions),
    )
    periodsResult = await context.fragmentService.fetchPeriods()
  })

  test('returns periods', () => expect(periodsResult).toEqual(periodsOptions))
  test('calls repository with correct parameters', () =>
    expect(context.fragmentRepository.fetchPeriods).toHaveBeenCalled())
})

describe('fetch colophon names', () => {
  let colophonNamesResult: string[]

  beforeEach(async () => {
    context.fragmentRepository.fetchColophonNames.mockReturnValue(
      Promise.resolve(colophonNamesOptions),
    )
    colophonNamesResult = await context.fragmentService.fetchColophonNames('u')
  })

  test('returns names', () =>
    expect(colophonNamesResult).toEqual(colophonNamesOptions))
  test('calls repository with correct parameters', () =>
    expect(context.fragmentRepository.fetchColophonNames).toHaveBeenCalled())
})
