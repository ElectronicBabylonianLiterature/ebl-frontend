// @flow
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { testDelegation } from '../test-helpers/utils'
import FragmentService from './FragmentService'
import Lemmatization, {
  LemmatizationToken
} from './lemmatization/Lemmatization'
import Lemma from './lemmatization/Lemma'
import { Folio } from './fragment'
import { Text } from './text'

const resultStub = {}
const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  random: jest.fn(),
  interesting: jest.fn(),
  searchNumber: jest.fn(),
  searchTransliteration: jest.fn(),
  updateTransliteration: jest.fn(),
  updateLemmatization: jest.fn(),
  updateReferences: jest.fn(),
  folioPager: jest.fn(),
  findLemmas: jest.fn(),
  fetchLatestTransliterations: jest.fn(),
  fetchNeedsRevision: jest.fn()
}
const wordRepository = {
  searchLemma: jest.fn(),
  find: jest.fn()
}
const imageRepository = {
  find: jest.fn()
}
const bibliographyService = {
  find: jest.fn(),
  search: jest.fn()
}
const fragmentService = new FragmentService(
  fragmentRepository,
  imageRepository,
  wordRepository,
  bibliographyService
)
const testData = [
  ['statistics', [], fragmentRepository.statistics, resultStub],
  [
    'updateTransliteration',
    ['K.1', '1. kur', 'notes'],
    fragmentRepository.updateTransliteration,
    resultStub
  ],
  [
    'updateLemmatization',
    ['K.1', [[{ value: 'kur', uniqueLemma: [] }]]],
    fragmentRepository.updateLemmatization,
    resultStub
  ],
  [
    'updateReferences',
    [
      'K.1',
      [[{ id: 'id', type: 'EDITION', notes: '', pages: '', linesCited: [] }]]
    ],
    fragmentRepository.updateReferences,
    resultStub
  ],
  [
    'findFolio',
    [folio],
    imageRepository.find,
    resultStub,
    [folio.fileName, true]
  ],
  [
    'findImage',
    [fileName],
    imageRepository.find,
    resultStub,
    [fileName, false]
  ],
  ['folioPager', [folio, 'K.1'], fragmentRepository.folioPager, resultStub],
  ['searchLemma', ['lemma'], wordRepository.searchLemma, [resultStub]],
  [
    'searchBibliography',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyService.search,
    [resultStub]
  ]
]

testDelegation(fragmentService, testData)

describe.each(['searchLemma'])('%s', method => {
  test('Resolves to empty array on zero length query', async () => {
    await expect(fragmentService[method]('')).resolves.toEqual([])
  })
})

describe('find', () => {
  const number = 'K.1'
  let expectedFragment
  let result

  beforeEach(async () => {
    const { entries, references, expectedReferences } = await setUpHydration()
    const fragment = await factory.build('fragment', {
      number: number,
      references: references
    })

    fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
    bibliographyService.find.mockImplementation(id =>
      Promise.resolve(entries.find(entry => entry.id === id))
    )

    expectedFragment = fragment.setReferences(expectedReferences)

    result = await fragmentService.find(fragment.number)
  })

  test('Returns hydrated fragment', () =>
    expect(result).toEqual(expectedFragment))
  test('Finds correct fragment', () =>
    expect(fragmentRepository.find).toHaveBeenCalledWith(number))
})

test('createLemmatization', async () => {
  const words = await factory.buildMany('word', 4)
  const wordMap = _.keyBy(words, '_id')
  const suggestions = {
    kur: words[2],
    nu: words[3]
  }
  const text = new Text({
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: [words[0]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true,
            erasure: 'NONE'
          },
          {
            type: 'Word',
            value: 'nu',
            uniqueLemma: [words[1]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true,
            erasure: 'NONE'
          }
        ]
      }
    ]
  })
  wordRepository.find.mockImplementation(id =>
    wordMap[id] ? Promise.resolve(wordMap[id]) : Promise.reject(new Error())
  )
  fragmentRepository.findLemmas.mockImplementation(word =>
    Promise.resolve(suggestions[word] ? [[suggestions[word]]] : [])
  )

  const expectedLemmas = _([words[0], words[1]])
    .map(word => new Lemma(word))
    .keyBy('value')
    .value()
  const expectedSuggestions = _.mapValues(suggestions, word => [
    [new Lemma(word)]
  ])
  const expected = new Lemmatization(
    ['1.'],
    [
      [
        new LemmatizationToken(
          'kur',
          true,
          [new Lemma(words[0])],
          [[new Lemma(words[2])]]
        ),
        new LemmatizationToken(
          'nu',
          true,
          [new Lemma(words[1])],
          [[new Lemma(words[3])]]
        )
      ]
    ]
  )

  jest.spyOn(text, 'createLemmatization')
  text.createLemmatization.mockReturnValue(expected)

  const result = await fragmentService.createLemmatization(text)
  expect(result).toEqual(expected)
  expect(text.createLemmatization).toHaveBeenCalledWith(
    expectedLemmas,
    expectedSuggestions
  )
})

test('hydrateReferences', async () => {
  const { references, expectedReferences } = await setUpHydration()
  await expect(fragmentService.hydrateReferences(references)).resolves.toEqual(
    expectedReferences
  )
})

async function setUpHydration() {
  const entries = await factory.buildMany('bibliographyEntry', 2)
  const references = await factory.buildMany(
    'referenceDto',
    2,
    entries.map(entry => ({ id: entry.id }))
  )
  const expectedReferences = await factory.buildMany(
    'reference',
    2,
    references.map((dto, index) => ({
      ...dto,
      document: entries[index]
    }))
  )
  bibliographyService.find.mockImplementation(id =>
    Promise.resolve(entries.find(entry => entry.id === id))
  )
  return {
    entries,
    references,
    expectedReferences
  }
}
