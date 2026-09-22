import { findspotFactory } from 'test-support/fragment-data-fixtures'
import { FindspotService } from './FindspotService'
import { testDelegation, TestData } from 'test-support/utils'

const findspotRepository = {
  fetchFindspots: jest.fn(),
  fetchMapData: jest.fn(),
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
    'fetchMapData',
    ['assur'],
    findspotRepository.fetchMapData,
    expectedMapData,
    ['ASSUR'],
    Promise.resolve(expectedMapData),
  ),
]

testDelegation(findspotService, testData)

describe('map-data site support', () => {
  it.each([
    ['assur', 'ASSUR'],
    ['kalhu', 'KALHU'],
    ['nippur', 'NIPPUR'],
    ['uruk', 'URUK'],
  ])('maps %s to the verified backend site %s', async (siteId, siteParam) => {
    findspotRepository.fetchMapData.mockResolvedValueOnce(expectedMapData)

    await findspotService.fetchMapData(siteId)

    expect(findspotRepository.fetchMapData).toHaveBeenLastCalledWith(siteParam)
  })

  it('rejects an unknown site without calling the repository', async () => {
    findspotRepository.fetchMapData.mockClear()

    await expect(findspotService.fetchMapData('babylon')).rejects.toThrow(
      'No map-data endpoint is configured',
    )
    expect(findspotRepository.fetchMapData).not.toHaveBeenCalled()
  })
})
