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
  uncertainFragmentAttestationFactory,
} from 'test-support/fragment-fixtures'
import { archaeologyFactory } from 'test-support/fragment-data-fixtures'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { wordFactory } from 'test-support/word-fixtures'
import { silenceConsoleErrors } from 'setupTests'
import { QueryResult } from 'query/QueryResult'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Archaeology } from 'fragmentarium/domain/archaeology'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { toArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'

jest.mock('./LemmatizationFactory')

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

const resultStub = {}
const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
const word: Word = wordFactory.build()
const lemmaSuggestions = new Map([['foo', new LemmaOption(word)]])
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  updateLemmatization: jest.fn(),
  updateGenres: jest.fn(),
  updateScript: jest.fn(),
  updateDate: jest.fn(),
  updateDatesInText: jest.fn(),
  fetchGenres: jest.fn(),
  fetchProvenances: jest.fn(),
  fetchPeriods: jest.fn(),
  fetchColophonNames: jest.fn(),
  updateReferences: jest.fn(),
  updateArchaeology: jest.fn(),
  updateColophon: jest.fn(),
  folioPager: jest.fn(),
  fragmentPager: jest.fn(),
  findLemmas: jest.fn(),
  findAnnotations: jest.fn(),
  updateAnnotations: jest.fn(),
  lineToVecRanking: jest.fn(),
  findInCorpus: jest.fn(),
  query: jest.fn(),
  queryLatest: jest.fn(),
  listAllFragments: jest.fn(),
  queryByTraditionalReferences: jest.fn(),
  updateScopes: jest.fn(),
  updateEdition: jest.fn(),
  updateLemmaAnnotation: jest.fn(),
  collectLemmaSuggestions: jest.fn(),
  fetchNamedEntityAnnotations: jest.fn(),
  updateNamedEntityAnnotations: jest.fn(),
}

const imageRepository = {
  find: jest.fn(),
  findFolio: jest.fn(),
  findPhoto: jest.fn(),
  findThumbnail: jest.fn(),
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
    'findThumbnail',
    [fragment, 'small'],
    imageRepository.findThumbnail,
    resultStub,
    [fragment.number, 'small']
  ),
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
  new TestData(
    'collectLemmaSuggestions',
    ['K.1'],
    fragmentRepository.collectLemmaSuggestions,
    lemmaSuggestions,
    ['K.1'],
    Promise.resolve(lemmaSuggestions)
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
  let colophonNamesResult: string[]
  const genreOptions = [['ARCHIVE', 'Administrative']]
  const genres: Genres = Genres.fromJson([
    { category: ['ARCHIVE', 'Administrative'], uncertain: false },
  ])
  const colophonNamesOptions = [['Humbaba', 'Enkidu']]
  const date: MesopotamianDate = MesopotamianDate.fromJson({
    year: { value: '1' },
    month: { value: '1' },
    day: { value: '1' },
    king: { orderGlobal: 1 },
    isSeleucidEra: true,
  })
  const datesInText: MesopotamianDate[] = [date]
  let archaeology: Archaeology
  let archaeologyDto: ArchaeologyDto

  beforeEach(() => {
    const references = bibliographyEntryFactory
      .buildList(2)
      .map((entry: BibliographyEntry) =>
        referenceFactory.build({}, { associations: { document: entry } })
      )
    fragment = fragmentFactory.build(
      { number: number },
      { associations: { references: references, genres: new Genres([]) } }
    )
    bibliographyService.find.mockImplementation((id: string) =>
      Promise.reject(new Error(`${id} not found.`))
    )
    bibliographyService.findMany.mockImplementation((ids: string[]) =>
      Promise.reject(new Error(`${ids} not found.`))
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

  describe('update edition', () => {
    const edition = {
      transliteration: '1. kur',
      notes: 'notes',
      introduction: 'Introductory @i{text}',
    }

    beforeEach(async () => {
      fragmentRepository.updateEdition.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateEdition(fragment.number, edition)
    })

    test('Returns updated fragment', () => expect(result).toEqual(fragment))
    test('Finds correct fragment', () => {
      expect(fragmentRepository.updateEdition).toHaveBeenCalledWith(
        fragment.number,
        edition
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

  describe('fetch colophon names', () => {
    beforeEach(async () => {
      fragmentRepository.fetchColophonNames.mockReturnValue(
        Promise.resolve(colophonNamesOptions)
      )
      colophonNamesResult = await fragmentService.fetchColophonNames('u')
    })
    test('returns names', () =>
      expect(colophonNamesResult).toEqual(colophonNamesOptions))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.fetchColophonNames).toHaveBeenCalled())
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
      result = await fragmentService.updateDate(fragment.number, date.toDto())
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateDate).toHaveBeenCalledWith(
        fragment.number,
        date.toDto()
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
        datesInText.filter((date) => date).map((date) => date.toDto())
      )
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateDatesInText).toHaveBeenCalledWith(
        fragment.number,
        datesInText.filter((date) => date).map((date) => date.toDto())
      ))
  })

  describe('update archaeology', () => {
    let expectedFragment: Fragment

    beforeEach(async () => {
      archaeology = archaeologyFactory.build()
      archaeologyDto = toArchaeologyDto(archaeology)
      expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
        draft.archaeology = castDraft(archaeology)
      })
      fragmentRepository.updateArchaeology.mockReturnValue(
        Promise.resolve(expectedFragment)
      )
      result = await fragmentService.updateArchaeology(
        fragment.number,
        archaeologyDto
      )
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateArchaeology).toHaveBeenCalledWith(
        fragment.number,
        archaeologyDto
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
  MockLemmatizationFactory.mockImplementation(() => ({ createLemmatization }))

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
  const manuscriptAttestation = manuscriptAttestationFactory.build(
    {},
    { transient: { museumNumber: 'K.1' } }
  )
  const uncertainFragmentAttestation = uncertainFragmentAttestationFactory.build()
  let result: {
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }
  const testData = {
    manuscriptAttestations: [manuscriptAttestation],
    uncertainFragmentAttestations: [uncertainFragmentAttestation],
  }
  beforeEach(async () => {
    fragmentRepository.findInCorpus.mockReturnValue(Promise.resolve(testData))
    result = await fragmentService.findInCorpus(number)
  })
  test('returns attestation data', () => expect(result).toEqual(testData))
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

describe('Query by traditional references', () => {
  const fragment = fragmentFactory.build({ traditionalReferences: ['text 1'] })
  const returnData = {
    items: [
      { traditionalReference: 'text 1', fragmentNumbers: [fragment.number] },
    ],
  }
  const expected = Promise.resolve(returnData)
  let result
  beforeEach(async () => {
    fragmentRepository.queryByTraditionalReferences.mockReturnValue(
      Promise.resolve(returnData)
    )
    result = fragmentService.queryByTraditionalReferences(['text 1'])
  })
  test('returns traditional reference to fragment numbers mapping data', () =>
    expect(result).toEqual(expected))
  test('calls repository with correct parameters', () =>
    expect(
      fragmentRepository.queryByTraditionalReferences
    ).toHaveBeenCalledWith(['text 1']))
})
