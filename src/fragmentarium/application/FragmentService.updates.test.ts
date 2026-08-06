import { Fragment } from 'fragmentarium/domain/fragment'
import { produce, castDraft, Draft } from 'immer'
import { Genres } from 'fragmentarium/domain/Genres'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Archaeology } from 'fragmentarium/domain/archaeology'
import {
  ArchaeologyDto,
  toArchaeologyDto,
} from 'fragmentarium/domain/archaeologyDtos'
import { archaeologyFactory } from 'test-support/fragment-data-fixtures'
import {
  buildFragmentWithReferences,
  createFragmentServiceTestContext,
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

const { fragmentRepository, bibliographyService, fragmentService } =
  createFragmentServiceTestContext()

const genres: Genres = Genres.fromJson([
  { category: ['ARCHIVE', 'Administrative'], uncertain: false },
])
const date: MesopotamianDate = MesopotamianDate.fromJson({
  year: { value: '1' },
  month: { value: '1' },
  day: { value: '1' },
  king: { orderGlobal: 1 },
  isSeleucidEra: true,
})
const datesInText: MesopotamianDate[] = [date]
const scopes = ['read:fragments', 'write:fragments']

let fragment: Fragment
let result: Fragment
let expectedFragment: Fragment

beforeEach(() => {
  fragment = buildFragmentWithReferences('K.1')
  rejectBibliographyLookups(bibliographyService)
})

describe('update edition', () => {
  const edition = {
    transliteration: '1. kur',
    notes: 'notes',
    introduction: 'Introductory @i{text}',
  }

  beforeEach(async () => {
    fragmentRepository.updateEdition.mockReturnValue(Promise.resolve(fragment))
    result = await fragmentService.updateEdition(fragment.number, edition)
  })

  test('Returns updated fragment', () => expect(result).toEqual(fragment))
  test('Finds correct fragment', () => {
    expect(fragmentRepository.updateEdition).toHaveBeenCalledWith(
      fragment.number,
      edition,
    )
  })
})

describe('update genre', () => {
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

describe.each([
  {
    description: 'update script',
    repositoryMethod: fragmentRepository.updateScript,
    expectedValue: () => fragment.script,
    extraArgs: [],
    serviceCall: (number: string) =>
      fragmentService.updateScript(number, fragment.script),
  },
  {
    description: 'update scopes',
    repositoryMethod: fragmentRepository.updateScopes,
    expectedValue: () => scopes,
    extraArgs: [],
    serviceCall: (number: string) =>
      fragmentService.updateScopes(number, scopes),
  },
])(
  '$description',
  ({ repositoryMethod, expectedValue, extraArgs, serviceCall }) => {
    beforeEach(async () => {
      repositoryMethod.mockReturnValue(Promise.resolve(fragment))
      result = await serviceCall(fragment.number)
    })

    test('returns updated fragment', () => expect(result).toEqual(fragment))
    test('calls repository with correct parameters', () =>
      expect(repositoryMethod).toHaveBeenCalledWith(
        fragment.number,
        expectedValue(),
        ...extraArgs,
      ))
  },
)

describe('update date', () => {
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

describe('update archaeology', () => {
  let archaeology: Archaeology
  let archaeologyDto: ArchaeologyDto

  beforeEach(async () => {
    archaeology = archaeologyFactory.build()
    archaeologyDto = toArchaeologyDto(archaeology)
    expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
      draft.archaeology = castDraft(archaeology)
    })
    fragmentRepository.updateArchaeology.mockReturnValue(
      Promise.resolve(expectedFragment),
    )
    result = await fragmentService.updateArchaeology(
      fragment.number,
      archaeologyDto,
    )
  })

  test('returns updated fragment', () =>
    expect(result).toEqual(expectedFragment))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.updateArchaeology).toHaveBeenCalledWith(
      fragment.number,
      archaeologyDto,
    ))
})
