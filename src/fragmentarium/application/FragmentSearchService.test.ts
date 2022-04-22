import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentSearchService from './FragmentSearchService'

const resultStub = {}
const fragmentRepository = {
  random: jest.fn(),
  interesting: jest.fn(),
  searchNumber: jest.fn(),
  searchReference: jest.fn(),
  searchTransliteration: jest.fn(),
  fetchLatestTransliterations: jest.fn(),
  fetchNeedsRevision: jest.fn(),
}

const fragmentSearchService = new FragmentSearchService(fragmentRepository)
const testData: TestData[] = [
  new TestData(
    'random',
    [],
    fragmentRepository.random,
    resultStub,
    null,
    Promise.resolve([resultStub])
  ),
  new TestData(
    'interesting',
    [],
    fragmentRepository.interesting,
    resultStub,
    null,
    Promise.resolve([resultStub])
  ),
  new TestData(
    'searchNumber',
    ['K.1'],
    fragmentRepository.searchNumber,
    resultStub
  ),
  new TestData(
    'searchTransliteration',
    ['kur'],
    fragmentRepository.searchTransliteration,
    resultStub
  ),
  new TestData(
    'fetchLatestTransliterations',
    [],
    fragmentRepository.fetchLatestTransliterations,
    resultStub
  ),
  new TestData(
    'fetchNeedsRevision',
    [],
    fragmentRepository.fetchNeedsRevision,
    resultStub
  ),
]

testDelegation(fragmentSearchService, testData)
