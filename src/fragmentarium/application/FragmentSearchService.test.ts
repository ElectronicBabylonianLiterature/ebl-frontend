import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentSearchService from './FragmentSearchService'

const resultStub = {}
const fragmentRepository = {
  random: jest.fn(),
  interesting: jest.fn(),
  searchReference: jest.fn(),
  fetchLatestTransliterations: jest.fn(),
  fetchNeedsRevision: jest.fn(),
  searchFragmentarium: jest.fn(),
}

const fragmentSearchService = new FragmentSearchService(fragmentRepository)
const testData: TestData<FragmentSearchService>[] = [
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
    'searchFragmentarium',
    ['K.1', '', '', ''],
    fragmentRepository.searchFragmentarium,
    resultStub
  ),
  new TestData(
    'searchFragmentarium',
    ['', 'kur', '', ''],
    fragmentRepository.searchFragmentarium,
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
