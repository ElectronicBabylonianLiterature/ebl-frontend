import Promise from 'bluebird'
import {
  colophonNamesOptions,
  fragmentRepository,
  fragmentService,
  genreOptions,
  stubMissingBibliography,
} from 'fragmentarium/application/fragmentServiceFragments.testSupport'

let genreResult: string[][]
let colophonNamesResult: string[]

beforeEach(() => {
  jest.clearAllMocks()
  stubMissingBibliography()
})

describe('fetch genres', () => {
  beforeEach(async () => {
    fragmentRepository.fetchGenres.mockReturnValue(
      Promise.resolve(genreOptions),
    )
    genreResult = await fragmentService.fetchGenres()
  })
  test('returns genres', () => expect(genreResult).toEqual(genreOptions))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.fetchGenres).toHaveBeenCalled())
})

describe('fetch periods', () => {
  let periodsResult: string[]
  const periodsOptions = ['Old Babylonian']

  beforeEach(async () => {
    fragmentRepository.fetchPeriods.mockReturnValue(
      Promise.resolve(periodsOptions),
    )
    periodsResult = await fragmentService.fetchPeriods()
  })

  test('returns periods', () => expect(periodsResult).toEqual(periodsOptions))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.fetchPeriods).toHaveBeenCalled())
})

describe('fetch colophon names', () => {
  beforeEach(async () => {
    fragmentRepository.fetchColophonNames.mockReturnValue(
      Promise.resolve(colophonNamesOptions),
    )
    colophonNamesResult = await fragmentService.fetchColophonNames('u')
  })
  test('returns names', () =>
    expect(colophonNamesResult).toEqual(colophonNamesOptions))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.fetchColophonNames).toHaveBeenCalled())
})
