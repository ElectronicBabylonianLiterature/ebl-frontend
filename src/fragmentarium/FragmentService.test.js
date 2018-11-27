import Promise from 'bluebird'
import { testDelegation } from 'testHelpers'
import FragmentService from './FragmentService'
import createFolio from 'fragmentarium/createFolio'

const resultStub = {}
const folio = createFolio('AKG', '375')
const auth = {
  isAllowedToReadFragments: jest.fn(),
  isAllowedToTransliterateFragments: jest.fn(),
  isAllowedToLemmatizeFragments: jest.fn()
}
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  random: jest.fn(),
  interesting: jest.fn(),
  searchNumber: jest.fn(),
  searchTransliteration: jest.fn(),
  updateTransliteration: jest.fn(),
  updateLemmatization: jest.fn(),
  folioPager: jest.fn()
}
const wordRepository = {
  searchLemma: jest.fn()
}
const imageRepository = {
  find: jest.fn()
}
const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository, wordRepository)

const testData = [
  ['statistics', [], fragmentRepository.statistics, resultStub],
  ['find', ['K.1'], fragmentRepository.find, resultStub],
  ['random', [], fragmentRepository.random, resultStub, null, Promise.resolve([resultStub])],
  ['interesting', [], fragmentRepository.interesting, resultStub, null, Promise.resolve([resultStub])],
  ['random', [], fragmentRepository.random, undefined, null, Promise.resolve([])],
  ['interesting', [], fragmentRepository.interesting, undefined, null, Promise.resolve([])],
  ['searchNumber', ['K.1'], fragmentRepository.searchNumber, resultStub],
  ['searchTransliteration', ['kur'], fragmentRepository.searchTransliteration, resultStub],
  ['updateTransliteration', ['K.1', '1. kur', 'notes'], fragmentRepository.updateTransliteration, resultStub],
  ['updateLemmatization', ['K.1', [[{ value: 'kur', uniqueLemma: null }]]], fragmentRepository.updateLemmatization, resultStub],
  ['findFolio', [folio], imageRepository.find, resultStub, [folio.fileName]],
  ['isAllowedToRead', [], auth.isAllowedToReadFragments, true],
  ['isAllowedToTransliterate', [], auth.isAllowedToTransliterateFragments, true],
  ['isAllowedToLemmatize', [], auth.isAllowedToLemmatizeFragments, true],
  ['folioPager', [folio, 'K.1'], fragmentRepository.folioPager, resultStub],
  ['searchLemma', ['lemma'], wordRepository.searchLemma, [resultStub]]
]

testDelegation(fragmentService, testData)
