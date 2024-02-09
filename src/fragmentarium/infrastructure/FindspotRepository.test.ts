import { findspotFactory } from 'test-support/fragment-fixtures'
import { ApiFindspotRepository } from './FindspotRepository'
import { testDelegation, TestData } from 'test-support/utils'
import { toFindspotDto } from 'fragmentarium/domain/archaeologyDtos'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
}
const findspotRepository = new ApiFindspotRepository(apiClient)
const expectedFindspots = findspotFactory.buildList(3)

const testData: TestData<ApiFindspotRepository>[] = [
  new TestData(
    'fetchFindspots',
    [],
    apiClient.fetchJson,
    expectedFindspots,
    ['/findspots', false],
    Promise.resolve(expectedFindspots.map(toFindspotDto))
  ),
]

testDelegation(findspotRepository, testData)
