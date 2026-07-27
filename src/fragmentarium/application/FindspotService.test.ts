import { findspotFactory } from 'test-support/fragment-data-fixtures'
import { FindspotService } from './FindspotService'
import { testDelegation, TestData } from 'test-support/utils'

const findspotRepository = {
  fetchFindspots: jest.fn(),
  fetchAssurMapData: jest.fn(),
}
const findspotService = new FindspotService(findspotRepository)
const expectedFindspots = findspotFactory.buildList(3)
const expectedMapData = [
  {
    findspotId: 123,
    siteId: 'ASSUR',
    siteName: 'Aššur',
    polygonIds: ['assur-area-a-checksum'],
    accessibleFragmentCount: 18,
    locationPrecision: 'excavation-area' as const,
    matchMethod: 'verified-source' as const,
    sector: null,
    area: 'Area A',
    building: null,
    room: null,
  },
]

const testData: TestData<FindspotService>[] = [
  new TestData(
    'fetchFindspots',
    [],
    findspotRepository.fetchFindspots,
    expectedFindspots,
    null,
    Promise.resolve(expectedFindspots),
  ),
  new TestData(
    'fetchAssurMapData',
    [],
    findspotRepository.fetchAssurMapData,
    expectedMapData,
    null,
    Promise.resolve(expectedMapData),
  ),
]

testDelegation(findspotService, testData)
