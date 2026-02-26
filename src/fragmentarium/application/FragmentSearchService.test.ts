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
  fetchNeedsRevision: jest.fn(),
}

const fragmentSearchService = new FragmentSearchService(fragmentRepository)
const testData: TestData<FragmentSearchService>[] = [
  new TestData(
    'random',
    [],
    fragmentRepository.random,
    expectedResultStub,
    null,
    Promise.resolve([expectedResultStub]),
  ),
  new TestData(
    'interesting',
    [],
    fragmentRepository.interesting,
    expectedResultStub,
    null,
    Promise.resolve([expectedResultStub]),
  ),
  new TestData(
    'fetchNeedsRevision',
    [],
    fragmentRepository.fetchNeedsRevision,
    [expectedResultStub],
    null,
    Promise.resolve([expectedResultStub]),
  ),
]

testDelegation(fragmentSearchService, testData)
