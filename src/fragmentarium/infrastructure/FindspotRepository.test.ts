import { findspotFactory } from 'test-support/fragment-data-fixtures'
import { ApiFindspotRepository } from './FindspotRepository'
import { testDelegation, TestData } from 'test-support/utils'
import {
  fromFindspotDto,
  toFindspotDto,
} from 'fragmentarium/domain/archaeologyDtos'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
  fetchBlob: jest.fn(),
}
const findspotRepository = new ApiFindspotRepository(apiClient)
const expectedFindspots = findspotFactory
  .buildList(3)
  .map((findspot) => fromFindspotDto(toFindspotDto(findspot)))
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

const testData: TestData<ApiFindspotRepository>[] = [
  new TestData(
    'fetchFindspots',
    [],
    apiClient.fetchJson,
    expectedFindspots,
    ['/findspots', false],
    Promise.resolve(expectedFindspots.map(toFindspotDto)),
  ),
  new TestData(
    'fetchMapData',
    ['ASSUR'],
    apiClient.fetchJson,
    expectedMapData,
    ['/findspots/map-data?site=ASSUR', false],
    Promise.resolve({
      findspots: [
        ...expectedMapData,
        { ...expectedMapData[0], findspotId: 124, polygonIds: [] },
      ],
    }),
  ),
]

testDelegation(findspotRepository, testData)
