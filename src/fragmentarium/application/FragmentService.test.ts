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
import setUpReferences from 'test-support/setUpReferences'
import produce, { castDraft, Draft } from 'immer'
import { Genres } from 'fragmentarium/domain/Genres'
import Word from 'dictionary/domain/Word'
import LemmatizationFactory from './LemmatizationFactory'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import { fragmentFactory } from 'test-support/fragment-fixtures'

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
const word: Word = {
  _id: 'aklu I',
  lemma: ['aklu'],
  homonym: 'I',
  guideWord: 'test',
  oraccWords: [],
  pos: [],
}
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  updateTransliteration: jest.fn(),
  updateLemmatization: jest.fn(),
  fetchGenres: jest.fn(),
  updateGenres: jest.fn(),
  updateReferences: jest.fn(),
  folioPager: jest.fn(),
  fragmentPager: jest.fn(),
  findLemmas: jest.fn(),
  fetchCdliInfo: jest.fn(),
  findAnnotations: jest.fn(),
  updateAnnotations: jest.fn(),
  lineToVecRanking: jest.fn(),
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
const testData: TestData[] = [
  ['statistics', [], fragmentRepository.statistics, resultStub],
  [
    'lineToVecRanking',
    ['X.0'],
    fragmentRepository.lineToVecRanking,
    resultStub,
  ],
  ['findFolio', [folio], imageRepository.findFolio, resultStub, [folio]],
  ['findImage', [fileName], imageRepository.find, resultStub, [fileName]],
  [
    'findPhoto',
    [fragment],
    imageRepository.findPhoto,
    resultStub,
    [fragment.number],
  ],
  ['folioPager', [folio, 'K.1'], fragmentRepository.folioPager, resultStub],
  ['fragmentPager', ['K.1'], fragmentRepository.fragmentPager, resultStub],
  ['searchLemma', ['lemma'], wordRepository.searchLemma, [resultStub]],
  [
    'searchBibliography',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyService.search,
    [resultStub],
  ],
  [
    'fetchCdliInfo',
    [fragment],
    fragmentRepository.fetchCdliInfo,
    resultStub,
    [fragment.cdliNumber],
  ],
  [
    'findAnnotations',
    [fragment.number],
    fragmentRepository.findAnnotations,
    resultStub,
  ],
  [
    'updateAnnotations',
    [fragment.number, resultStub],
    fragmentRepository.updateAnnotations,
    resultStub,
  ],
  [
    'findSuggestions',
    ['kur', true],
    fragmentRepository.findLemmas,
    [[new Lemma(word)]],
    ['kur', true],
    Promise.resolve([[word]]),
  ],
]

testDelegation(fragmentService, testData)

describe.each(['searchLemma'])('%s', (method) => {
  test('Resolves to empty array on zero length query', async () => {
    await expect(fragmentService[method]('')).resolves.toEqual([])
  })
})

describe('methods returning hydrated fragment', () => {
  const number = 'K.1'
  let fragment: Fragment
  let expectedFragment: Fragment
  let result: Fragment
  let genreResult: string[][]
  const genreOptions = [['ARCHIVE', 'Administrative']]
  const genres: Genres = Genres.fromJson([
    {
      category: ['ARCHIVE', 'Administrative'],
      uncertain: false,
    },
  ])

  beforeEach(() => {
    const { entries, references, expectedReferences } = setUpReferences(
      bibliographyService
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
    bibliographyService.find.mockImplementation((id) => {
      const entry = entries.find((entry) => entry.id === id)
      return entry
        ? Promise.resolve(entry)
        : Promise.reject(new Error(`${id} not found.`))
    })

    expectedFragment = fragment.setReferences(expectedReferences)
  })

  describe('find', () => {
    beforeEach(async () => {
      fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
      result = await fragmentService.find(fragment.number)
    })

    test('Returns hydrated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.find).toHaveBeenCalledWith(number))
  })

  describe('update transliteration', () => {
    const transliteration = '1. kur'
    const notes = 'notes'

    beforeEach(async () => {
      fragmentRepository.updateTransliteration.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateTransliteration(
        fragment.number,
        transliteration,
        notes
      )
    })

    test('Returns hydrated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateTransliteration).toHaveBeenCalledWith(
        fragment.number,
        transliteration,
        notes
      ))
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
    beforeEach(async () => {
      expectedFragment = produce(expectedFragment, (draft: Draft<Fragment>) => {
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

    test('Returns hydrated fragment', () =>
      expect(result).toEqual(expectedFragment))
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

    test('Returns hydrated fragment', () =>
      expect(result).toEqual(expectedFragment))
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
