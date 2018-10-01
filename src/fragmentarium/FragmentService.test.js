import Promise from 'bluebird'
import { testDelegation } from 'testHelpers'
import FragmentService from './FragmentService'

const resultStub = {}
const auth = {
  applicationScopes: {
    readFragments: 'read:fragments',
    transliterateFragments: 'transliterate:fragments'
  },
  isAllowedTo: jest.fn()
}
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  random: jest.fn(),
  interesting: jest.fn(),
  searchNumber: jest.fn(),
  searchTransliteration: jest.fn(),
  updateTransliteration: jest.fn()
}
const imageRepository = {
  find: jest.fn()
}
const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository)

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
  ['findFolio', [{ name: 'AKG', number: '375' }], imageRepository.find, resultStub, ['AKG_375.jpg']],
  ['isAllowedToRead', [], auth.isAllowedTo, true, [auth.applicationScopes.readFragments]],
  ['isAllowedToTransliterate', [], auth.isAllowedTo, true, [auth.applicationScopes.transliterateFragments]]
]

testDelegation(fragmentService, testData)
