import { findspotFactory } from 'test-support/fragment-fixtures'
import { FindspotService } from './FindspotService'
import { testDelegation, TestData } from 'test-support/utils'

const findspotRespository = {
  fetchFindspots: jest.fn(),
}
const findspotService = new FindspotService(findspotRespository)
const expectedFindspots = findspotFactory.buildList(3)

const testData: TestData<FindspotService>[] = [
  new TestData(
    'fetchFindspots',
    [],
    findspotRespository.fetchFindspots,
    expectedFindspots,
    null,
    Promise.resolve(expectedFindspots)
  ),
]

testDelegation(findspotService, testData)
