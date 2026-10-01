import { createScript } from 'fragmentarium/infrastructure/FragmentRepository'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

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
    [undefined],
    Promise.resolve([expectedResultStub]),
  ),
  new TestData(
    'interesting',
    [],
    fragmentRepository.interesting,
    expectedResultStub,
    [undefined],
    Promise.resolve([expectedResultStub]),
  ),
  new TestData(
    'fetchNeedsRevision',
    [],
    fragmentRepository.fetchNeedsRevision,
    [expectedResultStub],
    [undefined],
    Promise.resolve([expectedResultStub]),
  ),
]

testDelegation(fragmentSearchService, testData)

describe.each(['random', 'interesting'] as const)(
  '%s without results',
  (method) => {
    it('rejects when the repository finds no fragments', async () => {
      fragmentRepository[method].mockResolvedValueOnce([])

      await expect(fragmentSearchService[method]()).rejects.toThrow(
        'No fragments found.',
      )
    })
  },
)
