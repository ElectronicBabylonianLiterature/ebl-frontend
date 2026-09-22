import { findspotFactory } from 'test-support/fragment-data-fixtures'
import { ApiFindspotRepository } from './FindspotRepository'
import { testDelegation, TestData } from 'test-support/utils'
import {
  fromFindspotDto,
  toFindspotDto,
} from 'fragmentarium/domain/archaeologyDtos'
import { IncompatibleFindspotMapDataError } from 'map/findspotMapDataSanitizer'

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
    Promise.resolve({ findspots: expectedMapData }),
  ),
]

testDelegation(findspotRepository, testData)

describe('fetchMapData compatibility', () => {
  beforeEach(() => jest.clearAllMocks())

  it.each([
    ['ASSUR', 'Aššur'],
    ['KALHU', 'Kalḫu'],
    ['NIPPUR', 'Nippur'],
    ['URUK', 'Uruk'],
  ])('maps exact verified site contract %s', async (siteId, siteName) => {
    const row = {
      ...expectedMapData[0],
      siteId,
      siteName,
      polygonIds: [`${siteId.toLowerCase()}-area-a-checksum`],
    }
    apiClient.fetchJson.mockResolvedValueOnce({ findspots: [row] })

    await expect(findspotRepository.fetchMapData(siteId)).resolves.toEqual([
      row,
    ])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      `/findspots/map-data?site=${siteId}`,
      false,
    )
  })

  it('rejects a noncanonical site without making a request', async () => {
    await expect(
      findspotRepository.fetchMapData('assur'),
    ).rejects.toBeInstanceOf(IncompatibleFindspotMapDataError)
    expect(apiClient.fetchJson).not.toHaveBeenCalled()
  })

  it.each([
    {},
    { findspots: 'not-array' },
    {
      findspots: [
        ...expectedMapData,
        { ...expectedMapData[0], findspotId: 124, polygonIds: [] },
      ],
    },
  ])('rejects malformed response %#', async (response) => {
    apiClient.fetchJson.mockResolvedValueOnce(response)

    await expect(
      findspotRepository.fetchMapData('ASSUR'),
    ).rejects.toBeInstanceOf(IncompatibleFindspotMapDataError)
  })
})
