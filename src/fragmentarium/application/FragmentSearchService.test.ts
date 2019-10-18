import Promise from 'bluebird'
import { testDelegation } from 'test-helpers/utils'
import FragmentSearchService from './FragmentSearchService'

const resultStub = {}
const fragmentRepository = {
  random: jest.fn(),
  interesting: jest.fn(),
  searchNumber: jest.fn(),
  searchTransliteration: jest.fn(),
  fetchLatestTransliterations: jest.fn(),
  fetchNeedsRevision: jest.fn()
}

const fragmentSearchService = new FragmentSearchService(fragmentRepository)
const testData = [
  [
    'random',
    [],
    fragmentRepository.random,
    resultStub,
    null,
    Promise.resolve([resultStub])
  ],
  [
    'interesting',
    [],
    fragmentRepository.interesting,
    resultStub,
    null,
    Promise.resolve([resultStub])
  ],
  [
    'random',
    [],
    fragmentRepository.random,
    undefined,
    null,
    Promise.resolve([])
  ],
  [
    'interesting',
    [],
    fragmentRepository.interesting,
    undefined,
    null,
    Promise.resolve([])
  ],
  ['searchNumber', ['K.1'], fragmentRepository.searchNumber, resultStub],
  [
    'searchTransliteration',
    ['kur'],
    fragmentRepository.searchTransliteration,
    resultStub
  ],
  [
    'fetchLatestTransliterations',
    [],
    fragmentRepository.fetchLatestTransliterations,
    resultStub
  ],
  ['fetchNeedsRevision', [], fragmentRepository.fetchNeedsRevision, resultStub]
]

testDelegation(fragmentSearchService, testData)
