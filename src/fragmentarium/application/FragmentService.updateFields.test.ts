import Promise from 'bluebird'
import { castDraft, Draft, produce } from 'immer'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  buildTestFragment,
  date,
  datesInText,
  fragmentRepository,
  fragmentService,
  genres,
  stubMissingBibliography,
} from 'fragmentarium/application/fragmentServiceFragments.testSupport'

let fragment: Fragment
let result: Fragment

beforeEach(() => {
  jest.clearAllMocks()
  fragment = buildTestFragment()
  stubMissingBibliography()
})

describe('update genre', () => {
  let expectedFragment: Fragment

  beforeEach(async () => {
    expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
      draft.genres = castDraft(genres)
    })
    fragmentRepository.updateGenres.mockReturnValue(
      Promise.resolve(expectedFragment),
    )
    result = await fragmentService.updateGenres(fragment.number, genres)
  })
  test('returns updated fragment', () =>
    expect(result).toEqual(expectedFragment))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.updateGenres).toHaveBeenCalledWith(
      fragment.number,
      genres,
    ))
})

const scopes = ['read:fragments', 'write:fragments']

describe.each([
  {
    description: 'update script',
    repositoryMethod: fragmentRepository.updateScript,
    expectedValue: () => fragment.script,
    serviceCall: (number: string) =>
      fragmentService.updateScript(number, fragment.script),
  },
  {
    description: 'update scopes',
    repositoryMethod: fragmentRepository.updateScopes,
    expectedValue: () => scopes,
    serviceCall: (number: string) =>
      fragmentService.updateScopes(number, scopes),
  },
])('$description', ({ repositoryMethod, expectedValue, serviceCall }) => {
  beforeEach(async () => {
    repositoryMethod.mockReturnValue(Promise.resolve(fragment))
    result = await serviceCall(fragment.number)
  })

  test('returns updated fragment', () => expect(result).toEqual(fragment))
  test('calls repository with correct parameters', () =>
    expect(repositoryMethod).toHaveBeenCalledWith(
      fragment.number,
      expectedValue(),
    ))
})

describe('update date', () => {
  let expectedFragment: Fragment

  beforeEach(async () => {
    expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
      draft.date = castDraft(date)
    })
    fragmentRepository.updateDate.mockReturnValue(
      Promise.resolve(expectedFragment),
    )
    result = await fragmentService.updateDate(fragment.number, date.toDto())
  })
  test('returns updated fragment', () =>
    expect(result).toEqual(expectedFragment))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.updateDate).toHaveBeenCalledWith(
      fragment.number,
      date.toDto(),
    ))
})

describe('delete date', () => {
  let expectedFragment: Fragment

  beforeEach(async () => {
    expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
      draft.date = undefined
    })
    fragmentRepository.updateDate.mockReturnValue(
      Promise.resolve(expectedFragment),
    )
    result = await fragmentService.updateDate(fragment.number, undefined)
  })
  test('returns updated fragment', () =>
    expect(result).toEqual(expectedFragment))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.updateDate).toHaveBeenCalledWith(
      fragment.number,
      undefined,
    ))
})

describe('update dates in text', () => {
  let expectedFragment: Fragment

  beforeEach(async () => {
    expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
      draft.datesInText = castDraft(datesInText)
    })
    fragmentRepository.updateDatesInText.mockReturnValue(
      Promise.resolve(expectedFragment),
    )
    result = await fragmentService.updateDatesInText(
      fragment.number,
      datesInText.filter((date) => date).map((date) => date.toDto()),
    )
  })
  test('returns updated fragment', () =>
    expect(result).toEqual(expectedFragment))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.updateDatesInText).toHaveBeenCalledWith(
      fragment.number,
      datesInText.filter((date) => date).map((date) => date.toDto()),
    ))
})
