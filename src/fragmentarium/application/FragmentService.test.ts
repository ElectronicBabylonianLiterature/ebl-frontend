import Promise from 'bluebird'
import Folio from 'fragmentarium/domain/Folio'
import { fragment } from 'test-support/test-fragment'
import createLemmatizationTestText from 'test-support/test-text'
import { TestData, testDelegation } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization from 'transliteration/domain/Lemmatization'
import FragmentService from './FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { produce, Draft } from 'immer'
import Word from 'dictionary/domain/Word'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import LemmatizationFactory from './LemmatizationFactory'
import {
  fragmentFactory,
  manuscriptAttestationFactory,
  uncertainFragmentAttestationFactory,
} from 'test-support/fragment-fixtures'
import { wordFactory } from 'test-support/word-fixtures'
import { Text } from 'transliteration/domain/text'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import {
  bibliographyService,
  fragmentRepository,
  fragmentService,
  imageRepository,
  resultStub,
  wordRepository,
} from 'fragmentarium/application/fragmentService.testSupport'

jest.mock('./LemmatizationFactory')

const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
const word: Word = wordFactory.build()
const lemmaSuggestions = new Map([['foo', new LemmaOption(word)]])

const testData: TestData<FragmentService>[] = [
  new TestData('statistics', [], fragmentRepository.statistics, resultStub),
  new TestData(
    'lineToVecRanking',
    ['X.0'],
    fragmentRepository.lineToVecRanking,
    resultStub,
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
    [fragment.number, 'small'],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'folioPager',
    [folio, 'K.1'],
    fragmentRepository.folioPager,
    resultStub,
  ),
  new TestData(
    'fragmentPager',
    ['K.1'],
    fragmentRepository.fragmentPager,
    resultStub,
  ),
  new TestData('searchLemma', ['lemma'], wordRepository.searchLemma, [
    resultStub,
  ]),
  new TestData(
    'searchBibliography',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyService.search,
    [resultStub],
  ),
  new TestData(
    'findAnnotations',
    [fragment.number, false],
    fragmentRepository.findAnnotations,
    resultStub,
  ),
  new TestData(
    'generateAnnotations',
    [fragment.number, true],
    fragmentRepository.findAnnotations,
    resultStub,
  ),
  new TestData(
    'updateAnnotations',
    [fragment.number, resultStub],
    fragmentRepository.updateAnnotations,
    resultStub,
    undefined,
    Promise.resolve(resultStub),
  ),
  new TestData(
    'findSuggestions',
    ['kur', true],
    fragmentRepository.findLemmas,
    [[new Lemma(word)]],
    ['kur', true],
    Promise.resolve([[word]]),
  ),
  new TestData(
    'listAllFragments',
    [],
    fragmentRepository.listAllFragments,
    [],
    [],
    Promise.resolve([]),
  ),
  new TestData(
    'collectLemmaSuggestions',
    ['K.1'],
    fragmentRepository.collectLemmaSuggestions,
    lemmaSuggestions,
    ['K.1'],
    Promise.resolve(lemmaSuggestions),
  ),
]

testDelegation(fragmentService, testData)

describe.each(['searchLemma'])('%s', (method) => {
  test('Resolves to empty array on zero length query', async () => {
    await expect(fragmentService[method]('')).resolves.toEqual([])
  })
})

describe('findPhoto', () => {
  test("throws when fragment doesn't have a photo", () => {
    const fragmentWithoutPhoto = produce(
      fragmentFactory.build({ number: 'X.1' }),
      (draft: Draft<Fragment>) => {
        draft.hasPhoto = false
      },
    )

    expect(() => fragmentService.findPhoto(fragmentWithoutPhoto)).toThrowError(
      "Fragment X.1 doesn't have a Photo",
    )
  })
})

describe('isInFragmentarium', () => {
  test('returns true when repository find does not throw synchronously', () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))

    expect(fragmentService.isInFragmentarium('K.1')).toBe(true)
  })

  test('returns false when repository find throws synchronously', () => {
    fragmentRepository.find.mockImplementation(() => {
      throw new Error('not found')
    })

    expect(fragmentService.isInFragmentarium('K.404')).toBe(false)
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
    wordRepository,
  )
  expect(createLemmatization).toBeCalledWith(text)
  expect(result).toEqual(lemmatization)
})

describe('search for fragment in corpus', () => {
  const number = 'K.1'
  const manuscriptAttestation = manuscriptAttestationFactory.build(
    {},
    { transient: { museumNumber: 'K.1' } },
  )
  const uncertainFragmentAttestation =
    uncertainFragmentAttestationFactory.build()
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
