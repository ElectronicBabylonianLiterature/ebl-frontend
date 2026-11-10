import { FindspotService } from 'fragmentarium/application/FindspotService'
import { findspotMapDataDto } from 'test-support/map-fixtures'

it('forwards the caller cancellation signal with the canonical backend site', async () => {
  const expected = [findspotMapDataDto()]
  const repository = {
    fetchFindspots: jest.fn(),
    fetchMapData: jest.fn().mockResolvedValue(expected),
  }
  const controller = new AbortController()
  const service = new FindspotService(repository)

  await expect(
    service.fetchMapData('assur', controller.signal),
  ).resolves.toEqual(expected)
  expect(repository.fetchMapData).toHaveBeenCalledWith(
    'ASSUR',
    controller.signal,
  )
})
