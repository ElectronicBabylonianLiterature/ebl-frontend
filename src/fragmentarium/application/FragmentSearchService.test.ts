import Promise from 'bluebird'
import { createScript } from 'fragmentarium/infrastructure/FragmentRepository'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentSearchService from './FragmentSearchService'

const resultStub = {
  script: { period: 'None', periodModifier: 'None', uncertain: false },
}
const expectedResultStub = { script: createScript(resultStub.script) }
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
    expectedResultStub,
    null,
    Promise.resolve([resultStub])
  ),
  new TestData(
    'interesting',
    [],
    fragmentRepository.interesting,
    expectedResultStub,
    null,
    Promise.resolve([resultStub])
  ),
  new TestData(
    'searchFragmentarium',
    ['K.1', '', '', '', 0],
    fragmentRepository.searchFragmentarium,
    resultStub
  ),
  new TestData(
    'searchFragmentarium',
    ['', 'kur', '', '', 0],
    fragmentRepository.searchFragmentarium,
    resultStub
  ),
  new TestData(
    'fetchLatestTransliterations',
    [],
    fragmentRepository.fetchLatestTransliterations,
    [expectedResultStub],
    null,
    Promise.resolve([resultStub])
  ),
  new TestData(
    'fetchNeedsRevision',
    [],
    fragmentRepository.fetchNeedsRevision,
    [expectedResultStub],
    null,
    Promise.resolve([resultStub])
  ),
]

testDelegation(fragmentSearchService, testData)
