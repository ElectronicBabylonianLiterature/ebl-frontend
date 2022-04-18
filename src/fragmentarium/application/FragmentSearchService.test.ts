import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentSearchService from './FragmentSearchService'

const resultStub = {}
const fragmentRepository = {
  random: jest.fn(),
  interesting: jest.fn(),
  fetchLatestTransliterations: jest.fn(),
  fetchNeedsRevision: jest.fn(),
  searchFragmentarium: jest.fn(),
}

const fragmentSearchService = new FragmentSearchService(fragmentRepository)
const testData: TestData[] = [
  [
    'random',
    [],
    fragmentRepository.random,
    resultStub,
    null,
    Promise.resolve([resultStub]),
  ],
  [
    'interesting',
    [],
    fragmentRepository.interesting,
    resultStub,
    null,
    Promise.resolve([resultStub]),
  ],

  [
    'searchFragmentarium',
    ['K.1', '', '', ''],
    fragmentRepository.searchFragmentarium,
    resultStub,
  ],
  [
    'searchFragmentarium',
    ['', 'kur', '', ''],
    fragmentRepository.searchFragmentarium,
    resultStub,
  ],
  [
    'fetchLatestTransliterations',
    [],
    fragmentRepository.fetchLatestTransliterations,
    resultStub,
  ],
  ['fetchNeedsRevision', [], fragmentRepository.fetchNeedsRevision, resultStub],
]

testDelegation(fragmentSearchService, testData)
