import Promise from 'bluebird'
import Folio from 'fragmentarium/domain/Folio'
import { fragment } from 'test-support/test-fragment'
import createLemmatizationTestText from 'test-support/test-text'
import { TestData, testDelegation } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import FragmentService from './FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import produce, { castDraft, Draft } from 'immer'
import { Genres } from 'fragmentarium/domain/Genres'
import Word from 'dictionary/domain/Word'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import LemmatizationFactory from './LemmatizationFactory'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import {
  fragmentFactory,
  manuscriptAttestationFactory,
} from 'test-support/fragment-fixtures'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { wordFactory } from 'test-support/word-fixtures'
import { silenceConsoleErrors } from 'setupTests'
import { QueryResult } from 'query/QueryResult'
import { MesopotamianDate } from 'fragmentarium/domain/Date'

jest.mock('./LemmatizationFactory')

jest.mock('bibliography/application/BibliographyService', () => {
  return function () {
    return { find: jest.fn(), search: jest.fn() }
  }
})

jest.mock('dictionary/infrastructure/WordRepository', () => {
  return function () {
    return { searchLemma: jest.fn(), find: jest.fn() }
  }
})
const resultStub = {}
const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
const word: Word = wordFactory.build()
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  updateTransliteration: jest.fn(),
  updateIntroduction: jest.fn(),
  updateNotes: jest.fn(),
  updateLemmatization: jest.fn(),
  fetchGenres: jest.fn(),
  updateGenres: jest.fn(),
  updateScript: jest.fn(),
  updateDate: jest.fn(),
  updateDatesInText: jest.fn(),
  fetchPeriods: jest.fn(),
  updateReferences: jest.fn(),
  updateArchaeology: jest.fn(),
  folioPager: jest.fn(),
  fragmentPager: jest.fn(),
  findLemmas: jest.fn(),
  fetchCdliInfo: jest.fn(),
  findAnnotations: jest.fn(),
  updateAnnotations: jest.fn(),
  lineToVecRanking: jest.fn(),
  findInCorpus: jest.fn(),
  query: jest.fn(),
  listAllFragments: jest.fn(),
}

const imageRepository = {
  find: jest.fn(),
  findFolio: jest.fn(),
  findPhoto: jest.fn(),
}
const bibliographyService = new (BibliographyService as jest.Mock)()
const wordRepository = new (WordRepository as jest.Mock)()
const fragmentService = new FragmentService(
  fragmentRepository,
  imageRepository,
  wordRepository,
  bibliographyService
)
const lemmas = 'foo I+bar II'
const queryResultStub: QueryResult = { items: [], matchCountTotal: 0 }

const testData: TestData<FragmentService>[] = [
  new TestData('statistics', [], fragmentRepository.statistics, resultStub),
  new TestData(
    'lineToVecRanking',
    ['X.0'],
    fragmentRepository.lineToVecRanking,
    resultStub
  ),
  new TestData('findFolio', [folio], imageRepository.findFolio, resultStub, [
    folio,
  ]),
  new TestData('findImage', [fileName], imageRepository.find, resultStub, [
    fileName,
  ]),
  new TestData('findPhoto', [fragment], imageRepository.findPhoto, resultStub, [
    fragment.number,
  ]),
  new TestData(
    'folioPager',
    [folio, 'K.1'],
    fragmentRepository.folioPager,
    resultStub
  ),
  new TestData(
    'fragmentPager',
    ['K.1'],
    fragmentRepository.fragmentPager,
    resultStub
  ),
  new TestData('searchLemma', ['lemma'], wordRepository.searchLemma, [
    resultStub,
  ]),
  new TestData(
    'searchBibliography',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyService.search,
    [resultStub]
  ),
  new TestData(
    'fetchCdliInfo',
    [fragment],
    fragmentRepository.fetchCdliInfo,
    resultStub,
    [fragment.cdliNumber]
  ),
  new TestData(
    'findAnnotations',
    [fragment.number, false],
    fragmentRepository.findAnnotations,
    resultStub
  ),
  new TestData(
    'generateAnnotations',
    [fragment.number, true],
    fragmentRepository.findAnnotations,
    resultStub
  ),
  new TestData(
    'updateAnnotations',
    [fragment.number, resultStub],
    fragmentRepository.updateAnnotations,
    resultStub
  ),
  new TestData(
    'findSuggestions',
    ['kur', true],
    fragmentRepository.findLemmas,
    [[new Lemma(word)]],
    ['kur', true],
    Promise.resolve([[word]])
  ),
  new TestData(
    'listAllFragments',
    [],
    fragmentRepository.listAllFragments,
    [],
    [],
    Promise.resolve([])
  ),
]

testDelegation(fragmentService, testData)

describe.each(['searchLemma'])('%s', (method) => {
  test('Resolves to empty array on zero length query', async () => {
    await expect(fragmentService[method]('')).resolves.toEqual([])
  })
})

describe('methods returning fragment', () => {
  const number = 'K.1'
  let fragment: Fragment
  let result: Fragment
  let genreResult: string[][]
  const genreOptions = [['ARCHIVE', 'Administrative']]
  const genres: Genres = Genres.fromJson([
    {
      category: ['ARCHIVE', 'Administrative'],
      uncertain: false,
    },
  ])
  const date: MesopotamianDate = MesopotamianDate.fromJson({
    year: { value: '1' },
    month: { value: '1' },
    day: { value: '1' },
    isSeleucidEra: true,
  })
  const datesInText: MesopotamianDate[] = [date]

  beforeEach(() => {
    const references = bibliographyEntryFactory
      .buildList(2)
      .map((entry: BibliographyEntry) =>
        referenceFactory.build({}, { associations: { document: entry } })
      )
    fragment = fragmentFactory.build(
      {
        number: number,
      },
      {
        associations: {
          references: references,
          genres: new Genres([]),
        },
      }
    )
    bibliographyService.find.mockImplementation((id: string) =>
      Promise.reject(new Error(`${id} not found.`))
    )
    silenceConsoleErrors()
  })

  describe('find', () => {
    beforeEach(async () => {
      fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
      result = await fragmentService.find(number)
    })

    test('Returns fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () => {
      expect(fragmentRepository.find).toHaveBeenCalledWith(
        number,
        undefined,
        undefined
      )
    })
  })

  describe('Reject with permission denied', () => {
    test('Throws permission error', async () => {
      fragmentRepository.find.mockReturnValueOnce(
        Promise.reject(new Error('403 Forbidden'))
      )
      expect(fragmentRepository.find('X.1')).rejects.toThrowError(
        "You don't have permissions to view this fragment."
      )
    })
  })

  describe('update transliteration', () => {
    const transliteration = '1. kur'

    beforeEach(async () => {
      fragmentRepository.updateTransliteration.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateTransliteration(
        fragment.number,
        transliteration
      )
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateTransliteration).toHaveBeenCalledWith(
        fragment.number,
        transliteration
      ))
  })
  describe('update introduction', () => {
    const introduction = 'Introductory @i{text}'

    beforeEach(async () => {
      fragmentRepository.updateIntroduction.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateIntroduction(
        fragment.number,
        introduction
      )
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateIntroduction).toHaveBeenCalledWith(
        fragment.number,
        introduction
      ))
  })
  describe('update notes', () => {
    const notes = 'Notes @i{text}'

    beforeEach(async () => {
      fragmentRepository.updateNotes.mockReturnValue(Promise.resolve(fragment))
      result = await fragmentService.updateNotes(fragment.number, notes)
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateNotes).toHaveBeenCalledWith(
        fragment.number,
        notes
      ))
  })
  describe('update edition', () => {
    const transliteration = '1. kur'
    const notes = 'notes'
    const introduction = 'Introductory @i{text}'

    beforeEach(async () => {
      fragmentRepository.updateIntroduction.mockReturnValue(
        Promise.resolve(fragment)
      )
      fragmentRepository.updateNotes.mockReturnValue(Promise.resolve(fragment))
      fragmentRepository.updateTransliteration.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateEdition(
        fragment.number,
        transliteration,
        notes,
        introduction
      )
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () => {
      expect(fragmentRepository.updateTransliteration).toHaveBeenCalledWith(
        fragment.number,
        transliteration
      )
      expect(fragmentRepository.updateIntroduction).toHaveBeenCalledWith(
        fragment.number,
        introduction
      )
      expect(fragmentRepository.updateNotes).toHaveBeenCalledWith(
        fragment.number,
        notes
      )
    })
  })
  describe('fetch genres', () => {
    beforeEach(async () => {
      fragmentRepository.fetchGenres.mockReturnValue(
        Promise.resolve(genreOptions)
      )
      genreResult = await fragmentService.fetchGenres()
    })
    test('returns genres', () => expect(genreResult).toEqual(genreOptions))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.fetchGenres).toHaveBeenCalled())
  })

  describe('update genre', () => {
    let expectedFragment: Fragment

    beforeEach(async () => {
      expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
        draft.genres = castDraft(genres)
      })
      fragmentRepository.updateGenres.mockReturnValue(
        Promise.resolve(expectedFragment)
      )
      result = await fragmentService.updateGenres(fragment.number, genres)
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateGenres).toHaveBeenCalledWith(
        fragment.number,
        genres
      ))
  })

  describe('update date', () => {
    let expectedFragment: Fragment

    beforeEach(async () => {
      expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
        draft.date = castDraft(date)
      })
      fragmentRepository.updateDate.mockReturnValue(
        Promise.resolve(expectedFragment)
      )
      result = await fragmentService.updateDate(fragment.number, date)
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateDate).toHaveBeenCalledWith(
        fragment.number,
        date
      ))
  })

  describe('update dates in text', () => {
    let expectedFragment: Fragment

    beforeEach(async () => {
      expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
        draft.datesInText = castDraft(datesInText)
      })
      fragmentRepository.updateDatesInText.mockReturnValue(
        Promise.resolve(expectedFragment)
      )
      result = await fragmentService.updateDatesInText(
        fragment.number,
        datesInText
      )
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateDatesInText).toHaveBeenCalledWith(
        fragment.number,
        datesInText
      ))
  })

  describe('update lemmatization', () => {
    const lemmatization: Lemmatization = new Lemmatization(
      ['1.'],
      [[new LemmatizationToken('kur', true, [])]]
    )

    beforeEach(async () => {
      fragmentRepository.updateLemmatization.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateLemmatization(
        fragment.number,
        lemmatization.toDto()
      )
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateLemmatization).toHaveBeenCalledWith(
        fragment.number,
        lemmatization.toDto()
      ))
  })

  describe('update references', () => {
    beforeEach(async () => {
      fragmentRepository.updateReferences.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateReferences(
        fragment.number,
        fragment.references
      )
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateReferences).toHaveBeenCalledWith(
        fragment.number,
        fragment.references
      ))
  })
})

test('createLemmatization', async () => {
  const [text] = await createLemmatizationTestText()
  const lemmatization = new Lemmatization([], [])

  const createLemmatization = jest.fn<Promise<Lemmatization>, [Text]>()
  createLemmatization.mockReturnValue(Promise.resolve(lemmatization))
  const MockLemmatizationFactory = LemmatizationFactory as jest.Mock
  MockLemmatizationFactory.mockImplementation(() => ({
    createLemmatization,
  }))

  const result = await fragmentService.createLemmatization(text)
  expect(MockLemmatizationFactory).toHaveBeenCalledWith(
    fragmentService,
    wordRepository
  )
  expect(createLemmatization).toBeCalledWith(text)
  expect(result).toEqual(lemmatization)
})

describe('search for fragment in corpus', () => {
  const number = 'K.1'
  const manuscriptAttestation = [
    manuscriptAttestationFactory.build(
      {},
      {
        transient: { museumNumber: number },
      }
    ),
  ]
  let result: ManuscriptAttestation[]
  beforeEach(async () => {
    fragmentRepository.findInCorpus.mockReturnValue(
      Promise.resolve(manuscriptAttestation)
    )
    result = [...(await fragmentService.findInCorpus(number))]
  })
  test('returns attestation data', () => {
    expect(result).toEqual(manuscriptAttestation)
  })
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.findInCorpus).toHaveBeenCalled())
})

const queryTestCases = [
  { lemmas: 'ina I' },
  { lemmas: lemmas, queryOperator: 'and' },
  { lemmas: lemmas, queryOperator: 'or' },
  { lemmas: lemmas, queryOperator: 'line' },
  { lemmas: lemmas, queryOperator: 'phrase' },
  { bibId: 'id' },
  { bibId: 'id', pages: '42' },
  { transliteration: 'me lik\nkur kur' },
  { number: 'X.1' },
  {
    number: 'M.2',
    bibId: 'id',
    pages: '123',
    transliteration: 'ana',
    lemmas: 'šumma I+ina I+qanû I',
    lemmaOperator: 'line',
  },
]

const queryTestData: TestData<FragmentService>[] = queryTestCases.map(
  (parameters) =>
    new TestData(
      'query',
      [parameters],
      fragmentRepository.query,
      queryResultStub,
      [parameters],
      Promise.resolve(queryResultStub)
    )
)

describe('Query FragmentService', () =>
  testDelegation(fragmentService, queryTestData))
