import { findspotFactory } from 'test-support/fragment-data-fixtures'
import { FindspotService } from './FindspotService'
import { testDelegation, TestData } from 'test-support/utils'

const findspotRepository = {
  fetchFindspots: jest.fn(),
}
const findspotService = new FindspotService(findspotRepository)
const expectedFindspots = findspotFactory.buildList(3)

const testData: TestData<FindspotService>[] = [
  new TestData(
    'fetchFindspots',
    [],
    findspotRepository.fetchFindspots,
    expectedFindspots,
    null,
    Promise.resolve(expectedFindspots),
  ),
]

testDelegation(findspotService, testData)
